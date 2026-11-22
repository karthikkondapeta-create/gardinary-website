# Stripe Integration Setup Guide for Gardinary

## Overview
This implementation creates a secure payment flow using Firebase Cloud Functions + Stripe. Orders are only created AFTER payment succeeds (not before), which prevents fraud and charge-backs.

---

## 🔑 Step 1: Set Environment Variables

### In your project root, create `.env.local`:

```env
# Frontend - Stripe Public Key (safe to expose)
VITE_STRIPE_PUBLIC_KEY=pk_test_51Ue246CP02uZkTWVidOl0RA93XvtUC092hR68UdwSWoyskOtdMPDcaz6BUbnZvTEGyClD40hRdgzZJM3JMHpNiyj00LAOkSE1r

# Firebase config (you already have this)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### In Firebase Console:
1. Go to Firebase Console → Your Project
2. Settings → Functions
3. Add these environment variables:
   ```
   STRIPE_SECRET_KEY=sk_test_51Ue246CP02uZkTWVCnbFbSNahvZaZPT70Tihr5br0iPaPP1Kg7LYryId8ISQ1UQe0geN4bhB8WPV28JXsp9cuCBj00qimRKlPo
   STRIPE_WEBHOOK_SECRET=whsec_... (you'll get this after deploying functions)
   ```

---

## 📦 Step 2: Install Dependencies

### Frontend (add to your project):
```bash
npm install @stripe/react-stripe-js @stripe/js
```

### Create functions directory:
```bash
mkdir functions
cd functions
npm init -y
npm install firebase-admin firebase-functions stripe
```

---

## 📂 Step 3: Create Cloud Functions

Create the following files in your `functions/` directory:

### `functions/index.js`
[Copy the full Cloud Functions code provided - see functions-index.js]

### `functions/package.json`
[Copy the functions package.json provided]

---

## 🚀 Step 4: Deploy Cloud Functions

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to functions folder
cd functions

# Deploy
firebase deploy --only functions
```

After deployment, you'll see your function URLs. The webhook URL will be something like:
```
https://us-central1-your-project.cloudfunctions.net/stripeWebhook
```

---

## 🪝 Step 5: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → Webhooks
3. Click "Add endpoint"
4. Endpoint URL: `https://us-central1-your-project.cloudfunctions.net/stripeWebhook`
5. Events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
6. Click "Add endpoint"
7. Copy the "Signing secret" (starts with `whsec_`)
8. Add to Firebase environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 🔄 Step 6: Update Your Code

### 1. Update `src/lib/firebase.js`
Add this export for Cloud Functions:
```javascript
import { getFunctions } from 'firebase/functions'

export const functions = getFunctions()
```

### 2. Install Stripe packages in frontend:
```bash
npm install @stripe/react-stripe-js @stripe/js
```

### 3. Replace `src/pages/Cart.jsx`
[Copy the full updated Cart.jsx provided]

### 4. Update `package.json` dependencies
Add Stripe packages to your dependencies (they should auto-install with npm install)

---

## 📊 Payment Flow Diagram

```
1. Customer fills shipping info
   ↓
2. Click "Continue to Payment"
   ↓
3. Frontend calls createPaymentIntent() → Stripe creates PaymentIntent
   ↓
4. Frontend calls createPendingOrder() → Creates temporary order in Firestore
   ↓
5. Customer enters card details
   ↓
6. Frontend calls stripe.confirmCardPayment()
   ↓
7. Stripe processes payment
   ↓
8. Webhook fires payment_intent.succeeded
   ↓
9. Cloud Function converts pending order → confirmed order
   ↓
10. Send confirmation email (TODO)
    ↓
11. Display success message to customer
```

---

## 🗄️ Firestore Collections

### New Collections Created:
1. **pendingOrders** - Temporary orders waiting for payment confirmation
2. **orders** - Confirmed orders (created after payment succeeds)

### Order Structure:
```javascript
{
  email: "customer@example.com",
  shippingInfo: {
    name: "John Doe",
    address: "123 Main St",
    city: "New York",
    zip: "10001",
    country: "US",
    phone: "+1234567890"
  },
  items: [
    {
      id: "product-1",
      name: "Organic Cotton Tee",
      price: 45.00,
      quantity: 2,
      selectedSize: "M",
      frontImage: "url"
    }
  ],
  subtotal: 90.00,
  shipping: 15.00,
  tax: 10.50,
  discount: 9.00,
  total: 106.50,
  
  // Set by Cloud Function after payment succeeds:
  paymentIntentId: "pi_...",
  chargeId: "ch_...",
  status: "confirmed",
  confirmedAt: timestamp
}
```

---

## 🧪 Testing

### Test Cards (Stripe):
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 2500 0000 3155`

Expiry: Any future date
CVC: Any 3 digits

### Test Webhook:
```bash
# Forward webhooks to localhost (for testing):
stripe listen --forward-to localhost:3000/webhook
```

---

## 🔐 Security Notes

✅ **What we did right:**
- Payment processing on Stripe servers (never stored on your server)
- Cloud Functions validate payments before creating orders
- Webhooks sign with HMAC (verified before processing)
- Secret key never exposed to frontend
- Orders created only after payment succeeds

⚠️ **Still TODO:**
- Email notifications (Resend or SendGrid)
- Customer order tracking page
- Stripe Tax API for real jurisdictional tax rates
- Error handling improvements

---

## 🐛 Troubleshooting

### "Cannot find module '@stripe/react-stripe-js'"
```bash
npm install @stripe/react-stripe-js @stripe/js
```

### "Payment Intent creation failed"
- Check STRIPE_SECRET_KEY in Firebase environment
- Check Cloud Functions logs: `firebase functions:log`

### "Webhook not firing"
- Verify webhook URL in Stripe Dashboard
- Check webhook signing secret is set
- View webhook deliveries in Stripe Dashboard

### "Orders not creating"
- Check Cloud Functions logs
- Verify pendingOrders collection exists
- Check Firestore security rules

---

## 📝 Security Rules for Firestore

Update your security rules to allow Cloud Functions to write orders:

```
match /orders/{document=**} {
  allow read: if request.auth.uid != null;
  allow create: if request.auth.uid != null;
  allow write: if request.auth == null; // For Cloud Functions
}

match /pendingOrders/{document=**} {
  allow write: if request.auth == null; // For Cloud Functions
  allow read: if false;
}

match /discountCodes/{document=**} {
  allow read: if true;
  allow write: if false;
}
```

---

## 🎯 Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Create Cloud Functions
4. ✅ Deploy to Firebase
5. ✅ Configure Stripe webhook
6. ✅ Update frontend code
7. ✅ Test payment flow
8. ⬜ Add email notifications
9. ⬜ Build customer order tracking
10. ⬜ Configure Stripe Tax API

---

## 📞 Support

If you get stuck:
1. Check Cloud Functions logs: `firebase functions:log`
2. Check Stripe Dashboard for errors
3. Test with Stripe test cards
4. Verify webhook delivery in Stripe Dashboard
