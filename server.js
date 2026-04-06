const app = require('./app');
const { initDb, closeDb } = require('./src/config/database');

const PORT = process.env.PORT || 4000;

async function start() {
  // Initialise the database (creates tables if needed)
  await initDb();
  console.log('✅ Database initialised');

  const server = app.listen(PORT, () => {
    console.log(`🚀 Finance API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    closeDb();
    server.close(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    closeDb();
    server.close(() => process.exit(0));
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
