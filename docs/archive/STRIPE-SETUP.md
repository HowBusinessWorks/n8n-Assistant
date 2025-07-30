# Stripe Payment Integration Setup

## ✅ What's Already Done
- 3 Supabase Edge Functions deployed
- Frontend payment integration complete
- Database migration file created

## 🔧 What You Need to Do

### 1. Get Your Stripe Information

**Create Stripe Account & Get Keys:**
1. Go to [stripe.com](https://stripe.com) and create account
2. In Dashboard → Developers → API Keys, get:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

**Create Stripe Products:**
1. In Dashboard → Products, create:
   - **Pro Monthly**: $15/month recurring
   - **Pro Yearly**: $120/year recurring (20% discount)
2. Copy the **Price IDs** (look like `price_1234567890`)

### 2. Set Environment Variables

In your Supabase Dashboard → Settings → Edge Functions, add:
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

In your project `.env` file, add:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 3. Run Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Copy and run the SQL from `supabase-subscriptions-setup.sql`

### 4. Update Stripe Price IDs

Replace placeholder price IDs in `src/services/stripe.ts`:
```typescript
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 15,
    interval: 'month',
    features: ['50 workflow generations per month', 'Priority support', 'Advanced templates'],
    stripePriceId: 'price_YOUR_ACTUAL_MONTHLY_PRICE_ID' // ← Update this
  },
  {
    id: 'pro_yearly', 
    name: 'Pro (Yearly)',
    price: 120,
    interval: 'year',
    features: ['50 workflow generations per month', 'Priority support', 'Advanced templates', '20% discount'],
    stripePriceId: 'price_YOUR_ACTUAL_YEARLY_PRICE_ID' // ← Update this
  }
];
```

### 5. Set Up Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://asljibfralcdthkuqosh.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to your Supabase env vars

## 🚀 How It Works

### Payment Flow:
1. User clicks upgrade → Stripe Checkout opens
2. Payment succeeds → Webhook updates database
3. User gets increased generation limits
4. Usage tracking automatically enforces limits

### Edge Functions:
- **create-checkout-session**: Standard Pro plans
- **create-custom-checkout-session**: Custom pricing (Premium)
- **stripe-webhook**: Handles payment success/cancellation

### Database:
- **user_subscriptions**: Stores plan info and limits
- **user_usage**: Tracks generation usage
- Functions automatically check limits before generation

## 🎯 Next Steps

1. Get your Stripe keys and price IDs
2. Send them to me so I can update the code
3. Run the database setup
4. Test a payment!

**Just provide me with your actual Stripe Price IDs and I'll update the frontend code!**