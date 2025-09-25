# Performance Monitoring Setup - ClearLane Initiative

## Core Web Vitals Monitoring

### Target Performance Metrics
```
Largest Contentful Paint (LCP): < 2.5 seconds
First Input Delay (FID): < 100 milliseconds
Cumulative Layout Shift (CLS): < 0.1
First Contentful Paint (FCP): < 1.8 seconds
Time to Interactive (TTI): < 3.8 seconds
Total Blocking Time (TBT): < 200 milliseconds
```

### Vercel Built-in Monitoring
```javascript
// astro.config.mjs - Already configured
export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    speedInsights: {
      enabled: true
    }
  })
});

// Automatic monitoring includes:
// - Real User Monitoring (RUM)
// - Core Web Vitals tracking
// - Performance score trends
// - Geographic performance data
// - Device-specific metrics
```

### Custom Performance Tracking
```javascript
// src/scripts/performance-monitor.ts
class PerformanceMonitor {
  private observer: PerformanceObserver;

  constructor() {
    this.initializeObserver();
    this.trackPageLoad();
    this.trackResourceTiming();
    this.trackUserTiming();
  }

  private initializeObserver() {
    if ('PerformanceObserver' in window) {
      // Core Web Vitals
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      this.observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      });
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    const data = {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Send to analytics
    this.reportMetric(data);

    // Alert on poor performance
    this.checkThresholds(entry);
  }

  private checkThresholds(entry: PerformanceEntry) {
    const thresholds = {
      'largest-contentful-paint': 2500,
      'first-input': 100,
      'layout-shift': 0.1
    };

    const threshold = thresholds[entry.entryType];
    if (threshold && entry.startTime > threshold) {
      console.warn(`Performance threshold exceeded: ${entry.entryType} = ${entry.startTime}ms`);

      // Report to monitoring service
      this.reportAlert({
        metric: entry.entryType,
        value: entry.startTime,
        threshold,
        severity: 'warning'
      });
    }
  }
}
```

## Uptime Monitoring

### UptimeRobot Configuration
```yaml
# Primary monitors
Monitors:
  - name: "ClearLane Main Site"
    url: "https://clearlane.org"
    type: "HTTP(s)"
    interval: 5 # minutes
    timeout: 30 # seconds

  - name: "ClearLane API Health"
    url: "https://clearlane.org/api/health"
    type: "HTTP(s)"
    interval: 5
    expected_status: 200

  - name: "ClearLane Policy Brief"
    url: "https://clearlane.org/policy-brief"
    type: "HTTP(s)"
    interval: 15

  - name: "ClearLane Research Data"
    url: "https://clearlane.org/methodology"
    type: "HTTP(s)"
    interval: 15

# Alert channels
Alerts:
  - email: "admin@clearlane.org"
  - webhook: "https://hooks.slack.com/services/..."
  - sms: "+1234567890" # Emergency only

# Thresholds
Settings:
  - downtime_threshold: 2 # minutes
  - response_time_threshold: 5000 # ms
  - ssl_expiry_threshold: 30 # days
```

### Status Page Configuration
```html
<!-- Public status page embed -->
<div id="status-page">
  <h3>System Status</h3>
  <div class="status-item">
    <span class="status-name">Website</span>
    <span class="status-indicator operational">Operational</span>
  </div>
  <div class="status-item">
    <span class="status-name">API Services</span>
    <span class="status-indicator operational">Operational</span>
  </div>
  <div class="status-item">
    <span class="status-name">Data Dashboard</span>
    <span class="status-indicator operational">Operational</span>
  </div>
</div>
```

## Error Monitoring and Reporting

### Sentry Integration
```javascript
// src/scripts/error-monitoring.ts
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.PUBLIC_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter out common non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('Script error')) {
        return null;
      }
    }
    return event;
  },
  initialScope: {
    tags: {
      component: "clearlane-website",
      version: process.env.npm_package_version
    },
    user: {
      id: window.clearLaneAnalytics?.sessionId
    }
  }
});

// Custom error boundaries
class ErrorBoundary {
  static captureException(error: Error, context?: any) {
    Sentry.captureException(error, {
      contexts: {
        custom: context
      }
    });
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'error') {
    Sentry.captureMessage(message, level);
  }
}

export { ErrorBoundary };
```

### Custom Error Tracking
```javascript
// Error event handlers
window.addEventListener('error', (event) => {
  const errorData = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Send to monitoring service
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  const errorData = {
    type: 'unhandled_promise_rejection',
    reason: event.reason?.toString(),
    stack: event.reason?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };

  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  });
});
```

## Analytics and User Behavior Monitoring

### Google Analytics 4 Setup
```html
<!-- gtag implementation -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'GA_MEASUREMENT_ID', {
    // Enhanced measurement
    enhanced_measurements: {
      scrolls: true,
      outbound_clicks: true,
      site_search: true,
      video_engagement: true,
      file_downloads: true
    },

    // Custom parameters
    custom_map: {
      'custom_parameter_1': 'user_type',
      'custom_parameter_2': 'engagement_level'
    },

    // Content groups
    content_group1: 'Page Category',
    content_group2: 'User Type',
    content_group3: 'Traffic Source'
  });
</script>
```

### Key Performance Indicators (KPIs)
```yaml
Website Performance:
  - Page Load Speed: Target < 3s
  - Bounce Rate: Target < 60%
  - Session Duration: Target > 2 minutes
  - Pages per Session: Target > 2.5

User Engagement:
  - Policy Brief Downloads: Track monthly
  - Research Data Access: Track interactions
  - Contact Form Submissions: Track conversions
  - Newsletter Signups: Track growth rate

Content Performance:
  - Most Viewed Pages: Track engagement
  - Time on Research Pages: Target > 3 minutes
  - Social Shares: Track virality
  - External Link Clicks: Track referrals

Technical Metrics:
  - API Response Times: Target < 500ms
  - Error Rates: Target < 0.1%
  - Uptime: Target 99.9%
  - SSL Certificate Health: Monitor expiry
```

### Custom Events Tracking
```javascript
// Research-specific events
gtag('event', 'research_engagement', {
  event_category: 'Research',
  event_label: 'Methodology Access',
  value: 1,
  custom_parameter_1: 'researcher'
});

// Policy engagement
gtag('event', 'policy_engagement', {
  event_category: 'Policy',
  event_label: 'Brief Download',
  value: 1,
  custom_parameter_1: 'policy_maker'
});

// Student interaction
gtag('event', 'student_story_view', {
  event_category: 'Engagement',
  event_label: 'Student Testimonial',
  value: 1,
  custom_parameter_1: 'student'
});
```

## Security Monitoring

### SSL Certificate Monitoring
```yaml
SSL_Monitoring:
  primary_domain: "clearlane.org"
  subdomains:
    - "www.clearlane.org"
    - "api.clearlane.org"
    - "dashboard.clearlane.org"

  checks:
    - certificate_expiry: 30_days_warning
    - certificate_validity: daily_check
    - cipher_strength: weekly_check
    - protocol_version: weekly_check

  alerts:
    - email: "security@clearlane.org"
    - slack: "#alerts-security"
    - urgency: "high" # for expiry < 7 days
```

### Security Headers Monitoring
```javascript
// Check security headers
const securityHeaders = [
  'Strict-Transport-Security',
  'Content-Security-Policy',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy'
];

fetch(window.location.href, { method: 'HEAD' })
  .then(response => {
    const headers = Object.fromEntries(response.headers.entries());
    const missingHeaders = securityHeaders.filter(header =>
      !headers[header.toLowerCase()]
    );

    if (missingHeaders.length > 0) {
      console.warn('Missing security headers:', missingHeaders);
      // Report to monitoring service
    }
  });
```

## Performance Optimization Monitoring

### Bundle Size Monitoring
```javascript
// webpack-bundle-analyzer equivalent for Vite/Astro
// Monitor bundle sizes in CI/CD
const bundleMonitor = {
  thresholds: {
    'main.js': 250000, // 250KB
    'vendor.js': 500000, // 500KB
    'total': 1000000 // 1MB total
  },

  check() {
    // Check against thresholds
    // Alert if exceeded
    // Generate reports
  }
};
```

### Image Optimization Monitoring
```javascript
// Track image loading performance
const imageObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.initiatorType === 'img') {
      const loadTime = entry.responseEnd - entry.startTime;
      const size = entry.transferSize;

      if (loadTime > 2000) { // 2 seconds
        console.warn(`Slow image load: ${entry.name} (${loadTime}ms)`);
      }

      if (size > 500000) { // 500KB
        console.warn(`Large image: ${entry.name} (${size} bytes)`);
      }
    }
  });
});

imageObserver.observe({ entryTypes: ['resource'] });
```

## Monitoring Dashboard Configuration

### Grafana Dashboard Setup
```yaml
# Dashboard panels
Panels:
  - title: "Website Performance"
    metrics:
      - avg_response_time
      - requests_per_minute
      - error_rate
      - uptime_percentage

  - title: "User Engagement"
    metrics:
      - active_users
      - session_duration
      - bounce_rate
      - conversion_rate

  - title: "Content Performance"
    metrics:
      - page_views
      - time_on_page
      - social_shares
      - downloads

  - title: "Technical Health"
    metrics:
      - api_response_times
      - database_query_time
      - cache_hit_rate
      - memory_usage

# Alerts configuration
Alerts:
  - name: "High Error Rate"
    condition: "error_rate > 5%"
    duration: "5m"
    severity: "critical"

  - name: "Slow Response Time"
    condition: "avg_response_time > 3s"
    duration: "10m"
    severity: "warning"

  - name: "Low Uptime"
    condition: "uptime < 99%"
    duration: "1h"
    severity: "critical"
```

### Daily Monitoring Report Template
```yaml
Daily_Report:
  performance:
    - average_page_load_time
    - core_web_vitals_scores
    - uptime_percentage
    - error_count

  traffic:
    - unique_visitors
    - page_views
    - traffic_sources
    - geographic_distribution

  engagement:
    - session_duration
    - bounce_rate
    - goal_completions
    - social_interactions

  content:
    - top_performing_pages
    - research_data_access
    - policy_brief_downloads
    - contact_form_submissions

  technical:
    - api_performance
    - database_response_times
    - cache_performance
    - security_alerts
```

## Incident Response Procedures

### Alert Response Workflow
```yaml
Incident_Types:
  P1_Critical:
    - site_completely_down
    - data_breach_suspected
    - ssl_certificate_expired
    response_time: "15 minutes"
    escalation: "immediate"

  P2_High:
    - slow_response_times
    - partial_functionality_down
    - high_error_rates
    response_time: "1 hour"
    escalation: "2 hours"

  P3_Medium:
    - performance_degradation
    - non_critical_feature_issues
    response_time: "4 hours"
    escalation: "24 hours"

Response_Steps:
  1. acknowledge_alert
  2. assess_impact
  3. implement_fix_or_workaround
  4. monitor_resolution
  5. document_incident
  6. conduct_post_mortem
```

### Communication Templates
```yaml
Status_Updates:
  investigating:
    message: "We are investigating reports of [issue]. Updates will be provided every 30 minutes."
    channels: ["status_page", "twitter", "email_list"]

  identified:
    message: "We have identified the root cause of [issue] and are implementing a fix."
    channels: ["status_page", "twitter"]

  resolved:
    message: "The issue has been resolved. All systems are operating normally."
    channels: ["status_page", "twitter", "email_list"]

Post_Incident:
  timeline: "within 48 hours"
  content:
    - incident_summary
    - root_cause_analysis
    - impact_assessment
    - remediation_steps
    - prevention_measures
```