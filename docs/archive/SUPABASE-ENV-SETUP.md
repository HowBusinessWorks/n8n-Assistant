# Supabase Environment Variables Setup

## Required Actions in Your Supabase Dashboard

### 1. Go to Supabase Dashboard
1. Open [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Edge Functions**

### 2. Add Environment Variables
Click "Add new variable" and add these **exactly**:

```
Variable Name: STRIPE_SECRET_KEY
Value: sk_live_YOUR_STRIPE_SECRET_KEY_HERE
```

```
Variable Name: STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE
```

### 3. Run Database Setup
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the SQL from `supabase-subscriptions-setup.sql`
3. Run it to create the subscription tables

### 4. Test Your Setup
Once done, your Edge Functions will be able to:
- ✅ Create Stripe checkout sessions
- ✅ Handle payment webhooks
- ✅ Update user subscriptions automatically

## Important Notes
- These are **live** Stripe keys (not test keys)
- Double-check the variable names are exactly as shown
- The Edge Functions are already deployed and ready

**After setting these variables, your payment system will be fully functional!**