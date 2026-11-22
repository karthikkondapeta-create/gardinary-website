export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Missing amount' });
    }

    // Simple 10% tax calculation
    // TODO: Integrate Stripe Tax API for real-time jurisdiction-based rates
    const tax_amount = Math.round(amount * 0.1 * 100) / 100;

    return res.status(200).json({
      tax_amount: tax_amount,
      tax_rate: 0.1
    });
  } catch (error) {
    console.error('Error calculating tax:', error);
    return res.status(500).json({ error: error.message });
  }
}
