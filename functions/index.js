const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();
const db = admin.firestore();

// ==========================================
// CREATE PAYMENT INTENT
// ==========================================
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    const { amount, email, description } = data;

    // Validate input
    if (!amount || !email) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: amount, email'
      );
    }

    // Create PaymentIntent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        email: email,
        description: description || 'Gardinary Purchase'
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ==========================================
// CALCULATE TAX
// ==========================================
exports.calculateTax = functions.https.onCall(async (data, context) => {
  try {
    const {
      amount,
      shipping_address,
      line_items
    } = data;

    // For now, return simple tax calculation (10% flat rate)
    // In production, use Stripe Tax API for accurate rates by jurisdiction
    const tax_amount = Math.round(amount * 0.1 * 100); // 10% tax

    return {
      tax_amount: tax_amount / 100,
      tax_rate: 0.1
    };
  } catch (error) {
    console.error('Error calculating tax:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ==========================================
// WEBHOOK HANDLER
// ==========================================
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
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

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ==========================================
// PAYMENT SUCCESS HANDLER
// ==========================================
async function handlePaymentSucceeded(paymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);

    // Get order data from temporary storage (passed in metadata or fetch from frontend call)
    // For now, we'll retrieve it from Firestore pending orders
    const orderSnapshot = await db
      .collection('pendingOrders')
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (orderSnapshot.empty) {
      console.error('No pending order found for payment intent:', paymentIntent.id);
      return;
    }

    const pendingOrder = orderSnapshot.docs[0];
    const orderData = pendingOrder.data();

    // Create confirmed order in orders collection
    const order = await db.collection('orders').add({
      ...orderData,
      paymentIntentId: paymentIntent.id,
      status: 'confirmed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      chargeId: paymentIntent.charges.data[0]?.id || null
    });

    // Delete pending order
    await db.collection('pendingOrders').doc(pendingOrder.id).delete();

    // TODO: Send confirmation email via Resend or SendGrid
    console.log('Order created:', order.id);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// ==========================================
// PAYMENT FAILED HANDLER
// ==========================================
async function handlePaymentFailed(paymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);

    // Update pending order status
    const orderSnapshot = await db
      .collection('pendingOrders')
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!orderSnapshot.empty) {
      await db
        .collection('pendingOrders')
        .doc(orderSnapshot.docs[0].id)
        .update({
          status: 'failed',
          failureMessage: paymentIntent.last_payment_error?.message || 'Payment failed'
        });
    }

    // TODO: Send failure email to customer
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// ==========================================
// CHARGE REFUNDED HANDLER
// ==========================================
async function handleChargeRefunded(charge) {
  try {
    console.log('Charge refunded:', charge.id);

    // Find order by chargeId
    const orderSnapshot = await db
      .collection('orders')
      .where('chargeId', '==', charge.id)
      .limit(1)
      .get();

    if (!orderSnapshot.empty) {
      await db
        .collection('orders')
        .doc(orderSnapshot.docs[0].id)
        .update({
          status: 'refunded',
          refundedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    // TODO: Send refund notification email
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}

// ==========================================
// CREATE PENDING ORDER
// ==========================================
exports.createPendingOrder = functions.https.onCall(async (data, context) => {
  try {
    const {
      email,
      shippingInfo,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      paymentIntentId
    } = data;

    // Validate input
    if (!email || !shippingInfo || !items || !paymentIntentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    // Create pending order
    const pendingOrder = await db.collection('pendingOrders').add({
      email,
      shippingInfo,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      paymentIntentId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      pendingOrderId: pendingOrder.id,
      success: true
    };
  } catch (error) {
    console.error('Error creating pending order:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
