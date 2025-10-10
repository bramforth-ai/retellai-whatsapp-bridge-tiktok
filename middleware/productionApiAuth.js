/**
 * API Key authentication that only enforces in production
 * In development, allows unrestricted access for testing
 */
function productionApiAuth(req, res, next) {
  // Allow all requests in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // In production, require API key
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.error('❌ API_KEY not configured in production environment!');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'API authentication not properly configured'
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required in production. Provide via X-API-Key header or api_key query parameter.'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  console.log('✅ Production API key validated');
  next();
}

module.exports = productionApiAuth;