import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    } = req.body;

    if (!email || !shippingInfo || !items || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      createdAt: new Date()
    });

    return res.status(200).json({
      pendingOrderId: pendingOrder.id,
      success: true
    });
  } catch (error) {
    console.error('Error creating pending order:', error);
    return res.status(500).json({ error: error.message });
  }
}
