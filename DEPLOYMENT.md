# Deployment Guide

This guide will help you deploy your Health Tracker app to production.

## Deploy to Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com).

### Option 1: Deploy from GitHub

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "New Project" and import your repository

4. Vercel will auto-detect Next.js settings. Click "Deploy"

5. Your app will be live in ~2 minutes!

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to deploy

## Deploy to Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build your app:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

## Environment Variables

No environment variables are required for basic functionality since the app uses browser localStorage.

For production, you may want to set:
- `NEXT_PUBLIC_APP_URL` - Your app's public URL

## Custom Domain

### Vercel
1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

### Netlify
1. Go to "Domain settings" in your Netlify project
2. Add your custom domain
3. Configure DNS settings

## Post-Deployment Checklist

- [ ] Test all pages (Dashboard, Nutrition, Exercise, Predictions, Remedies)
- [ ] Verify data persistence (add entries and refresh page)
- [ ] Test CSV import functionality
- [ ] Check predictions are calculating correctly
- [ ] Verify responsive design on mobile devices
- [ ] Test remedy effectiveness feedback
- [ ] Ensure charts render properly

## Monitoring & Analytics

Consider adding:
- **Vercel Analytics** - Built-in performance monitoring
- **Google Analytics** - User behavior tracking
- **Sentry** - Error tracking and monitoring

## Performance Optimization

The app is optimized for performance with:
- ✅ Next.js App Router with automatic code splitting
- ✅ Client-side rendering for interactive features
- ✅ Lightweight localStorage for data persistence
- ✅ Optimized bundle size with tree-shaking

## Security Considerations

- All data is stored locally in the browser
- No backend or database required
- No sensitive data transmitted over network
- Consider adding authentication for shared device scenarios

## Scaling Options

If you need to scale beyond localStorage:

1. **Add a Database** - PostgreSQL, MongoDB, or Supabase
2. **User Authentication** - NextAuth.js, Clerk, or Auth0
3. **Cloud Storage** - For CSV files and exports
4. **API Routes** - Add Next.js API routes for server-side logic

## Troubleshooting

### Build Errors
- Run `npm run build` locally to catch errors
- Check Node.js version (requires 18+)
- Clear `.next` cache: `rm -rf .next`

### Runtime Issues
- Check browser console for errors
- Verify localStorage is enabled
- Test in incognito mode to rule out extension conflicts

## Support

For deployment issues:
- Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- Visit [Vercel Documentation](https://vercel.com/docs)
- Open an issue in the GitHub repository
