const dotenv = require('dotenv');
dotenv.config();

// Import dependencies
const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const whatsappRoutes = require('./routes/whatsapp');

// Initialize Express app
const app = express();
app.set('trust proxy', true); 

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Only serve static files in development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  console.log('📁 Static files enabled (development mode)');
} else {
  console.log('🔒 Static files disabled (production mode)');
}

app.use('/twilio', whatsappRoutes);

// Routes
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Basic Routes
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.send(`
      <h1>RetellAI WhatsApp Bridge</h1>
      <p>✅ Server is running</p>
      <p>Environment: ${process.env.NODE_ENV}</p>
      <p><a href="/health">Health Check</a></p>
      <hr>
      <p><small>🔒 Chat interface disabled in production</small></p>
    `);
  }
  
  // In development, serve chat widget
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Connect to MongoDB and then start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB. Server not started.');
    process.exit(1);
  });