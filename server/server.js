require('dotenv').config();

const mongoose = require('mongoose');
const { createApp } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./utils/logger');

const http = require('http');
const { initSocket } = require('./config/socket');
const { seedDatabase } = require('./seed');

const app = createApp();
const server = http.createServer(app);

const connectDB = async () => {
  let uri = env.MONGO_URI;
  if (process.env.NODE_ENV !== 'production') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    logger.info('Started MongoDB Memory Server at ' + uri);
  } else {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }
  const conn = await mongoose.connect(uri);
  logger.info('MongoDB connected', { host: conn.connection.host });
  return conn;
};

// Auto-repair clan collection indexes on startup (one-time fix for production)
const repairClanIndexes = async () => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Skipping clan index repair (not production)');
    return;
  }

  try {
    logger.info('🔍 Checking clan collection indexes...');
    const db = mongoose.connection.db;
    const clanCollection = db.collection('clans');

    const currentIndexes = await clanCollection.getIndexes();
    logger.info(`Found ${Object.keys(currentIndexes).length} indexes:`, { indexes: Object.keys(currentIndexes) });

    // Check if old non-partial indexes exist
    let needsRepair = false;
    const indexesToDrop = [];

    for (const [name, spec] of Object.entries(currentIndexes)) {
      if (name === '_id_') continue;

      const isNameOrTagIndex = spec.key?.name === 1 || spec.key?.tag === 1;
      const isPartial = !!spec.partialFilterExpression;

      logger.info(`Index "${name}":`, {
        key: spec.key,
        isPartial,
        partialFilter: spec.partialFilterExpression
      });

      if (isNameOrTagIndex && !isPartial) {
        logger.warn(`⚠️  Found old non-partial index: ${name} - needs repair`);
        needsRepair = true;
        indexesToDrop.push(name);
      }
    }

    if (!needsRepair) {
      logger.info('✅ Clan indexes are correct (all are partial)');
      return;
    }

    logger.info(`🔧 Repairing ${indexesToDrop.length} indexes...`);

    // Drop old indexes
    for (const indexName of indexesToDrop) {
      try {
        await clanCollection.dropIndex(indexName);
        logger.info(`✅ Dropped index: ${indexName}`);
      } catch (err) {
        logger.warn(`⚠️  Could not drop ${indexName}: ${err.message}`);
      }
    }

    // Create correct partial unique indexes
    logger.info('Creating new partial unique indexes...');

    try {
      await clanCollection.createIndex(
        { name: 1 },
        { unique: true, partialFilterExpression: { status: 'active' } }
      );
      logger.info('✅ Created partial unique index on name');
    } catch (err) {
      logger.error('Failed to create name index', { error: err.message });
    }

    try {
      await clanCollection.createIndex(
        { tag: 1 },
        { unique: true, partialFilterExpression: { status: 'active' } }
      );
      logger.info('✅ Created partial unique index on tag');
    } catch (err) {
      logger.error('Failed to create tag index', { error: err.message });
    }

    logger.info('✨ Clan indexes repaired successfully!');
  } catch (err) {
    logger.error('Failed to repair clan indexes', {
      error: err.message || JSON.stringify(err),
      stack: err.stack,
      code: err.code,
      name: err.name
    });
  }
};

const startServer = async () => {
  try {
    await connectDB();

    // Auto-repair clan indexes (one-time production fix)
    await repairClanIndexes();

    // Seed database if requested (same as standalone)
    if (process.env.SEED_ON_START === 'true') {
      logger.info('SEED_ON_START is true, seeding database...');
      await seedDatabase(true); // true passed to not exit process
    }

    // Initialize Socket.io
    initSocket(server);

    server.listen(env.PORT, () => {
      logger.info('Server started with Real-time support', { port: env.PORT, env: env.NODE_ENV });
    });
    return server;
  } catch (err) {
    logger.error('Server startup failed', { error: err });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  connectDB,
  startServer,
};
