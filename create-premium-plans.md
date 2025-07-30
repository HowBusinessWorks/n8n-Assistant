# Create Premium Plans in Stripe Production

## Steps to create Premium plans in your Stripe Dashboard:

### 1. Premium Monthly Plan
1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. **Product Details:**
   - Name: `Premium Monthly`
   - Description: `Premium plan with unlimited workflow generations per month`
   - Image: (optional)

4. **Pricing:**
   - Price: `$49.00`
   - Billing period: `Monthly`
   - Currency: `USD`

5. **Advanced Settings:**
   - Usage type: `Licensed`
   - Click "Save product"

6. **Copy the Price ID** (starts with `price_`) and update the code

### 2. Premium Yearly Plan
1. Go to Stripe Dashboard → Products  
2. Click "Add product"
3. **Product Details:**
   - Name: `Premium Yearly`
   - Description: `Premium plan with unlimited workflow generations per year (30% discount)`
   - Image: (optional)

4. **Pricing:**
   - Price: `$490.00`
   - Billing period: `Yearly`
   - Currency: `USD`

5. **Advanced Settings:**
   - Usage type: `Licensed`
   - Click "Save product"

6. **Copy the Price ID** (starts with `price_`) and update the code

### 3. Update Code with Production Price IDs

Replace the placeholder price IDs in `src/services/stripe.ts`:

```typescript
{
  id: 'premium_monthly',
  name: 'Premium',
  price: 49,
  interval: 'month',
  features: ['Unlimited workflow generations', 'Premium support', 'Custom integrations'],
  stripePriceId: 'price_YOUR_PREMIUM_MONTHLY_ID_HERE'
},
{
  id: 'premium_yearly',
  name: 'Premium (Yearly)',
  price: 490,
  interval: 'year',
  features: ['Unlimited workflow generations', 'Premium support', 'Custom integrations', '30% discount'],
  stripePriceId: 'price_YOUR_PREMIUM_YEARLY_ID_HERE'
}
```

### 4. Verify Webhook Events
Ensure your Stripe webhook endpoint includes these events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Production Price IDs (to be filled in):
- Premium Monthly: `price_XXXXXXXXXXXXXXXXXX`
- Premium Yearly: `price_XXXXXXXXXXXXXXXXXX`