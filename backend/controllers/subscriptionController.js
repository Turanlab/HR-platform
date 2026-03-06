const Subscription = require('../models/Subscription');
const emailService = require('../utils/emailService');

const PLANS = {
  candidate: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      annual_price: 0,
      features: ['3 CV templates', 'Basic CV builder', '1 active CV', 'PDF export'],
      cta: 'Get Started Free'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      annual_price: 99.99,
      features: ['All templates (including premium)', 'AI grammar check', 'ATS score', 'Cover letter generator', '5 active CVs', 'Priority support'],
      cta: 'Get Premium',
      stripe_price_id: process.env.STRIPE_PRICE_PREMIUM || null
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 19.99,
      annual_price: 199.99,
      features: ['Everything in Premium', 'Unlimited CVs', 'AI skill extraction', 'Job match scoring', 'Advanced analytics', 'White-label export'],
      cta: 'Go Professional',
      stripe_price_id: process.env.STRIPE_PRICE_PROFESSIONAL || null
    }
  ],
  company: [
    {
      id: 'starter',
      name: 'Starter',
      price: 99,
      annual_price: 990,
      features: ['50 candidate searches/mo', 'Basic filters', '5 active job posts', 'Email support'],
      cta: 'Start Hiring'
    },
    {
      id: 'company_professional',
      name: 'Professional',
      price: 199,
      annual_price: 1990,
      features: ['500 candidate searches/mo', 'Advanced filters', 'Unlimited job posts', 'Messaging', 'Analytics dashboard', 'Priority support'],
      cta: 'Scale Up',
      stripe_price_id: process.env.STRIPE_PRICE_COMPANY_PRO || null
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 499,
      annual_price: 4990,
      features: ['Unlimited searches', 'ATS integration', 'Dedicated account manager', 'Custom branding', 'API access', 'SLA guarantee'],
      cta: 'Contact Sales',
      stripe_price_id: process.env.STRIPE_PRICE_ENTERPRISE || null
    }
  ]
};

const subscriptionController = {
  async getPlans(req, res, next) {
    try {
      res.json({ plans: PLANS });
    } catch (err) {
      next(err);
    }
  },

  async getCurrentSubscription(req, res, next) {
    try {
      const subscription = await Subscription.findByUserId(req.user.id);
      res.json({ subscription: subscription || { plan: 'free', status: 'active' } });
    } catch (err) {
      next(err);
    }
  },

  async createCheckoutSession(req, res, next) {
    try {
      const { plan, billing = 'monthly' } = req.body;
      if (!plan) return res.status(400).json({ error: 'Plan is required.' });

      if (!process.env.STRIPE_SECRET_KEY) {
        // Mock checkout session when Stripe is not configured
        const sub = await Subscription.create({
          user_id: req.user.id,
          plan,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        emailService.sendSubscriptionConfirmation(req.user.email, plan).catch(() => {});
        return res.json({ session_id: 'mock_session', subscription: sub, mock: true });
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const allPlans = [...PLANS.candidate, ...PLANS.company];
      const selectedPlan = allPlans.find((p) => p.id === plan);
      if (!selectedPlan?.stripe_price_id) {
        return res.status(400).json({ error: 'Plan not available for purchase.' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: selectedPlan.stripe_price_id, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/profile?subscription=success`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: { user_id: req.user.id.toString(), plan }
      });

      res.json({ session_id: session.id, url: session.url });
    } catch (err) {
      next(err);
    }
  },

  async cancelSubscription(req, res, next) {
    try {
      const subscription = await Subscription.findByUserId(req.user.id);
      if (!subscription) return res.status(404).json({ error: 'No active subscription found.' });

      if (process.env.STRIPE_SECRET_KEY && subscription.stripe_subscription_id) {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true });
      }

      const cancelled = await Subscription.cancel(req.user.id);
      res.json({ subscription: cancelled, message: 'Subscription cancelled successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async stripeWebhook(req, res, next) {
    try {
      const event = req.stripeEvent;
      if (!event) return res.json({ received: true });

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = parseInt(session.metadata?.user_id);
          const plan = session.metadata?.plan;
          if (userId && plan) {
            await Subscription.create({
              user_id: userId,
              plan,
              status: 'active',
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              current_period_start: new Date(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
          }
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object;
          const existing = await Subscription.findByStripeSubscriptionId(sub.id);
          if (existing) {
            await Subscription.update(existing.id, {
              status: sub.status,
              current_period_start: new Date(sub.current_period_start * 1000),
              current_period_end: new Date(sub.current_period_end * 1000)
            });
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object;
          const existing = await Subscription.findByStripeSubscriptionId(sub.id);
          if (existing) {
            await Subscription.update(existing.id, { status: 'cancelled' });
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  },

  async getSubscriptionHistory(req, res, next) {
    try {
      const subscriptions = await Subscription.findAllByUserId(req.user.id);
      res.json({ subscriptions });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = subscriptionController;
