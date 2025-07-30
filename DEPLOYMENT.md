# 🚀 Production Deployment Guide

## ✅ **Pre-Deployment Checklist**

### **1. Clean Project Structure**
- [x] Removed temporary files and backups
- [x] Archived documentation to `docs/archive/`
- [x] Updated Stripe price IDs to production values
- [x] Project ready for production deployment

### **2. Production Stripe Setup**
- [x] Created 5 bonus generation products in live Stripe
- [x] Generated production price IDs for bonus plans
- [x] Updated Edge Functions to handle all plan types
- [x] Created create-custom-checkout-session function
- [ ] **TODO**: Create Premium Monthly/Yearly products in Stripe Dashboard

**Production Price IDs:**

**Bonus Plans (One-time purchases):**
- 25 generations: `price_1RqblRKxt1K8sHTse244uKgk` ($7.00)
- 50 generations: `price_1RqblqKxt1K8sHTsb91kdO6k` ($15.00)
- 100 generations: `price_1RqblyKxt1K8sHTsSDdc8HTg` ($30.00)
- 200 generations: `price_1Rqbm6Kxt1K8sHTsLICJIlLv` ($60.00)
- 500 generations: `price_1RqbmFKxt1K8sHTsYS7PPyYf` ($100.00)

**Pro Plans (Fixed subscriptions):**
- Pro Monthly: `price_1RqAm93w4DtUFPEWLqzXIUVv` ($15.00/month)
- Pro Yearly: `price_1RqAmL3w4DtUFPEWsJ0njITd` ($120.00/year)

**Premium Plans (Fixed subscriptions) - TO BE CREATED:**
- Premium Monthly: `price_PREMIUM_MONTHLY_TO_BE_CREATED` ($49.00/month)
- Premium Yearly: `price_PREMIUM_YEARLY_TO_BE_CREATED` ($490.00/year)

**Custom Premium Plans:**
- Created dynamically via `create-custom-checkout-session` Edge Function
- Pricing: $20-$1000 based on generation count (100-5000)
- Supports both monthly and yearly billing

## 🔧 **Vercel Deployment Steps**

### **Step 1: GitHub Repository**
1. Create new GitHub repository
2. Push cleaned project code:
```bash
git init
git add .
git commit -m "Initial production setup"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### **Step 2: Vercel Configuration**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select your repository

**Build Settings:**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **Step 3: Environment Variables**
Add these in Vercel Dashboard → Settings → Environment Variables:

**Frontend Variables:**
```
VITE_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
VITE_STRIPE_PUBLISHABLE_KEY=your_production_stripe_key
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

**Supabase Edge Function Variables (set in Supabase dashboard):**
```
STRIPE_SECRET_KEY=your_production_stripe_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
STRIPE_WEBHOOK_SECRET=your_production_webhook_secret
```

## 🏗️ **Production Services Setup**

### **1. Production Supabase Project**
- Create new Supabase project for production
- Run database migrations from `docs/archive/*.sql`
- Deploy Edge Functions:
```bash
supabase functions deploy --project-ref YOUR_PROD_PROJECT_REF
```

### **2. Production Clerk Application**
- Create new Clerk application for production
- Configure production domain
- Set up authentication providers

### **3. Stripe Webhook Configuration**
- Set webhook URL to: `https://YOUR_DOMAIN.vercel.app/functions/v1/stripe-webhook`
- Enable events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## 🔍 **Testing Checklist**

### **Before Going Live:**
- [ ] Test user registration/login
- [ ] Test subscription signup flow  
- [ ] Test bonus plan purchases
- [ ] Test workflow generation with different user types
- [ ] Test billing cycle resets
- [ ] Test subscription cancellation
- [ ] Verify webhook processing

### **Payment Flow Testing:**
- [ ] Free user → Pro subscription
- [ ] Pro user → Bonus plan purchase
- [ ] Monthly billing cycle reset
- [ ] Subscription cancellation

## 🌐 **Custom Domain (Optional)**
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

## 📊 **Post-Deployment Monitoring**
- Monitor Vercel deployment logs
- Check Supabase Edge Function logs
- Monitor Stripe webhook events
- Set up error tracking (optional)

## 🚨 **Important Notes**
- Keep test and production environments separate
- Never use test Stripe keys in production
- Regularly backup production database
- Monitor usage and costs
- Test payment flows in Stripe test mode first

## 🛠️ **Troubleshooting**
If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure Edge Functions are deployed to production Supabase
4. Test webhook endpoints are accessible
5. Verify Clerk production domain configuration