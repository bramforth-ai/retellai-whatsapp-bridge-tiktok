const twilio = require('twilio');

/**
 * Middleware to validate Twilio webhook signatures
 * This ensures requests actually come from Twilio
 */
function validateTwilioSignature(req, res, next) {
  // Skip validation in development for easier testing
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  [DEV MODE] Skipping Twilio signature validation');
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'];
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    console.error('❌ TWILIO_AUTH_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!twilioSignature) {
    console.error('❌ Missing Twilio signature header');
    return res.status(403).json({ error: 'Forbidden - Missing signature' });
  }

  // Construct the full URL
  const protocol = req.protocol;
  const host = req.get('host');
  const url = `${protocol}://${host}${req.originalUrl}`;

  // Validate the signature
  const isValid = twilio.validateRequest(
    authToken,
    twilioSignature,
    url,
    req.body
  );

  if (!isValid) {
    console.error('❌ Invalid Twilio signature');
    return res.status(403).json({ error: 'Forbidden - Invalid signature' });
  }

  console.log('✅ Twilio signature validated');
  next();
}

module.exports = validateTwilioSignature;