import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getFAQs, createSupportTicket } from '@/lib/data';
import { ERROR_CODES } from '@/lib/error-data';
import { mongoSaveChatLog } from '@/lib/mongodb';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      history = [], 
      sessionId = `sess-${Date.now()}`, 
      userEmail = 'citizen@civicpulse.org',
      context 
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message text is required' }, { status: 400 });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // Load ground truth FAQs
    const faqs = await getFAQs();

    // 1. CHECK IF USER WANTS TO FILE A SUPPORT TICKET
    const ticketTriggers = [
      'create ticket', 'file ticket', 'support ticket', 'speak to a human',
      'contact support', 'human agent', 'talk to staff', 'file a ticket', 'open a ticket'
    ];
    const isExplicitTicketRequest = ticketTriggers.some((t) => lower.includes(t));

    if (isExplicitTicketRequest) {
      const ticket = await createSupportTicket({
        user_email: userEmail,
        subject: `Citizen inquiry via Assistant: ${trimmed.slice(0, 60)}...`,
        description: `Full chat inquiry from citizen (${userEmail}):\n"${trimmed}"\n\nSession ID: ${sessionId}`,
        priority: lower.includes('urgent') || lower.includes('danger') ? 'urgent' : 'medium',
        category: 'unresolved_inquiry',
        source: 'ai_assistant',
        chat_session_id: sessionId,
      });

      const responseText = `I have created a high-priority Municipal Support Ticket for you: **#${ticket.id}**.\n\nOur city dispatch supervisor desk has been notified and will follow up with you at **${userEmail}**. You can track this case anytime in your citizen portal.`;

      // Save to MongoDB
      await mongoSaveChatLog({
        sessionId,
        userEmail,
        messages: [
          ...history,
          { role: 'user', content: trimmed },
          { role: 'assistant', content: responseText },
        ],
        createdTicketId: ticket.id,
      });

      return NextResponse.json({
        success: true,
        reply: responseText,
        createdTicket: ticket,
        source: 'ticket_created',
      });
    }

    // 2. CHECK IF ASKING ABOUT AN ERROR CODE (e.g. 400, 401, 403, 404, 422, 429, 500, 503)
    const errorCodeMatch = trimmed.match(/\b(400|401|403|404|422|429|500|503)\b/);
    if (errorCodeMatch) {
      const codeNum = parseInt(errorCodeMatch[1], 10);
      const errInfo = ERROR_CODES[codeNum];
      if (errInfo) {
        const responseText = `### Error ${errInfo.code}: ${errInfo.name} (${errInfo.title})\n\n${errInfo.description}\n\n**Common Cause:** ${errInfo.cause}\n\n**Recommended Action:** ${errInfo.solution}\n\n*Would you like me to open a support ticket for this error?* Just say "File a ticket".`;

        await mongoSaveChatLog({
          sessionId,
          userEmail,
          messages: [
            ...history,
            { role: 'user', content: trimmed },
            { role: 'assistant', content: responseText },
          ],
        });

        return NextResponse.json({
          success: true,
          reply: responseText,
          source: 'error_code_explanation',
        });
      }
    }

    // 3. TRY TO ANSWER FROM FAQ DATA
    // Score FAQs based on keyword overlap
    let bestFaq: { faq: typeof faqs[0]; score: number } | null = null;
    for (const f of faqs) {
      let score = 0;
      const qWords = f.question.toLowerCase().split(/\s+/);
      const aWords = f.answer.toLowerCase().split(/\s+/);
      const userWords = lower.split(/\s+/);

      for (const w of userWords) {
        if (w.length <= 2) continue;
        if (qWords.some((qw) => qw.includes(w))) score += 3;
        if (f.keywords && f.keywords.some((k) => k.toLowerCase().includes(w))) score += 4;
        if (aWords.some((aw) => aw.includes(w))) score += 1;
      }

      if (!bestFaq || score > bestFaq.score) {
        bestFaq = { faq: f, score };
      }
    }

    // 4. IF GEMINI API KEY IS CONFIGURED, USE GEMINI WITH GROUNDED SYSTEM PROMPT
    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('placeholder')) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const faqContext = faqs.map((f, i) => `FAQ #${i + 1}: Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
        const errorContext = Object.values(ERROR_CODES)
          .map((e) => `Error ${e.code} (${e.name}): ${e.description} Solution: ${e.solution}`)
          .join('\n');

        const systemPrompt = `You are CivicPulse AI, the official intelligent municipal infrastructure assistant.
You answer citizen questions accurately based ONLY on the following official City FAQs and Error Code definitions.

OFFICIAL FAQS:
${faqContext}

OFFICIAL ERROR CODES:
${errorContext}

RULES:
1. Answer clearly, professionally, and concisely using the facts above.
2. If the user mentions any HTTP error code (400, 401, 403, 404, 422, 429, 500, 503), explain what it means in CivicPulse.
3. If the user question CANNOT be answered from the FAQs or Error Codes, reply politely that you cannot answer from official records and explicitly offer: "I can create an official support ticket for city staff to investigate. Would you like me to file a support ticket for you?"
4. Keep a courteous, public service tone.`;

        const prompt = `${systemPrompt}\n\nCitizen: "${trimmed}"\nCivicPulse AI:`;
        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        await mongoSaveChatLog({
          sessionId,
          userEmail,
          messages: [
            ...history,
            { role: 'user', content: trimmed },
            { role: 'assistant', content: reply },
          ],
        });

        return NextResponse.json({
          success: true,
          reply,
          source: 'gemini_grounded',
        });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, falling back to local FAQ engine:', geminiErr.message);
      }
    }

    // 5. LOCAL FAQ ENGINE FALLBACK
    if (bestFaq && bestFaq.score >= 3) {
      const reply = `${bestFaq.faq.answer}\n\n*(Source: Official CivicPulse FAQ: "${bestFaq.faq.question}")*`;

      await mongoSaveChatLog({
        sessionId,
        userEmail,
        messages: [
          ...history,
          { role: 'user', content: trimmed },
          { role: 'assistant', content: reply },
        ],
      });

      return NextResponse.json({
        success: true,
        reply,
        source: 'faq_match',
      });
    }

    // 6. CANNOT ANSWER -> AUTO CREATE SUPPORT TICKET
    const ticket = await createSupportTicket({
      user_email: userEmail,
      subject: `Unresolved Inquiry: ${trimmed.slice(0, 50)}...`,
      description: `The AI Assistant was unable to find an answer in official municipal FAQs for citizen inquiry:\n"${trimmed}"\n\nAutomatically escalated for municipal staff review.`,
      priority: 'medium',
      category: 'unresolved_inquiry',
      source: 'ai_assistant',
      chat_session_id: sessionId,
    });

    const fallbackReply = `I could not locate an official answer for that specific question in our municipal FAQ database.\n\nTo ensure your inquiry is resolved, I have automatically created an official Support Ticket for you: **#${ticket.id}**.\n\nA city operations supervisor will review this and contact you at **${userEmail}**. You can also reach our 311 municipal hotline during business hours.`;

    await mongoSaveChatLog({
      sessionId,
      userEmail,
      messages: [
        ...history,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: fallbackReply },
      ],
      createdTicketId: ticket.id,
    });

    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      createdTicket: ticket,
      source: 'auto_ticket_created',
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
