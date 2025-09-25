/**
 * Visualization Integration Strategy for ClearLane Initiative
 * Maps existing plots/ PNG files to interactive components and usage contexts
 */

export interface VisualizationAsset {
  id: string;
  title: string;
  description: string;
  staticPath: string; // Path to PNG in plots/ directory
  dataSource: string; // Which CSV dataset(s) to use for interactive version
  component?: string; // React component name for interactive version
  usageContext: string[]; // Where this visualization appears
  priority: 'high' | 'medium' | 'low';
  interactiveFeatures?: string[];
}

export const VISUALIZATION_ASSETS: Record<string, VisualizationAsset> = {
  // Core temporal analysis - supports "rolling study hall" narrative
  TEMPORAL_PATTERNS: {
    id: 'temporal-patterns',
    title: 'Violation Patterns by Hour and Day',
    description: 'Heatmap showing peak violation windows (10AM-12PM, 2PM-4PM) that disrupt student study time',
    staticPath: '/plots/temporal_patterns.png',
    dataSource: 'HOURLY_PATTERNS',
    component: 'TemporalHeatmap',
    usageContext: ['hero', 'methodology', 'findings'],
    priority: 'high',
    interactiveFeatures: ['hover-details', 'time-filtering', 'study-hall-overlay']
  },

  // CUNY proximity analysis - core to student impact narrative
  CUNY_CAMPUS_ANALYSIS: {
    id: 'cuny-campus-analysis',
    title: 'Violations Near CUNY Campuses',
    description: 'Geographic analysis of bus violations within 500m buffer zones of CUNY campuses',
    staticPath: '/plots/cuny_campus_analysis.png',
    dataSource: 'VIOLATION_HOTSPOTS',
    component: 'CunyCampusMap',
    usageContext: ['hero', 'findings', 'impact-analysis'],
    priority: 'high',
    interactiveFeatures: ['campus-selection', 'buffer-zone-toggle', 'route-overlay']
  },

  VIOLATIONS_BY_CUNY_DISTANCE: {
    id: 'violations-by-cuny-distance',
    title: 'Violation Density by Distance to CUNY',
    description: 'Chart showing how violation frequency correlates with proximity to CUNY campuses',
    staticPath: '/plots/violations_by_distance_to_cuny.png',
    dataSource: 'VIOLATION_HOTSPOTS',
    component: 'DistanceCorrelationChart',
    usageContext: ['findings', 'methodology'],
    priority: 'high',
    interactiveFeatures: ['distance-slider', 'campus-filtering']
  },

  // Route performance analysis - paradox routes
  PARADOX_ROUTES_ANALYSIS: {
    id: 'paradox-routes-by-period',
    title: 'Top Paradox Routes by Time Period',
    description: 'Routes showing negative speed changes despite enforcement (Q44+ featured)',
    staticPath: '/plots/paradox_by_period_top_routes.png',
    dataSource: 'TOP_ROUTES_ACE',
    component: 'ParadoxRoutesChart',
    usageContext: ['findings', 'route-explorer'],
    priority: 'high',
    interactiveFeatures: ['route-selection', 'time-period-toggle', 'speed-comparison']
  },

  CUNY_ROUTE_SPEED_ANALYSIS: {
    id: 'cuny-route-speed-analysis',
    title: 'Speed Analysis for CUNY-Adjacent Routes',
    description: 'Speed change analysis for bus routes serving CUNY campuses',
    staticPath: '/plots/cuny_route_speed_analysis.png',
    dataSource: 'TOP_ROUTES',
    component: 'CunyRouteSpeedChart',
    usageContext: ['findings', 'impact-analysis'],
    priority: 'medium',
    interactiveFeatures: ['route-filtering', 'campus-grouping']
  },

  // Comparative analysis
  COMPARATIVE_ANALYSIS: {
    id: 'comparative-analysis',
    title: 'Before/After ACE Implementation Comparison',
    description: 'System-wide comparison of violation patterns before and after ACE deployment',
    staticPath: '/plots/comparative_analysis.png',
    dataSource: 'ROUTE_COUNTS',
    component: 'BeforeAfterComparison',
    usageContext: ['methodology', 'findings'],
    priority: 'medium',
    interactiveFeatures: ['period-selection', 'route-filtering', 'metric-toggle']
  },

  // Geographic analysis
  CBD_VIOLATION_DISTRIBUTION: {
    id: 'cbd-violation-distribution',
    title: 'Central Business District Violation Distribution',
    description: 'Spatial distribution of violations in Manhattan CBD area',
    staticPath: '/plots/cbd_violation_distribution.png',
    dataSource: 'VIOLATION_HOTSPOTS',
    component: 'CbdDistributionMap',
    usageContext: ['findings', 'geographic-analysis'],
    priority: 'medium',
    interactiveFeatures: ['zoom-controls', 'density-overlay', 'time-filtering']
  },

  CBD_CONGESTION_PRICING: {
    id: 'cbd-congestion-pricing',
    title: 'CBD Violations and Congestion Pricing Analysis',
    description: 'Analysis of how congestion pricing affects bus lane violations in CBD',
    staticPath: '/plots/cbd_congestion_pricing_analysis.png',
    dataSource: 'ROUTE_COUNTS',
    component: 'CongestionPricingChart',
    usageContext: ['findings', 'policy-analysis'],
    priority: 'low',
    interactiveFeatures: ['pricing-zone-toggle', 'impact-metrics']
  },

  // Ridership prediction
  RIDERSHIP_PREDICTION: {
    id: 'actual-vs-predicted-ridership',
    title: 'Actual vs Predicted Bus Ridership',
    description: 'Model predictions vs actual ridership showing impact of violations on usage',
    staticPath: '/plots/actual_vs_predicted_ridership.png',
    dataSource: 'ROUTE_COUNTS',
    component: 'RidershipPredictionChart',
    usageContext: ['methodology', 'findings'],
    priority: 'medium',
    interactiveFeatures: ['model-comparison', 'confidence-intervals', 'route-selection']
  },

  // Exempt vehicle analysis
  EXEMPT_VEHICLE_ANALYSIS: {
    id: 'exempt-vehicle-analysis',
    title: 'Exempt Vehicle Violation Analysis',
    description: 'Analysis of violations by exempt vehicles (emergency, government, etc.)',
    staticPath: '/plots/exempt_vehicle_analysis.png',
    dataSource: 'ROUTE_COUNTS',
    component: 'ExemptVehicleChart',
    usageContext: ['findings', 'detailed-analysis'],
    priority: 'low',
    interactiveFeatures: ['vehicle-type-filtering', 'exemption-categories']
  }
};

// Progressive enhancement strategy for visualizations
export const VISUALIZATION_STRATEGY = {
  // Load order for optimal performance
  LOAD_ORDER: [
    'TEMPORAL_PATTERNS',      // Critical for hero section
    'CUNY_CAMPUS_ANALYSIS',   // Core to student impact narrative
    'VIOLATIONS_BY_CUNY_DISTANCE', // Supporting the proximity analysis
    'PARADOX_ROUTES_ANALYSIS', // Key finding visualization
    // Remaining visualizations loaded on demand
  ],

  // Fallback strategy when interactive components fail
  FALLBACK: {
    strategy: 'static-image',
    errorMessage: 'Interactive visualization unavailable. Static analysis shown.',
    retryEnabled: true
  },

  // Progressive enhancement levels
  ENHANCEMENT_LEVELS: {
    // Level 1: Static images only
    BASIC: {
      description: 'Static PNG images with alt text',
      features: ['static-display', 'alt-text', 'captions']
    },
    // Level 2: Static images with hover overlays
    ENHANCED: {
      description: 'Static images with interactive hover information',
      features: ['hover-overlays', 'click-to-zoom', 'caption-expansion']
    },
    // Level 3: Full interactive components
    INTERACTIVE: {
      description: 'Full D3.js/Chart.js interactive visualizations',
      features: ['data-filtering', 'zooming', 'brushing', 'tooltips', 'animations']
    }
  }
} as const;

// Context-specific visualization configurations
export const USAGE_CONTEXTS = {
  HERO: {
    visualizations: ['TEMPORAL_PATTERNS', 'CUNY_CAMPUS_ANALYSIS'],
    displayMode: 'prominent',
    size: 'large',
    interactivity: 'high'
  },

  METHODOLOGY: {
    visualizations: ['TEMPORAL_PATTERNS', 'COMPARATIVE_ANALYSIS', 'RIDERSHIP_PREDICTION'],
    displayMode: 'embedded',
    size: 'medium',
    interactivity: 'medium'
  },

  FINDINGS: {
    visualizations: ['PARADOX_ROUTES_ANALYSIS', 'VIOLATIONS_BY_CUNY_DISTANCE', 'CUNY_ROUTE_SPEED_ANALYSIS'],
    displayMode: 'featured',
    size: 'large',
    interactivity: 'high'
  },

  GEOGRAPHIC_ANALYSIS: {
    visualizations: ['CBD_VIOLATION_DISTRIBUTION', 'CUNY_CAMPUS_ANALYSIS'],
    displayMode: 'map-focused',
    size: 'full-width',
    interactivity: 'high'
  },

  DETAILED_ANALYSIS: {
    visualizations: ['EXEMPT_VEHICLE_ANALYSIS', 'CBD_CONGESTION_PRICING'],
    displayMode: 'technical',
    size: 'medium',
    interactivity: 'medium'
  }
} as const;

// Data storytelling narrative integration
export const NARRATIVE_INTEGRATION = {
  // "Rolling Study Hall" story arc
  ROLLING_STUDY_HALL: {
    visualizations: ['TEMPORAL_PATTERNS', 'CUNY_CAMPUS_ANALYSIS'],
    story_points: [
      'BxM10 commute transforms into productive study time',
      'Peak violation windows (10AM-12PM, 2PM-4PM) disrupt study sessions',
      'CUNY campus proximity shows concentrated impact on students',
      '85.6% system failure rate threatens educational access'
    ]
  },

  // ACE Paradox story arc
  ACE_PARADOX: {
    visualizations: ['PARADOX_ROUTES_ANALYSIS', 'COMPARATIVE_ANALYSIS'],
    story_points: [
      'Increased enforcement paradoxically worsens bus speeds',
      'Q44+ route: 164,806 violations but -3.3% speed change',
      'System-wide analysis reveals enforcement gaps',
      'Need for surgical enforcement at 90 priority locations'
    ]
  },

  // CUNY Impact story arc
  CUNY_IMPACT: {
    visualizations: ['VIOLATIONS_BY_CUNY_DISTANCE', 'CUNY_ROUTE_SPEED_ANALYSIS'],
    story_points: [
      '500m buffer zone analysis around CUNY campuses',
      'Higher violation density near educational institutions',
      'Disproportionate impact on student commuters',
      'Educational equity implications of transportation policy'
    ]
  }
} as const;

export default VISUALIZATION_ASSETS;