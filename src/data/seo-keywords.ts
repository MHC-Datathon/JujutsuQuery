/**
 * SEO Keyword Strategy for ClearLane Initiative
 * Target keywords and content optimization data
 */

export interface KeywordData {
  primary: string;
  variants: string[];
  difficulty: 'low' | 'medium' | 'high';
  volume: number;
  intent: 'informational' | 'navigational' | 'transactional';
  pages: string[];
  content_clusters: string[];
}

export const primaryKeywords: KeywordData[] = [
  {
    primary: "NYC bus delays",
    variants: [
      "NYC bus delays 2024",
      "New York City bus delays",
      "MTA bus delays NYC",
      "NYC public transit delays",
      "Manhattan bus delays",
      "Brooklyn bus delays",
      "Queens bus delays"
    ],
    difficulty: 'medium',
    volume: 8900,
    intent: 'informational',
    pages: ['/', '/findings', '/methodology'],
    content_clusters: ['transit-problems', 'delays-analysis']
  },
  {
    primary: "student transportation NYC",
    variants: [
      "CUNY student transportation",
      "college student commute NYC",
      "student bus pass NYC",
      "NYC student travel",
      "university student transport",
      "student MetroCard NYC"
    ],
    difficulty: 'low',
    volume: 2400,
    intent: 'informational',
    pages: ['/', '/about', '/methodology'],
    content_clusters: ['student-impact', 'education-access']
  },
  {
    primary: "MTA enforcement",
    variants: [
      "MTA bus lane enforcement",
      "NYC bus lane violations",
      "MTA enforcement cameras",
      "bus lane enforcement NYC",
      "MTA police enforcement",
      "transit enforcement NYC"
    ],
    difficulty: 'medium',
    volume: 3600,
    intent: 'informational',
    pages: ['/solution', '/findings'],
    content_clusters: ['enforcement-analysis', 'policy-solutions']
  },
  {
    primary: "bus lane violations NYC",
    variants: [
      "NYC bus lane camera tickets",
      "bus lane enforcement cameras",
      "NYC bus lane fines",
      "illegal bus lane parking",
      "bus lane blocking NYC",
      "MTA bus lane violations"
    ],
    difficulty: 'medium',
    volume: 5200,
    intent: 'informational',
    pages: ['/findings', '/solution', '/methodology'],
    content_clusters: ['violations-data', 'enforcement-gaps']
  },
  {
    primary: "NYC public transportation research",
    variants: [
      "NYC transit data analysis",
      "public transportation study NYC",
      "MTA research data",
      "NYC bus system analysis",
      "urban transportation research",
      "transit policy research NYC"
    ],
    difficulty: 'low',
    volume: 1800,
    intent: 'informational',
    pages: ['/methodology', '/about', '/'],
    content_clusters: ['research-methodology', 'data-analysis']
  },
  {
    primary: "CUNY student commute",
    variants: [
      "CUNY transportation challenges",
      "CUNY student bus commute",
      "college student commute NYC",
      "CUNY campus accessibility",
      "student commute times NYC",
      "CUNY student transportation study"
    ],
    difficulty: 'low',
    volume: 960,
    intent: 'informational',
    pages: ['/', '/about', '/methodology'],
    content_clusters: ['student-experience', 'education-equity']
  }
];

export const longTailKeywords: KeywordData[] = [
  {
    primary: "how bus lane violations affect students",
    variants: [
      "impact of bus delays on students",
      "student academic performance transit delays",
      "how transportation affects college success",
      "student commute impact on education",
      "transit accessibility for students"
    ],
    difficulty: 'low',
    volume: 480,
    intent: 'informational',
    pages: ['/', '/methodology'],
    content_clusters: ['student-impact', 'research-findings']
  },
  {
    primary: "NYC bus lane enforcement solution",
    variants: [
      "improving bus lane enforcement NYC",
      "solutions for NYC bus delays",
      "how to reduce bus lane violations",
      "NYC transit policy recommendations",
      "improving MTA bus service"
    ],
    difficulty: 'low',
    volume: 720,
    intent: 'informational',
    pages: ['/solution', '/findings'],
    content_clusters: ['policy-recommendations', 'solution-framework']
  },
  {
    primary: "real time bus tracking NYC",
    variants: [
      "NYC bus arrival predictions",
      "MTA bus tracker accuracy",
      "NYC bus delay notifications",
      "real time transit data NYC",
      "bus location tracking MTA"
    ],
    difficulty: 'medium',
    volume: 1200,
    intent: 'navigational',
    pages: ['/methodology', '/solution'],
    content_clusters: ['technology-solutions', 'data-systems']
  }
];

export const localKeywords: KeywordData[] = [
  {
    primary: "Manhattan bus lanes",
    variants: [
      "14th Street busway",
      "Broadway bus lane",
      "42nd Street bus lane",
      "Madison Avenue bus lane",
      "Lexington Avenue bus",
      "crosstown bus Manhattan"
    ],
    difficulty: 'medium',
    volume: 2800,
    intent: 'informational',
    pages: ['/findings', '/methodology'],
    content_clusters: ['geographic-analysis', 'route-specific']
  },
  {
    primary: "Brooklyn bus routes",
    variants: [
      "B46 bus delays",
      "B44 bus service",
      "Brooklyn bus lanes",
      "Nostrand Avenue bus",
      "Flatbush Avenue bus",
      "Brooklyn bus enforcement"
    ],
    difficulty: 'low',
    volume: 1600,
    intent: 'informational',
    pages: ['/findings', '/methodology'],
    content_clusters: ['borough-analysis', 'route-performance']
  },
  {
    primary: "Queens bus service",
    variants: [
      "Queens bus delays",
      "Q44 bus route",
      "Northern Boulevard bus",
      "Queens Boulevard bus lane",
      "Jamaica Avenue bus",
      "Flushing bus routes"
    ],
    difficulty: 'low',
    volume: 1400,
    intent: 'informational',
    pages: ['/findings', '/methodology'],
    content_clusters: ['borough-analysis', 'service-quality']
  }
];

export const competitiveKeywords: KeywordData[] = [
  {
    primary: "TransitCenter NYC",
    variants: [
      "NYC transit advocacy",
      "transportation policy NYC",
      "transit reform NYC",
      "bus advocacy groups NYC",
      "public transportation improvement"
    ],
    difficulty: 'high',
    volume: 1800,
    intent: 'navigational',
    pages: ['/about', '/solution'],
    content_clusters: ['advocacy', 'policy-reform']
  },
  {
    primary: "Riders Alliance NYC",
    variants: [
      "NYC subway advocacy",
      "transit rider organization",
      "MTA reform advocacy",
      "public transit activism NYC",
      "transportation justice NYC"
    ],
    difficulty: 'high',
    volume: 1200,
    intent: 'navigational',
    pages: ['/about', '/solution'],
    content_clusters: ['grassroots-advocacy', 'rider-rights']
  }
];

export const brandKeywords: KeywordData[] = [
  {
    primary: "ClearLane Initiative",
    variants: [
      "ClearLane NYC",
      "ClearLane bus study",
      "ClearLane research",
      "ClearLane transportation",
      "Clear Lane Initiative"
    ],
    difficulty: 'low',
    volume: 120,
    intent: 'navigational',
    pages: ['/', '/about'],
    content_clusters: ['brand-awareness', 'organization-info']
  },
  {
    primary: "Abdul Basir CUNY research",
    variants: [
      "Abdul Basir transportation",
      "CUNY bus lane study",
      "CUNY transportation research",
      "Abdul Basir ClearLane",
      "CUNY student researcher"
    ],
    difficulty: 'low',
    volume: 80,
    intent: 'navigational',
    pages: ['/about', '/methodology'],
    content_clusters: ['researcher-profile', 'academic-work']
  }
];

// Content optimization targets
export const contentClusters = {
  'transit-problems': {
    keywords: ['NYC bus delays', 'MTA service issues', 'public transit problems'],
    pages: ['/', '/findings'],
    content_type: 'problem-identification'
  },
  'student-impact': {
    keywords: ['student transportation', 'CUNY commute', 'education access'],
    pages: ['/', '/about', '/methodology'],
    content_type: 'impact-analysis'
  },
  'enforcement-analysis': {
    keywords: ['MTA enforcement', 'bus lane violations', 'camera enforcement'],
    pages: ['/findings', '/solution'],
    content_type: 'data-analysis'
  },
  'policy-solutions': {
    keywords: ['transportation policy', 'enforcement solutions', 'transit improvement'],
    pages: ['/solution'],
    content_type: 'solution-framework'
  },
  'research-methodology': {
    keywords: ['transportation research', 'data analysis', 'academic study'],
    pages: ['/methodology'],
    content_type: 'methodology-documentation'
  }
};

// Technical SEO targets
export const technicalSEO = {
  core_web_vitals: {
    lcp_target: 2.5, // Largest Contentful Paint
    fid_target: 100, // First Input Delay
    cls_target: 0.1  // Cumulative Layout Shift
  },
  page_speed_targets: {
    desktop: 90,
    mobile: 85
  },
  indexing_priority: [
    '/',
    '/solution',
    '/findings',
    '/methodology',
    '/about'
  ]
};

export default {
  primaryKeywords,
  longTailKeywords,
  localKeywords,
  competitiveKeywords,
  brandKeywords,
  contentClusters,
  technicalSEO
};