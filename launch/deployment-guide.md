# Deployment Guide - ClearLane Initiative

## Quick Deployment Commands

### Initial Setup
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 3. Build the project
npm run build

# 4. Deploy to Vercel
vercel --prod

# 5. Configure custom domain
vercel domains add clearlane.org
vercel alias set your-deployment-url.vercel.app clearlane.org
```

### Environment Variables Setup
```bash
# Copy template and customize
cp .env.example .env

# Required variables for production:
PUBLIC_SITE_URL=https://clearlane.org
PUBLIC_SITE_NAME="ClearLane Initiative"
PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
PUBLIC_GTM_ID=GTM-XXXXXXX

# Email service (choose one)
SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXX
# OR
MAILCHIMP_API_KEY=xxxxxxxxxxxxxxxx-us1

# Analytics (optional but recommended)
SENTRY_DSN=https://xxxxxxxx@sentry.io/xxxxxx
HOTJAR_ID=xxxxxxx

# Add to Vercel
vercel env add PUBLIC_SITE_URL
vercel env add SENDGRID_API_KEY
# ... repeat for all required variables
```

## Deployment Checklist

### Pre-Deployment Verification
```bash
# 1. Run all tests
npm run test

# 2. Check build works locally
npm run build
npm run preview

# 3. Lint code
npm run lint

# 4. Check types (if using TypeScript)
npm run typecheck

# 5. Audit dependencies
npm audit

# 6. Performance check
npm run lighthouse # if configured
```

### Production Deployment Steps

#### Step 1: Vercel Account Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (run in project root)
vercel link
```

#### Step 2: Configure Vercel Project
```bash
# Set up environment variables in Vercel dashboard or CLI
vercel env add PUBLIC_SITE_URL production
vercel env add SENDGRID_API_KEY production
vercel env add PUBLIC_GOOGLE_ANALYTICS_ID production

# Deploy to production
vercel --prod
```

#### Step 3: Domain Configuration
```bash
# Add your domain
vercel domains add clearlane.org

# Set up alias
vercel alias set your-deployment-url.vercel.app clearlane.org

# Verify DNS settings
dig clearlane.org
nslookup clearlane.org
```

### DNS Configuration
```dns
# A Records (if using custom DNS)
clearlane.org.     A    76.76.19.19
www.clearlane.org. A    76.76.19.19

# CNAME Records (recommended)
www.clearlane.org. CNAME cname.vercel-dns.com.

# Required for email (if using custom email)
clearlane.org.     MX   1 smtp.google.com.
clearlane.org.     TXT  "v=spf1 include:_spf.google.com ~all"

# Verification records
clearlane.org.     TXT  "google-site-verification=XXXXXXXXXX"
clearlane.org.     TXT  "facebook-domain-verification=XXXXXXXXXX"
```

## CI/CD Pipeline Setup

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Build project
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Required GitHub Secrets
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

## Performance Optimization

### Build Optimization
```javascript
// astro.config.mjs optimizations already included
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'chart-libs': ['d3', 'chart.js'],
            'map-libs': ['leaflet', 'mapbox-gl'],
            'utils': ['date-fns', 'lodash-es']
          }
        }
      }
    }
  }
});
```

### Image Optimization
```bash
# Optimize images before deployment
npm install -g @squoosh/cli

# Optimize all images
squoosh-cli --resize '{width:1920,height:1080}' --webp '{quality:80}' public/images/*.jpg
squoosh-cli --resize '{width:1920,height:1080}' --webp '{quality:80}' public/images/*.png
```

## Security Configuration

### Environment Variables Security
```bash
# Never commit these to git
echo "*.env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use Vercel environment variables for production
vercel env add SENDGRID_API_KEY production
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
```

### Security Headers Verification
```bash
# Test security headers after deployment
curl -I https://clearlane.org

# Should include:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
```

## Monitoring Setup

### Post-Deployment Monitoring
```bash
# 1. Verify website is accessible
curl -s -o /dev/null -w "%{http_code}" https://clearlane.org
# Should return 200

# 2. Test critical pages
curl -s https://clearlane.org/methodology | grep -q "Research Methodology"
curl -s https://clearlane.org/solution | grep -q "Policy Framework"
curl -s https://clearlane.org/contact | grep -q "Contact Form"

# 3. Verify analytics tracking
# Check browser network tab for Google Analytics calls

# 4. Test form submissions
# Manually test contact form and newsletter signup
```

### Performance Testing
```bash
# Install lighthouse CLI
npm install -g lighthouse

# Test performance
lighthouse https://clearlane.org --output=html --output-path=./lighthouse-report.html

# Target scores:
# Performance: >90
# Accessibility: >95
# Best Practices: >90
# SEO: >95
```

## Troubleshooting Common Issues

### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vercel cache
vercel --debug

# Check build logs
vercel logs your-deployment-url.vercel.app
```

### DNS Issues
```bash
# Check DNS propagation
dig @8.8.8.8 clearlane.org
dig @1.1.1.1 clearlane.org

# Flush local DNS cache
# macOS:
sudo dscacheutil -flushcache
# Linux:
sudo systemctl restart systemd-resolved
# Windows:
ipconfig /flushdns
```

### SSL Certificate Issues
```bash
# Check SSL certificate
openssl s_client -connect clearlane.org:443 -servername clearlane.org

# Test SSL grade
# Visit: https://www.ssllabs.com/ssltest/
# Target: A or A+ rating
```

### Performance Issues
```bash
# Analyze bundle size
npm run build
npm run analyze # if configured

# Check for unused dependencies
npm install -g depcheck
depcheck

# Optimize images
npm run optimize-images # if configured
```

## Rollback Procedures

### Emergency Rollback
```bash
# Get list of recent deployments
vercel list

# Rollback to previous deployment
vercel rollback your-previous-deployment-url.vercel.app

# Update domain alias to rollback
vercel alias set your-previous-deployment-url.vercel.app clearlane.org
```

### Gradual Rollout
```bash
# Deploy to preview first
vercel

# Test preview deployment thoroughly
# Then promote to production
vercel --prod

# Or use specific URL
vercel alias set your-new-deployment-url.vercel.app clearlane.org
```

## Post-Deployment Checklist

### Immediate Verification (0-15 minutes)
```
□ Website loads correctly at https://clearlane.org
□ All main pages accessible (/, /methodology, /solution, /about, /contact)
□ SSL certificate active and valid
□ Contact form submits successfully
□ Newsletter signup works
□ Social media links function
□ Analytics tracking active (check Real-time reports)
□ No console errors in browser
□ Mobile responsiveness verified
□ Print layouts working (test /policy-brief)
```

### Extended Testing (15-60 minutes)
```
□ All forms submit and emails deliver
□ External links work correctly
□ PDF downloads function
□ Search functionality (if implemented)
□ Performance scores meet targets (Lighthouse)
□ Social media previews display correctly
□ Meta tags and structured data valid
□ Sitemap accessible and valid
□ Robots.txt accessible
□ 404 pages display correctly
```

### 24-Hour Monitoring
```
□ Analytics data flowing correctly
□ No error spikes in monitoring
□ Website uptime 100%
□ Performance metrics stable
□ Search console no critical issues
□ Email deliverability confirmed
□ Social media sharing working
□ User feedback positive
□ No security alerts
□ DNS propagation complete globally
```

## Maintenance & Updates

### Regular Update Schedule
```bash
# Weekly maintenance (Fridays)
npm audit fix
npm update
npm run test
npm run build

# Deploy updates
vercel --prod

# Monthly security updates
npm audit --audit-level high
# Address any high/critical vulnerabilities
```

### Content Updates
```bash
# Update research data
# Edit files in src/data/
git add .
git commit -m "Update research data for [month]"
git push origin main
# Auto-deploys via GitHub Actions
```

### Emergency Hotfixes
```bash
# Create hotfix branch
git checkout -b hotfix/critical-fix

# Make minimal changes
# Test locally
npm run build && npm run preview

# Deploy directly
vercel --prod

# Merge back to main
git checkout main
git merge hotfix/critical-fix
git push origin main
```

## Support & Resources

### Key Contacts
```
Technical Issues: tech@clearlane.org
Domain/DNS Issues: admin@clearlane.org
Emergency Contact: +1-XXX-XXX-XXXX
```

### Useful Commands Reference
```bash
# Quick deployment
vercel --prod

# Check deployment status
vercel list

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME

# Domain management
vercel domains ls
vercel domains add domain.com
vercel domains rm domain.com

# Rollback
vercel rollback deployment-url.vercel.app
```

### External Tools
```
Vercel Dashboard: https://vercel.com/dashboard
Google Analytics: https://analytics.google.com
Google Search Console: https://search.google.com/search-console
SSL Labs Test: https://www.ssllabs.com/ssltest/
PageSpeed Insights: https://pagespeed.web.dev/
GTmetrix: https://gtmetrix.com/
```

---

**Deployment Status:** ✅ Ready for Production

**Last Updated:** September 2024

**Next Review:** After successful launch + 30 days