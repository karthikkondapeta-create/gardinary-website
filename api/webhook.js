import Stripe from 'stripe';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send('Internal Server Error');
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);

    // Find pending order by paymentIntentId
    const pendingOrdersRef = db.collection('pendingOrders');
    const snapshot = await pendingOrdersRef
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.error('No pending order found for payment intent:', paymentIntent.id);
      return;
    }

    const pendingOrder = snapshot.docs[0];
    const orderData = pendingOrder.data();

    // Create confirmed order
    const order = await db.collection('orders').add({
      ...orderData,
      paymentIntentId: paymentIntent.id,
      status: 'confirmed',
      confirmedAt: new Date(),
      chargeId: paymentIntent.charges.data[0]?.id || null
    });

    // Delete pending order
    await pendingOrder.ref.delete();

    console.log('Order created:', order.id);
    // TODO: Send confirmation email
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);

    const pendingOrdersRef = db.collection('pendingOrders');
    const snapshot = await pendingOrdersRef
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        status: 'failed',
        failureMessage: paymentIntent.last_payment_error?.message || 'Payment failed'
      });
    }
    // TODO: Send failure email
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleChargeRefunded(charge) {
  try {
    console.log('Charge refunded:', charge.id);

    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef
      .where('chargeId', '==', charge.id)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        status: 'refunded',
        refundedAt: new Date()
      });
    }
    // TODO: Send refund notification
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}
