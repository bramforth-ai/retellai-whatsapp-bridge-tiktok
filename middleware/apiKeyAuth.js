/**
 * Simple API Key authentication middleware
 * Protects admin and debug endpoints
 */
function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.warn('⚠️  API_KEY not configured in environment');
    // If no API key configured, allow access (backwards compatibility)
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required. Provide via X-API-Key header or api_key query parameter.'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  console.log('✅ API key validated');
  next();
}

module.exports = apiKeyAuth;