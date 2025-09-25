/**
 * CSV Data Loader for ClearLane Initiative
 * Handles loading and processing of MTA bus violation and performance data
 */

export interface ViolationData {
  stop_name: string;
  violations: number;
  avg_lat: number;
  avg_lon: number;
  campus_proximity?: string;
}

export interface HourlyData {
  weekday: string;
  hour: number;
  violations: number;
}

export interface CUNYData {
  campus_name: string;
  total_violations: number;
  total_ridership: number;
  routes_served: number;
}

export interface RoutePerformance {
  route_id: string;
  before_speed: number;
  after_speed: number;
  improvement_pct: number;
}

/**
 * Parses CSV data with type safety and error handling
 */
export function parseCSV<T>(csvText: string, parser: (row: any) => T): T[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {} as any);

    return parser(row);
  }).filter(Boolean);
}

/**
 * Load and process violation hotspot data
 */
export async function loadViolationHotspots(): Promise<ViolationData[]> {
  try {
    const response = await fetch('/data/insights/top_hotspots.csv');
    const csvText = await response.text();

    return parseCSV(csvText, (row) => ({
      stop_name: row.stop_name || '',
      violations: parseInt(row.violations) || 0,
      avg_lat: parseFloat(row.avg_lat) || 0,
      avg_lon: parseFloat(row.avg_lon) || 0,
    }));
  } catch (error) {
    console.error('Failed to load violation hotspots:', error);
    return [];
  }
}

/**
 * Load and process temporal violation patterns
 */
export async function loadHourlyData(): Promise<HourlyData[]> {
  try {
    const response = await fetch('/data/insights/hourly_agg.csv');
    const csvText = await response.text();

    return parseCSV(csvText, (row) => ({
      weekday: row.weekday || '',
      hour: parseInt(row.hour) || 0,
      violations: parseInt(row.violations) || 0,
    }));
  } catch (error) {
    console.error('Failed to load hourly data:', error);
    return [];
  }
}

/**
 * Load and process CUNY campus impact data
 */
export async function loadCUNYData(): Promise<CUNYData[]> {
  try {
    const response = await fetch('/data/insights/CUNY_Insights/campus_summary_2025.csv');
    const csvText = await response.text();

    return parseCSV(csvText, (row) => ({
      campus_name: row.campus_name || '',
      total_violations: parseInt(row.total_violations) || 0,
      total_ridership: parseInt(row.total_ridership) || 0,
      routes_served: parseInt(row.routes_served) || 0,
    }));
  } catch (error) {
    console.error('Failed to load CUNY data:', error);
    return [];
  }
}

/**
 * Load route performance improvement data
 */
export async function loadRoutePerformance(): Promise<RoutePerformance[]> {
  try {
    const response = await fetch('/data/dashboards/data/before_after_ace.csv');
    const csvText = await response.text();

    return parseCSV(csvText, (row) => ({
      route_id: row['Route ID'] || '',
      before_speed: parseFloat(row['False']) || 0,
      after_speed: parseFloat(row['True']) || 0,
      improvement_pct: parseFloat(row['Pct Change']) || 0,
    }));
  } catch (error) {
    console.error('Failed to load route performance data:', error);
    return [];
  }
}

/**
 * Data aggregation utilities
 */
export class DataAggregator {
  /**
   * Group hourly data by day of week
   */
  static groupHourlyByDay(data: HourlyData[]): Record<string, HourlyData[]> {
    return data.reduce((acc, item) => {
      if (!acc[item.weekday]) {
        acc[item.weekday] = [];
      }
      acc[item.weekday].push(item);
      return acc;
    }, {} as Record<string, HourlyData[]>);
  }

  /**
   * Calculate peak hours for student commutes (7-10 AM)
   */
  static getStudentCommuteData(data: HourlyData[]): HourlyData[] {
    return data.filter(item =>
      item.hour >= 7 && item.hour <= 10 &&
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(item.weekday)
    );
  }

  /**
   * Get top N hotspots by violation count
   */
  static getTopHotspots(data: ViolationData[], n: number = 10): ViolationData[] {
    return data
      .sort((a, b) => b.violations - a.violations)
      .slice(0, n);
  }

  /**
   * Calculate summary statistics
   */
  static calculateStats(data: number[]) {
    if (data.length === 0) return { mean: 0, median: 0, total: 0 };

    const sorted = [...data].sort((a, b) => a - b);
    const total = data.reduce((sum, val) => sum + val, 0);
    const mean = total / data.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return { mean, median, total };
  }
}

/**
 * Caching utility for expensive data operations
 */
export class DataCache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static TTL = 5 * 60 * 1000; // 5 minutes

  static async get<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.TTL) {
      return cached.data;
    }

    const data = await loader();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  static clear(): void {
    this.cache.clear();
  }
}

/**
 * Progressive data loading for better UX
 */
export async function loadDataProgressively() {
  // Load critical data first
  const criticalData = await Promise.all([
    DataCache.get('hourly', loadHourlyData),
    DataCache.get('cuny', loadCUNYData),
  ]);

  // Load secondary data
  setTimeout(async () => {
    await Promise.all([
      DataCache.get('hotspots', loadViolationHotspots),
      DataCache.get('performance', loadRoutePerformance),
    ]);
  }, 100);

  return {
    hourly: criticalData[0],
    cuny: criticalData[1],
  };
}