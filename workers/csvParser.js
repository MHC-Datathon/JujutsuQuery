/**
 * CSV Parser Web Worker - Handles heavy CSV parsing off the main thread
 * Optimized for large datasets with performance monitoring
 */

self.addEventListener('message', function(e) {
  const { csvText, config = {} } = e.data;

  try {
    const startTime = performance.now();

    // Parse CSV with configuration options
    const parsed = parseCSVOptimized(csvText, config);

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // Send results back to main thread
    self.postMessage({
      type: 'parsed',
      data: parsed,
      metadata: {
        processingTime,
        rowCount: parsed.length,
        columnCount: parsed.length > 0 ? Object.keys(parsed[0]).length : 0,
        memoryUsage: estimateMemoryUsage(parsed)
      }
    });

  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.message,
      stack: error.stack
    });
  }
});

function parseCSVOptimized(csvText, config) {
  const {
    maxRows = Infinity,
    sampleRate = 1.0,
    enableTypeDetection = true,
    enableCompression = false,
    delimiter = ',',
    quote = '"',
    escape = '"'
  } = config;

  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  // Parse headers
  const headers = parseCSVLine(lines[0], delimiter, quote, escape);
  const data = [];

  // Determine sampling strategy
  const totalDataRows = lines.length - 1;
  const targetRows = Math.min(maxRows, Math.floor(totalDataRows * sampleRate));

  let processedRows = 0;
  const step = sampleRate < 1.0 ? Math.floor(totalDataRows / targetRows) : 1;

  // Process data rows
  for (let i = 1; i < lines.length && processedRows < targetRows; i += step) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line, delimiter, quote, escape);
      const row = {};

      // Map values to headers
      headers.forEach((header, index) => {
        let value = values[index] || '';

        // Type detection and conversion
        if (enableTypeDetection && value !== '') {
          value = detectAndConvertType(value);
        }

        row[header] = value;
      });

      data.push(row);
      processedRows++;

      // Progress reporting for large datasets
      if (processedRows % 1000 === 0) {
        self.postMessage({
          type: 'progress',
          processed: processedRows,
          total: targetRows,
          percentage: (processedRows / targetRows) * 100
        });
      }

    } catch (lineError) {
      // Log parsing errors but continue processing
      console.warn(`Error parsing line ${i}: ${lineError.message}`);
      continue;
    }
  }

  // Apply compression if enabled
  if (enableCompression && data.length > 0) {
    return compressData(data);
  }

  return data;
}

function parseCSVLine(line, delimiter = ',', quote = '"', escape = '"') {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === quote) {
      if (inQuotes && nextChar === quote) {
        // Escaped quote
        current += quote;
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (char === delimiter && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
      continue;
    }

    // Regular character
    current += char;
    i++;
  }

  // Add final field
  result.push(current.trim());

  return result;
}

function detectAndConvertType(value) {
  // Remove quotes if present
  const cleaned = value.replace(/^["']|["']$/g, '');

  // Check for null/undefined
  if (cleaned === '' || cleaned.toLowerCase() === 'null' || cleaned.toLowerCase() === 'undefined') {
    return null;
  }

  // Check for boolean
  const lowerValue = cleaned.toLowerCase();
  if (lowerValue === 'true' || lowerValue === 'false') {
    return lowerValue === 'true';
  }

  // Check for number
  if (/^-?\d+$/.test(cleaned)) {
    // Integer
    const intValue = parseInt(cleaned, 10);
    return Number.isSafeInteger(intValue) ? intValue : cleaned;
  }

  if (/^-?\d*\.\d+$/.test(cleaned)) {
    // Float
    const floatValue = parseFloat(cleaned);
    return isFinite(floatValue) ? floatValue : cleaned;
  }

  // Check for percentage
  if (/^\d+(\.\d+)?%$/.test(cleaned)) {
    const numValue = parseFloat(cleaned.replace('%', ''));
    return isFinite(numValue) ? numValue / 100 : cleaned;
  }

  // Check for currency
  if (/^\$[\d,]+(\.\d{2})?$/.test(cleaned)) {
    const numValue = parseFloat(cleaned.replace(/[$,]/g, ''));
    return isFinite(numValue) ? numValue : cleaned;
  }

  // Check for date (basic patterns)
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned) || /^\d{2}\/\d{2}\/\d{4}/.test(cleaned)) {
    const dateValue = new Date(cleaned);
    if (!isNaN(dateValue.getTime())) {
      return dateValue.toISOString();
    }
  }

  // Return as string
  return cleaned;
}

function compressData(data) {
  if (data.length === 0) return data;

  // Simple compression: extract common values
  const columns = Object.keys(data[0]);
  const commonValues = {};
  const threshold = Math.floor(data.length * 0.1); // 10% threshold

  // Find common values for each column
  columns.forEach(col => {
    const valueCounts = {};
    data.forEach(row => {
      const value = row[col];
      if (value !== null && value !== undefined) {
        const key = String(value);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      }
    });

    // Store values that appear frequently
    const common = Object.entries(valueCounts)
      .filter(([_, count]) => count >= threshold)
      .map(([value, count]) => ({ value, count }));

    if (common.length > 0) {
      commonValues[col] = common;
    }
  });

  return {
    data,
    compression: {
      enabled: true,
      commonValues,
      originalSize: data.length,
      compressionRatio: Object.keys(commonValues).length / columns.length
    }
  };
}

function estimateMemoryUsage(data) {
  if (!data || data.length === 0) return 0;

  // Simple estimation based on JSON stringification
  try {
    const sampleSize = Math.min(100, data.length);
    const sample = data.slice(0, sampleSize);
    const sampleStr = JSON.stringify(sample);
    const avgRowSize = sampleStr.length / sampleSize;

    return Math.round(avgRowSize * data.length * 2); // Factor in JavaScript overhead
  } catch (error) {
    return data.length * 100; // Fallback estimation
  }
}

// Performance monitoring utilities
function measureMemory() {
  if ('memory' in performance) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
}

// Batch processing for very large datasets
function processBatch(lines, startIndex, batchSize, headers, config) {
  const batch = [];
  const endIndex = Math.min(startIndex + batchSize, lines.length);

  for (let i = startIndex; i < endIndex; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line, config.delimiter, config.quote, config.escape);
      const row = {};

      headers.forEach((header, index) => {
        let value = values[index] || '';
        if (config.enableTypeDetection && value !== '') {
          value = detectAndConvertType(value);
        }
        row[header] = value;
      });

      batch.push(row);
    } catch (error) {
      console.warn(`Error parsing line ${i}: ${error.message}`);
    }
  }

  return batch;
}

// Export functions for testing (if in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSVOptimized,
    parseCSVLine,
    detectAndConvertType,
    estimateMemoryUsage
  };
}