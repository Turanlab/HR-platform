const Subscription = require('../models/Subscription');

const verifyStripeWebhook = (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    // Without Stripe configured, pass through with a mock event
    req.stripeEvent = req.body;
    return next();
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    req.stripeEvent = event;
    next();
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }
};

const requireSubscription = (tier) => {
  const tierOrder = { free: 0, starter: 1, premium: 2, professional: 3, enterprise: 4 };

  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findByUserId(req.user.id);

      // If no subscription required or user has active sub meeting minimum tier
      if (!tier || tier === 'free') return next();

      if (!subscription || subscription.status !== 'active') {
        return res.status(402).json({
          error: 'This feature requires an active subscription.',
          required_tier: tier
        });
      }

      const userTierLevel = tierOrder[subscription.plan] ?? 0;
      const requiredTierLevel = tierOrder[tier] ?? 1;

      if (userTierLevel < requiredTierLevel) {
        return res.status(402).json({
          error: `This feature requires a ${tier} subscription or higher.`,
          current_plan: subscription.plan,
          required_tier: tier
        });
      }

      req.subscription = subscription;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { verifyStripeWebhook, requireSubscription };
