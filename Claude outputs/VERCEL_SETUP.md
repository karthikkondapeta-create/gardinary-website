# Vercel Functions Setup for Gardinary Stripe Integration

## ✅ Why Vercel Functions?
- **FREE** - No pay-as-you-go like Firebase
- **Already on Vercel** - Seamless deployment
- **Same functionality** - Full payment processing
- **Simple** - Just drop files in `/api` folder

---

## 🚀 Setup Steps

### Step 1: Create API Directory
In your project root, create a new folder:
```
gardinary/api/
```

### Step 2: Add Vercel Functions
Copy these files into `gardinary/api/`:
- `createPaymentIntent.js`
- `createPendingOrder.js`
- `calculateTax.js`
- `webhook.js`

### Step 3: Set Environment Variables

#### Local (.env.local for testing):
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_51Ue246CP02uZkTWVidOl0RA93XvtUC092hR68UdwSWoyskOtdMPDcaz6BUbnZvTEGyClD40hRdgzZJM3JMHpNiyj00LAOkSE1r
STRIPE_SECRET_KEY=sk_test_51Ue246CP02uZkTWVCnbFbSNahvZaZPT70Tihr5br0iPaPP1Kg7LYryId8ISQ1UQe0geN4bhB8WPV28JXsp9cuCBj00qimRKlPo
STRIPE_WEBHOOK_SECRET=whsec_... (you'll get this after setting up webhook)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} (Firebase Admin SDK JSON)
```

#### On Vercel Dashboard:
1. Go to your Vercel project → Settings → Environment Variables
2. Add these variables:
   - `STRIPE_SECRET_KEY` = your secret key
   - `STRIPE_WEBHOOK_SECRET` = your webhook secret
   - `FIREBASE_SERVICE_ACCOUNT` = your Firebase Admin SDK JSON

### Step 4: Get Firebase Service Account

1. Go to Firebase Console → Your Project → Settings → Service Accounts
2. Click "Generate new private key"
3. Copy the entire JSON
4. Add to `FIREBASE_SERVICE_ACCOUNT` environment variable (as a string)

### Step 5: Update Cart.jsx

Replace your `src/pages/Cart.jsx` with the new `Cart-vercel.jsx` provided.

The key difference: Uses `fetch()` to call Vercel API endpoints instead of Firebase Cloud Functions.

```javascript
// Old (Firebase):
const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent')

// New (Vercel):
const paymentResponse = await fetch('/api/createPaymentIntent', {
  method: 'POST',
  body: JSON.stringify({...})
})
```

### Step 6: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-vercel-domain.vercel.app/api/webhook`
4. Events: Select `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copy the Signing secret (starts with `whsec_`)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 7: Deploy to Vercel

```bash
git add .
git commit -m "Add Vercel Stripe integration"
git push
```

Vercel will automatically detect and deploy your API functions!

---

## 🔄 How It Works

```
1. Customer checkout
   ↓
2. Frontend calls: POST /api/createPaymentIntent
   ← Returns clientSecret
   ↓
3. Frontend calls: POST /api/createPendingOrder
   ← Creates temp order in Firestore
   ↓
4. Customer enters card, confirms payment
   ↓
5. Stripe processes payment
   ↓
6. Stripe calls: POST /api/webhook (your endpoint)
   ↓
7. Webhook verifies signature, creates confirmed order
   ↓
8. Frontend shows success message
```

---

## 🧪 Testing Locally

```bash
# Install Stripe webhook forwarding (optional for local testing)
npm install -g stripe

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhook

# In another terminal, start dev server
npm run dev
```

---

## 🚨 Important Notes

- **API routes are public** - Stripe signs webhooks, so they're secure
- **Secret key never exposed** - Only used server-side
- **Firebase credentials** - Keep service account JSON secret
- **Environment variables** - Add to Vercel, not to git

---

## ✅ What's Included

| File | Purpose |
|------|---------|
| `api/createPaymentIntent.js` | Creates Stripe payment intent |
| `api/createPendingOrder.js` | Stores temp order before payment |
| `api/calculateTax.js` | Calculates tax (upgradeable to Stripe Tax) |
| `api/webhook.js` | Handles Stripe webhook events |
| `Cart-vercel.jsx` | Updated checkout with Vercel API calls |

---

## 🎯 Next Steps

1. ✅ Create `/api` folder
2. ✅ Copy 4 API files
3. ✅ Set environment variables
4. ✅ Update Cart.jsx
5. ✅ Get Firebase service account
6. ✅ Deploy to Vercel
7. ✅ Add Stripe webhook
8. ⬜ Test with test card
9. ⬜ Add email notifications (Resend)
10. ⬜ Build customer order tracking page

---

## 🆘 Troubleshooting

**"Cannot find module '@stripe/js'"**
```bash
npm install @stripe/react-stripe-js @stripe/js
```

**"STRIPE_SECRET_KEY undefined"**
- Check Vercel environment variables
- Redeploy after adding variables

**"Webhook signature verification failed"**
- Verify webhook secret is correct
- Check Stripe Dashboard for webhook URL

**"Firebase service account error"**
- Make sure it's valid JSON
- Download fresh key from Firebase Console
- Paste entire JSON as string
