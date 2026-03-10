const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { verifyStripeWebhook } = require('../middleware/payment');
const subscriptionController = require('../controllers/subscriptionController');

router.get('/plans', subscriptionController.getPlans);
router.get('/current', authenticate, subscriptionController.getCurrentSubscription);
router.post('/checkout', authenticate, subscriptionController.createCheckoutSession);
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);
router.post('/webhook', verifyStripeWebhook, subscriptionController.stripeWebhook);
router.get('/history', authenticate, subscriptionController.getSubscriptionHistory);

module.exports = router;
