# ClearLane Initiative - Data Storytelling Website

## Project Overview

**Personal Story**: CUNY student who transforms 2-hour BxM10 commute into productive study time. Bus delays threaten this "rolling study hall" that's vital for academic success.

**Mission**: Building a data storytelling website about NYC bus enforcement using Astro + Tailwind CSS to showcase how targeted enforcement can improve CUNY student commutes.

## Technology Stack

### Core Framework
- **Astro** - Static site generator for performance and SEO
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **TypeScript** - Type safety and better development experience

### Data Visualization
- **D3.js** - Custom interactive visualizations
- **Chart.js** - Standard charts and graphs
- **Leaflet/Mapbox** - Interactive mapping
- **Observable Plot** - Grammar of graphics for quick charts

### Performance Requirements
- **Loading Time**: <3 seconds first paint
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO Optimized**: Server-side rendering with Astro

## Repository Structure Analysis

### Data Assets Available

#### Primary Datasets (dashboard/insights/)
- **top_hotspots.csv** (151KB) - Violation hotspots with coordinates
- **hourly_counts.csv** (9.6MB) - Temporal violation patterns
- **stop_counts.csv** (27MB) - Violations by bus stop
- **route_counts.csv** (603KB) - Violations by bus route
- **monthly_counts.csv** (76KB) - Monthly violation trends
- **weekday_counts.csv** (603KB) - Day-of-week patterns

#### CUNY-Specific Analysis (dashboard/insights/CUNY_Insights/)
- **campus_summary_2025.csv** - Violations per CUNY campus
- **violations_monthly_trend_2025.csv** - Monthly trends near CUNY
- **routes_per_campus_tidy_2025.csv** - Bus routes serving each campus
- **violations_by_type_per_campus_2025.csv** - Violation types by campus

#### Processed Datasets (dashboard/dashboards/data/)
- **before_after_ace.csv** - Speed improvements from enforcement
- **shapes_routes.csv** (14MB) - GTFS route geometry data
- All insights data duplicated for dashboard use

### Existing Research Assets
- **4 Jupyter Notebooks** - Deep analysis in notebooks/ directory
- **Streamlit Dashboard** - Working prototype in dashboard/
- **3D Visualization** - Kepler.gl integration for bus route analysis

## Data Storytelling Strategy

### Narrative Flow
1. **Hook**: Personal story of the "rolling study hall"
2. **Problem**: How bus delays impact CUNY student success
3. **Analysis**: Data-driven insights about enforcement patterns
4. **Solution**: ClearLane targeted enforcement strategy
5. **Impact**: Projected improvements for student commutes

### Key Visualizations Needed
1. **Commute Map** - BxM10 route with study time annotations
2. **Violation Heatmap** - NYC-wide hotspots with CUNY overlay
3. **Temporal Patterns** - Rush hour enforcement gaps
4. **CUNY Impact Analysis** - Campus-specific violation data
5. **Before/After Comparison** - ACE program effectiveness
6. **Solution Dashboard** - ClearLane priority targets

## Development Commands

### Setup & Development
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format
```

### Data Processing
```bash
# Generate 3D map visualization
cd notebooks && python kepler_3d_map_generator.py

# Run existing Streamlit dashboard
python dashboard/run_dashboard.py

# Process raw data (if needed)
python -m data.process_violations
```

### Testing
```bash
# Run all tests
npm run test

# Run accessibility tests
npm run test:a11y

# Performance audits
npm run audit
```

## File Organization

### Astro Project Structure
```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── BaseLayout.astro
│   ├── DataViz/
│   │   ├── ViolationHeatmap.astro
│   │   ├── TemporalChart.astro
│   │   ├── CUNYAnalysis.astro
│   │   └── RouteVisualization.astro
│   ├── Story/
│   │   ├── PersonalNarrative.astro
│   │   ├── ProblemStatement.astro
│   │   ├── DataInsights.astro
│   │   └── SolutionProposal.astro
│   └── UI/
│       ├── Card.astro
│       ├── Button.astro
│       └── Modal.astro
├── pages/
│   ├── index.astro (main story)
│   ├── methodology.astro
│   ├── data-explorer.astro
│   └── about.astro
├── data/
│   ├── processed/ (CSV files optimized for web)
│   └── config/ (visualization settings)
├── styles/
│   └── global.css (Tailwind extensions)
└── scripts/
    ├── data-loader.ts
    └── chart-helpers.ts
```

### Content Strategy
- **Progressive Disclosure**: Start with personal story, reveal data complexity gradually
- **Interactive Elements**: Allow users to explore their own commute routes
- **Mobile Optimization**: Touch-friendly controls, readable text sizes
- **Performance First**: Lazy load heavy visualizations, optimize images

## Integration with Existing Work

### Streamlit Dashboard
- **Reuse Data Processing**: Leverage existing CSV generation
- **Component Inspiration**: Adapt successful UI patterns
- **3D Visualization**: Embed Kepler.gl maps in Astro pages

### Jupyter Notebooks
- **Analysis Foundation**: Use research as story backbone
- **Chart Recreation**: Convert matplotlib/seaborn to web-native D3
- **Data Pipeline**: Reference processing logic for consistency

## Performance Optimization

### Data Loading Strategy
- **Static Generation**: Pre-build pages with data at compile time
- **Code Splitting**: Load visualization libraries only when needed
- **Image Optimization**: Use Astro's built-in image processing
- **Progressive Enhancement**: Base functionality works without JS

### Accessibility Features
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliant color schemes
- **Alternative Text**: Descriptive alt text for all data visualizations

## Deployment Strategy

### Static Hosting Options
- **Netlify** - Automatic deploys from Git, edge functions for dynamic data
- **Vercel** - Excellent Astro support, global CDN
- **GitHub Pages** - Free hosting with custom domain support

### Content Delivery
- **Asset Optimization**: Compress images, minify CSS/JS
- **Caching Strategy**: Long-term cache for static assets
- **Progressive Loading**: Critical CSS inline, defer non-critical resources

## Success Metrics

### Performance Targets
- **Lighthouse Score**: >90 across all categories
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3s

### User Experience Goals
- **Engagement Time**: Average 5+ minutes on site
- **Conversion Rate**: 20% of visitors explore data interactively
- **Accessibility Score**: WAVE tool reports 0 errors

## Resources and References

### Data Sources
- MTA Bus Violations (Camera enforcement dataset)
- GTFS Bus Route Data (MTA feed)
- CUNY Campus Locations (institutional data)
- NYC Open Data (supporting datasets)

### Technical Documentation
- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS](https://tailwindcss.com/)
- [D3.js Gallery](https://observablehq.com/@d3/gallery)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Design Inspiration
- [The Pudding](https://pudding.cool/) - Data storytelling excellence
- [Observable](https://observablehq.com/) - Interactive data visualization
- [ProPublica](https://www.propublica.org/) - Investigative data journalism