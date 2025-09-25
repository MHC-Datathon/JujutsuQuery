/**
 * Analytics Tracking System for ClearLane Initiative
 * Comprehensive event tracking with privacy compliance
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

interface UserProperties {
  session_id: string;
  user_type?: 'student' | 'policy_maker' | 'researcher' | 'advocate' | 'media' | 'general';
  referrer_source?: string;
  page_category?: string;
  engagement_level?: 'low' | 'medium' | 'high';
}

class ClearLaneAnalytics {
  private sessionId: string;
  private userProperties: UserProperties;
  private isEnabled: boolean;
  private queue: AnalyticsEvent[] = [];
  private flushTimeout: number | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userProperties = {
      session_id: this.sessionId,
      referrer_source: this.getReferrerSource(),
      page_category: this.getPageCategory()
    };
    this.isEnabled = this.checkTrackingConsent();

    if (this.isEnabled) {
      this.initializeTracking();
    }
  }

  private generateSessionId(): string {
    return `cls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getReferrerSource(): string {
    const referrer = document.referrer;
    if (!referrer) return 'direct';

    const url = new URL(referrer);
    const domain = url.hostname.toLowerCase();

    // Social media sources
    if (domain.includes('twitter.com') || domain.includes('t.co')) return 'twitter';
    if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'facebook';
    if (domain.includes('linkedin.com')) return 'linkedin';
    if (domain.includes('instagram.com')) return 'instagram';
    if (domain.includes('tiktok.com')) return 'tiktok';

    // Search engines
    if (domain.includes('google.com')) return 'google';
    if (domain.includes('bing.com')) return 'bing';
    if (domain.includes('duckduckgo.com')) return 'duckduckgo';

    // News and media
    if (domain.includes('reddit.com')) return 'reddit';
    if (domain.includes('nytimes.com')) return 'nytimes';
    if (domain.includes('gothamist.com')) return 'gothamist';
    if (domain.includes('ny1.com')) return 'ny1';

    // Academic and research
    if (domain.includes('cuny.edu')) return 'cuny';
    if (domain.includes('columbia.edu')) return 'columbia';
    if (domain.includes('nyu.edu')) return 'nyu';
    if (domain.includes('.edu')) return 'academic';

    // Government
    if (domain.includes('nyc.gov')) return 'nyc_gov';
    if (domain.includes('mta.info')) return 'mta';
    if (domain.includes('.gov')) return 'government';

    return 'referral';
  }

  private getPageCategory(): string {
    const path = window.location.pathname;

    if (path === '/') return 'home';
    if (path.includes('/methodology')) return 'research';
    if (path.includes('/findings')) return 'research';
    if (path.includes('/solution')) return 'policy';
    if (path.includes('/about')) return 'about';
    if (path.includes('/contact')) return 'engagement';
    if (path.includes('/press')) return 'media';
    if (path.includes('/policy')) return 'policy';

    return 'general';
  }

  private checkTrackingConsent(): boolean {
    // Check for consent cookie or localStorage
    const consent = localStorage.getItem('clearlane_analytics_consent');
    const doNotTrack = navigator.doNotTrack === '1' ||
                       (window as any).doNotTrack === '1' ||
                       navigator.msDoNotTrack === '1';

    return consent === 'accepted' && !doNotTrack;
  }

  private initializeTracking(): void {
    // Track page view
    this.trackPageView();

    // Track user engagement
    this.trackEngagement();

    // Track scroll depth
    this.trackScrollDepth();

    // Track external links
    this.trackExternalLinks();

    // Track form interactions
    this.trackFormInteractions();

    // Track research data interactions
    this.trackResearchInteractions();

    // Flush queue periodically
    this.startQueueFlush();
  }

  private trackPageView(): void {
    this.track('page_view', {
      page_url: window.location.href,
      page_title: document.title,
      page_category: this.userProperties.page_category,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  private trackEngagement(): void {
    let engagementScore = 0;
    const startTime = Date.now();

    // Track time on page
    const updateEngagement = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      if (timeSpent > 30) engagementScore += 1;
      if (timeSpent > 120) engagementScore += 1;
      if (timeSpent > 300) engagementScore += 1;

      const level = engagementScore >= 3 ? 'high' : engagementScore >= 1 ? 'medium' : 'low';
      this.userProperties.engagement_level = level;
    };

    // Track active time (not just time on page)
    let lastActivity = Date.now();
    let totalActiveTime = 0;

    const trackActivity = () => {
      const now = Date.now();
      if (now - lastActivity < 60000) { // Within 1 minute = active
        totalActiveTime += now - lastActivity;
      }
      lastActivity = now;
      updateEngagement();
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Track page exit
    window.addEventListener('beforeunload', () => {
      this.track('page_exit', {
        time_on_page: Math.floor((Date.now() - startTime) / 1000),
        active_time: Math.floor(totalActiveTime / 1000),
        engagement_score: engagementScore,
        engagement_level: this.userProperties.engagement_level
      });
      this.flush();
    });
  }

  private trackScrollDepth(): void {
    const scrollMilestones = [25, 50, 75, 90, 100];
    const reached: Set<number> = new Set();

    const checkScrollDepth = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      scrollMilestones.forEach(milestone => {
        if (scrollPercent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          this.track('scroll_depth', {
            depth_percent: milestone,
            page_category: this.userProperties.page_category
          });
        }
      });
    };

    window.addEventListener('scroll', checkScrollDepth, { passive: true });
  }

  private trackExternalLinks(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        const url = new URL(link.href);
        const isExternal = url.hostname !== window.location.hostname;

        if (isExternal) {
          this.track('external_link_click', {
            link_url: link.href,
            link_text: link.textContent?.trim(),
            link_domain: url.hostname,
            context: this.getLinkContext(link)
          });
        }
      }
    });
  }

  private getLinkContext(link: HTMLElement): string {
    const section = link.closest('section');
    const nav = link.closest('nav');
    const footer = link.closest('footer');

    if (nav) return 'navigation';
    if (footer) return 'footer';
    if (section?.id) return `section_${section.id}`;

    return 'content';
  }

  private trackFormInteractions(): void {
    // Track form starts
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const form = target.closest('form');
        if (form) {
          const formId = form.id || form.className || 'unknown';
          this.track('form_start', {
            form_id: formId,
            field_name: (target as HTMLInputElement).name || 'unknown',
            field_type: (target as HTMLInputElement).type || target.tagName.toLowerCase()
          });
        }
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';

      this.track('form_submit', {
        form_id: formId,
        form_method: form.method || 'get',
        form_action: form.action || window.location.href
      });
    });
  }

  private trackResearchInteractions(): void {
    // Track data visualization interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Chart interactions
      if (target.closest('.chart-container')) {
        this.track('chart_interaction', {
          chart_type: target.closest('.chart-container')?.getAttribute('data-chart-type') || 'unknown',
          interaction_type: 'click',
          page_category: this.userProperties.page_category
        });
      }

      // Data table interactions
      if (target.closest('.data-table')) {
        this.track('data_table_interaction', {
          table_id: target.closest('.data-table')?.id || 'unknown',
          interaction_type: 'click'
        });
      }

      // Research methodology links
      if (target.closest('a')?.href.includes('/methodology')) {
        this.track('methodology_access', {
          source_page: this.userProperties.page_category,
          link_context: this.getLinkContext(target)
        });
      }

      // Policy recommendation interactions
      if (target.closest('.policy-recommendation')) {
        this.track('policy_engagement', {
          recommendation_id: target.closest('.policy-recommendation')?.id || 'unknown',
          interaction_type: 'click'
        });
      }
    });
  }

  private startQueueFlush(): void {
    // Flush queue every 10 seconds
    this.flushTimeout = window.setInterval(() => {
      this.flush();
    }, 10000);

    // Also flush on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });
  }

  public track(event: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        ...this.userProperties,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.queue.push(analyticsEvent);

    // Flush immediately for important events
    const importantEvents = ['form_submit', 'external_link_click', 'policy_engagement'];
    if (importantEvents.includes(event)) {
      this.flush();
    }
  }

  public flush(): void {
    if (this.queue.length === 0 || !this.isEnabled) return;

    const events = [...this.queue];
    this.queue = [];

    // Send to analytics API
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        session_id: this.sessionId
      })
    }).catch(error => {
      console.error('Analytics tracking failed:', error);
      // Re-queue events on failure
      this.queue.unshift(...events);
    });
  }

  public setUserType(userType: UserProperties['user_type']): void {
    this.userProperties.user_type = userType;
  }

  public identifyUser(properties: Partial<UserProperties>): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  public enableTracking(): void {
    localStorage.setItem('clearlane_analytics_consent', 'accepted');
    this.isEnabled = true;
    this.initializeTracking();
  }

  public disableTracking(): void {
    localStorage.setItem('clearlane_analytics_consent', 'declined');
    this.isEnabled = false;
    this.queue = [];
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
    }
  }
}

// Initialize analytics
declare global {
  interface Window {
    clearLaneAnalytics: ClearLaneAnalytics;
  }
}

// Auto-initialize
let analytics: ClearLaneAnalytics;

if (typeof window !== 'undefined') {
  analytics = new ClearLaneAnalytics();
  window.clearLaneAnalytics = analytics;

  // Expose tracking functions globally for easy use
  window.track = (event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  };
}

export { ClearLaneAnalytics };
export default analytics;