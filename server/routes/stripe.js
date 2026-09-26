import { Router } from 'express';
import express from 'express';
import { stripe } from '../stripe.js';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/create-payment-intent', requireAuth, async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const { rugTitle, rugImage, amount, currency = 'usd', orderId } = req.body;

  if (!rugTitle || !amount || amount <= 0) {
    return res.status(400).json({ error: 'rugTitle and a valid amount are required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: req.user.id,
        rug_title: rugTitle,
        order_id: orderId || '',
      },
    });

    if (orderId) {
      await supabase
        .from('orders')
        .update({ stripe_payment_intent_id: paymentIntent.id, status: 'awaiting_payment' })
        .eq('id', orderId)
        .eq('user_id', req.user.id);
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[Stripe] create-payment-intent error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('[Stripe] STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[Stripe] Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { order_id } = paymentIntent.metadata;

      if (order_id) {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', order_id);

        if (error) console.error('[Stripe] Failed to update order status:', error);
      }
    }

    res.json({ received: true });
  }
);

export default router;
