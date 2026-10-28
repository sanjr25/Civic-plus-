import { Issue, IssueCategory, IssuePriority } from '@/types/database';

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates basic string token similarity (Jaccard index of 3-character n-grams)
 */
export function calculateTextSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const getTrigrams = (text: string): Set<string> => {
    const set = new Set<string>();
    for (let i = 0; i <= text.length - 3; i++) {
      set.add(text.substring(i, i + 3));
    }
    return set;
  };

  const t1 = getTrigrams(s1);
  const t2 = getTrigrams(s2);

  if (t1.size === 0 || t2.size === 0) {
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));
    const intersection = [...words1].filter((w) => words2.has(w)).length;
    return intersection / Math.max(words1.size, words2.size);
  }

  let intersection = 0;
  t1.forEach((gram) => {
    if (t2.has(gram)) intersection++;
  });

  return (2 * intersection) / (t1.size + t2.size);
}

export interface DuplicateDetectionResult {
  hasPotentialDuplicate: boolean;
  duplicateScore: number; // 0 to 1
  matchedIssue?: Issue;
  distanceMeters?: number;
  reason?: string;
}

/**
 * Detects if a new report is likely a duplicate of existing open issues
 * based on geographic proximity (< 150m) and textual similarity.
 * Designed for future model or vector embeddings integration.
 */
export function detectDuplicateIssues(
  newTitle: string,
  newDescription: string,
  latitude: number,
  longitude: number,
  category: IssueCategory,
  existingIssues: Issue[]
): DuplicateDetectionResult {
  const openIssues = existingIssues.filter(
    (issue) => issue.status !== 'resolved' && issue.status !== 'closed'
  );

  let highestScore = 0;
  let bestMatch: Issue | undefined;
  let bestDistance = Infinity;

  for (const existing of openIssues) {
    const distance = calculateDistanceMeters(
      latitude,
      longitude,
      existing.latitude,
      existing.longitude
    );

    // Only consider issues within 150 meters
    if (distance <= 150) {
      const titleSim = calculateTextSimilarity(newTitle, existing.title);
      const descSim = calculateTextSimilarity(
        newDescription,
        existing.description
      );
      const sameCategory = existing.category === category ? 1.0 : 0.4;

      // Proximity factor: 1 at 0m, 0 at 150m
      const proximityFactor = Math.max(0, 1 - distance / 150);

      // Composite duplicate confidence score
      const compositeScore =
        (titleSim * 0.4 + descSim * 0.2 + sameCategory * 0.2 + proximityFactor * 0.2);

      if (compositeScore > highestScore) {
        highestScore = compositeScore;
        bestMatch = existing;
        bestDistance = distance;
      }
    }
  }

  const isDuplicate = highestScore >= 0.55 && !!bestMatch;

  return {
    hasPotentialDuplicate: isDuplicate,
    duplicateScore: Math.round(highestScore * 100) / 100,
    matchedIssue: bestMatch,
    distanceMeters: Math.round(bestDistance),
    reason: isDuplicate
      ? `A similar ${bestMatch?.category.replace('_', ' ')} issue was already reported ${Math.round(bestDistance)} meters away ("${bestMatch?.title}").`
      : undefined,
  };
}

/**
 * Intelligent priority calculation based on hazard keywords and category risk factors.
 * Architecture-ready for later classification models.
 */
export function calculatePriorityScore(
  category: IssueCategory,
  title: string,
  description: string
): { priority: IssuePriority; confidence: number; justification: string } {
  const combined = `${title} ${description}`.toLowerCase();

  const urgentKeywords = [
    'immediate', 'danger', 'collapse', 'flooding', 'sparking', 'exposed wire',
    'deep pothole', 'wheel damage', 'gas leak', 'sinkhole', 'blocked intersection',
    'traffic light out', 'fallen tree', 'pedestrian hit', 'injur'
  ];

  const highKeywords = [
    'busy street', 'school zone', 'hospital', 'leak', 'overflow',
    'broken glass', 'major crack', 'crosswalk', 'trip hazard', 'dark street'
  ];

  let urgencyHits = urgentKeywords.filter((w) => combined.includes(w));
  let highHits = highKeywords.filter((w) => combined.includes(w));

  if (category === 'traffic_signal' || urgencyHits.length >= 2) {
    return {
      priority: 'urgent',
      confidence: 0.92,
      justification: urgencyHits.length > 0 
        ? `Detected critical safety indicators: ${urgencyHits.slice(0, 2).join(', ')}`
        : 'Traffic signal outages carry automatic urgent priority for vehicle and pedestrian safety',
    };
  }

  if (category === 'water_leak' || urgencyHits.length === 1 || highHits.length >= 2) {
    return {
      priority: 'high',
      confidence: 0.85,
      justification: highHits.length > 0
        ? `Detected elevated impact indicators: ${highHits.slice(0, 2).join(', ')}`
        : 'Active water leaks or high-traffic hazards require accelerated triage',
    };
  }

  if (category === 'pothole' || category === 'streetlight' || highHits.length === 1) {
    return {
      priority: 'medium',
      confidence: 0.88,
      justification: 'Standard public infrastructure report with moderate impact',
    };
  }

  return {
    priority: 'low',
    confidence: 0.80,
    justification: 'Aesthetic or minor issue without immediate hazard',
  };
}
