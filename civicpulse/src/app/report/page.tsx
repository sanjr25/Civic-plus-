'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  X, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  Info,
  Sparkles,
  ThumbsUp
} from 'lucide-react';
import LocationPicker from '@/components/map/LocationPicker';
import { 
  CATEGORY_METADATA, 
  IssueCategory, 
  IssuePriority, 
  Issue 
} from '@/types/database';
import { createIssue, getIssues, uploadImage } from '@/lib/data';
import { detectDuplicateIssues, calculatePriorityScore, DuplicateDetectionResult } from '@/lib/intelligence';
import { useAuth } from '@/lib/auth-context';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/States';

function SubmitIssueForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Form state
  const [category, setCategory] = useState<IssueCategory>(
    (searchParams.get('category') as IssueCategory) || 'pothole'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [latitude, setLatitude] = useState(47.6101);
  const [longitude, setLongitude] = useState(-122.3365);
  const [address, setAddress] = useState('1420 4th Ave & Pike St, Downtown');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitterName, setSubmitterName] = useState(user?.full_name || 'Elena Rostova');
  const [submitterEmail, setSubmitterEmail] = useState(user?.email || 'elena.rostova@civicpulse.org');

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Intelligence
  const [existingIssues, setExistingIssues] = useState<Issue[]>([]);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateDetectionResult>({
    hasPotentialDuplicate: false,
    duplicateScore: 0,
  });
  const [prioritySuggestion, setPrioritySuggestion] = useState<{
    priority: IssuePriority;
    justification: string;
  } | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIssueId, setSubmittedIssueId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    getIssues().then((data) => setExistingIssues(data));
  }, []);

  // Update duplicate detection when location, title, or category changes
  useEffect(() => {
    if (existingIssues.length > 0 && (title.length > 3 || description.length > 5)) {
      const result = detectDuplicateIssues(
        title,
        description,
        latitude,
        longitude,
        category,
        existingIssues
      );
      setDuplicateCheck(result);
    }
  }, [title, description, latitude, longitude, category, existingIssues]);

  // Update priority suggestion
  useEffect(() => {
    if (title.length > 5 || description.length > 10) {
      const suggestion = calculatePriorityScore(category, title, description);
      setPrioritySuggestion(suggestion);
      // Auto-set priority if high confidence
      if (suggestion.confidence >= 0.85) {
        setPriority(suggestion.priority);
      }
    }
  }, [title, description, category]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter both a descriptive title and detailed summary.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      let finalImageUrl = photoPreview;
      if (photoFile) {
        setIsUploadingPhoto(true);
        finalImageUrl = await uploadImage(photoFile);
        setIsUploadingPhoto(false);
      }

      const created = await createIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        latitude,
        longitude,
        address,
        image_url: finalImageUrl || undefined,
        submitted_by: isAnonymous ? undefined : user?.id,
        submitted_by_name: isAnonymous ? 'Anonymous Citizen' : submitterName,
        submitted_by_email: isAnonymous ? undefined : submitterEmail,
        is_anonymous: isAnonymous,
      });

      setSubmittedIssueId(created.id);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (submittedIssueId) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
            Case Reference #{submittedIssueId.toUpperCase()}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
            Infrastructure Report Logged
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your submission has been filed with the municipal triage desk. An initial inspection work order has been queued.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-left text-xs text-slate-600 space-y-1.5">
            <p><strong>Location:</strong> {address}</p>
            <p><strong>Department:</strong> {CATEGORY_METADATA[category].defaultDepartment.replace('_', ' ')}</p>
            <p><strong>Assigned Priority:</strong> <span className="capitalize">{priority}</span></p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/issues/${submittedIssueId}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 transition"
            >
              Track Status Timeline <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              View on Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
            Public Intake Form
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Report an Infrastructure Issue
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Provide details, photo evidence, and pinpoint location to assist city dispatch crews.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Category */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              1. What type of issue are you reporting?
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select the appropriate category for proper department dispatch.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(CATEGORY_METADATA).map(([key, cat]) => {
                const isSelected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key as IssueCategory)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-full mb-2"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              2. Where is the defect located?
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Click on the map or drag the pin to set the exact coordinates for the field crew.
            </p>

            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              address={address}
              onLocationChange={(lat, lng, addr) => {
                setLatitude(lat);
                setLongitude(lng);
                setAddress(addr);
              }}
            />

            {/* Proximity Duplicate Warning (if detected) */}
            {duplicateCheck.hasPotentialDuplicate && duplicateCheck.matchedIssue && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-amber-900">
                      Nearby Issue Detected ({duplicateCheck.distanceMeters}m away)
                    </p>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      {duplicateCheck.reason}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <Link
                        href={`/issues/${duplicateCheck.matchedIssue.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-semibold text-amber-900 underline hover:text-amber-950"
                      >
                        Inspect Existing Case #{duplicateCheck.matchedIssue.id.toUpperCase()} →
                      </Link>
                      <span className="text-amber-600">•</span>
                      <span className="text-amber-700">You may still submit if this is a distinct issue.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              3. Issue Description & Details
            </h2>

            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-800 mb-1">
                Issue Summary / Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole damaging tires in eastbound bus lane"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-800 mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe size, depth, duration, hazards to cyclists or pedestrians, and any nearby landmarks..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 leading-relaxed"
              />
            </div>

            {/* Smart Priority Triage Heuristic */}
            {prioritySuggestion && (
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-xs flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-teal-700 flex-shrink-0 mt-0.5" />
                <div className="text-teal-950">
                  <span className="font-semibold text-teal-900">
                    Triage Urgency Suggestion: <strong className="capitalize">{prioritySuggestion.priority}</strong>
                  </span>
                  <p className="mt-0.5 text-teal-800 text-[11px]">
                    {prioritySuggestion.justification}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Perceived Urgency Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as IssuePriority[]).map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setPriority(pr)}
                    className={`rounded-lg border p-2 text-center text-xs font-medium capitalize transition ${
                      priority === pr
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Photo Evidence */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              4. Photo Evidence
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Clear photos significantly accelerate triage and prevent misidentification.
            </p>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-56 w-full max-w-md bg-slate-100">
                <img
                  src={photoPreview}
                  alt="Issue preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-slate-900 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center cursor-pointer hover:border-teal-600 hover:bg-teal-50/20 transition">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">
                  Click to upload or take a photo
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG or WEBP up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Section 5: Reporter Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                5. Citizen Submitter Information
              </h2>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Submit Anonymously</span>
              </label>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Email Address for Status Updates
                  </label>
                  <input
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
                Your report will be filed anonymously in public records. You can still track updates via the unique case ID.
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Filing Report...' : 'Submit Infrastructure Report'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubmitIssuePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading intake form..." />}>
      <SubmitIssueForm />
    </Suspense>
  );
}

