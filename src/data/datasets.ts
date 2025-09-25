/**
 * Dataset Configuration for ClearLane Initiative
 * Maps to CSV files in dashboard/insights/ directory
 */

export interface DatasetConfig {
  name: string;
  path: string;
  description: string;
  columns: string[];
  size: 'small' | 'medium' | 'large';
  useCase: string[];
  loadStrategy: 'eager' | 'lazy' | 'on-demand';
}

export const DATASETS: Record<string, DatasetConfig> = {
  // Key findings and top routes
  TOP_ROUTES: {
    name: 'Top Routes by Speed Change',
    path: '/dashboard/insights/top5.csv',
    description: 'Top 10 routes showing speed changes with/without ACE enforcement',
    columns: ['Route ID', 'False', 'True', 'Pct Change'],
    size: 'small',
    useCase: ['hero-stats', 'route-comparison'],
    loadStrategy: 'eager'
  },

  TOP_ROUTES_ACE: {
    name: 'Top 5 Routes ACE Analysis',
    path: '/dashboard/insights/top5_routes_ace.csv',
    description: 'Detailed ACE analysis for top performing routes',
    columns: ['Route ID', 'Speed Before', 'Speed After', 'Improvement'],
    size: 'small',
    useCase: ['detailed-analysis', 'case-studies'],
    loadStrategy: 'eager'
  },

  // Temporal patterns - core to "rolling study hall" narrative
  HOURLY_PATTERNS: {
    name: 'Hourly Violation Patterns',
    path: '/dashboard/insights/hourly_agg.csv',
    description: 'Aggregated violations by weekday and hour - shows peak violation windows (10AM-12PM, 2PM-4PM)',
    columns: ['weekday', 'hour', 'violations'],
    size: 'small',
    useCase: ['temporal-heatmap', 'study-hall-analysis'],
    loadStrategy: 'eager'
  },

  HOURLY_DETAILED: {
    name: 'Detailed Hourly Data',
    path: '/dashboard/insights/hourly_counts.csv',
    description: 'Granular hourly violation data across all routes and periods',
    columns: ['route', 'hour', 'weekday', 'violations', 'period'],
    size: 'large',
    useCase: ['deep-dive-analysis', 'route-specific'],
    loadStrategy: 'on-demand'
  },

  // Geographic hotspots - CUNY proximity analysis
  VIOLATION_HOTSPOTS: {
    name: 'Top Violation Hotspots',
    path: '/dashboard/insights/top_hotspots.csv',
    description: 'Geographic violation hotspots with coordinates - includes CUNY proximity analysis',
    columns: ['stop_name', 'violations', 'avg_lat', 'avg_lon'],
    size: 'medium',
    useCase: ['map-visualization', 'cuny-analysis'],
    loadStrategy: 'lazy'
  },

  // Route-level analysis
  ROUTE_COUNTS: {
    name: 'Route Violation Counts',
    path: '/dashboard/insights/route_counts.csv',
    description: 'Comprehensive route-level violation counts by month, weekday, and type',
    columns: ['bus_route_id', 'month', 'weekday', 'violation_type', 'violations'],
    size: 'large',
    useCase: ['route-explorer', 'trend-analysis'],
    loadStrategy: 'on-demand'
  },

  ROUTE_PATHS: {
    name: 'Route Path Data',
    path: '/dashboard/insights/routes_pathes.csv',
    description: 'Geographic route path information for mapping',
    columns: ['route_id', 'path_data', 'stops'],
    size: 'medium',
    useCase: ['route-mapping', 'geographic-analysis'],
    loadStrategy: 'lazy'
  },

  // Temporal aggregations
  MONTHLY_TRENDS: {
    name: 'Monthly Violation Trends',
    path: '/dashboard/insights/monthly_counts.csv',
    description: 'Monthly aggregated violation counts showing trends over time',
    columns: ['month', 'violations', 'routes_affected'],
    size: 'small',
    useCase: ['trend-visualization', 'timeline'],
    loadStrategy: 'eager'
  },

  WEEKDAY_PATTERNS: {
    name: 'Weekday Violation Patterns',
    path: '/dashboard/insights/weekday_counts.csv',
    description: 'Violation patterns by day of week',
    columns: ['weekday', 'violations', 'avg_per_route'],
    size: 'small',
    useCase: ['weekly-heatmap', 'pattern-analysis'],
    loadStrategy: 'eager'
  },

  // Stop-level data
  STOP_ANALYSIS: {
    name: 'Bus Stop Analysis',
    path: '/dashboard/insights/stop_counts.csv',
    description: 'Individual bus stop violation analysis',
    columns: ['stop_id', 'stop_name', 'violations', 'routes_served'],
    size: 'medium',
    useCase: ['stop-level-analysis', 'detailed-mapping'],
    loadStrategy: 'lazy'
  },

  STOPS_SUMMARY: {
    name: 'Stops Count Summary',
    path: '/dashboard/insights/stops_counts.csv',
    description: 'Summary statistics for bus stops',
    columns: ['total_stops', 'violation_stops', 'coverage_pct'],
    size: 'small',
    useCase: ['summary-stats', 'overview'],
    loadStrategy: 'eager'
  }
};

// Key statistics extracted from data analysis
export const KEY_STATS = {
  TOTAL_VIOLATIONS: '3.78M',
  SYSTEM_FAILURE_RATE: '85.6%',
  TOTAL_ROUTES_ANALYZED: 557,
  PEAK_VIOLATION_WINDOWS: ['10AM-12PM', '2PM-4PM'],
  TOP_PARADOX_ROUTE: 'Q44+',
  TOP_PARADOX_VIOLATIONS: '164,806',
  TOP_PARADOX_SPEED_CHANGE: '-3.3%',
  CUNY_PROXIMITY_BUFFER: '500m',
  ACE_IMPLEMENTATION_DATE: '2024-06-01',
  CLEARLANE_PRIORITY_LOCATIONS: 90
} as const;

// Dataset loading priorities for performance optimization
export const LOADING_PRIORITIES = {
  CRITICAL: ['TOP_ROUTES', 'HOURLY_PATTERNS', 'MONTHLY_TRENDS'], // Load immediately for hero section
  IMPORTANT: ['TOP_ROUTES_ACE', 'WEEKDAY_PATTERNS', 'STOPS_SUMMARY'], // Load on page load
  DEFERRED: ['VIOLATION_HOTSPOTS', 'ROUTE_PATHS', 'STOP_ANALYSIS'], // Load when needed
  ON_DEMAND: ['ROUTE_COUNTS', 'HOURLY_DETAILED'] // Load only when requested
} as const;

export default DATASETS;