#!/usr/bin/env node
/**
 * URGENT: Database Index Repair Tool
 * This MUST be run in your Render environment to fix the clan creation issue
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function repairDatabase() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 DATABASE INDEX REPAIR - CLAN CREATION FIX');
  console.log('='.repeat(70) + '\n');

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const clanCollection = db.collection('clans');

    // Step 1: Get current indexes
    console.log('📊 Current Indexes:');
    const currentIndexes = await clanCollection.getIndexes();
    for (const [name, spec] of Object.entries(currentIndexes)) {
      if (name !== '_id_') {
        console.log(`  ${name}:`, JSON.stringify(spec));
      }
    }
    console.log();

    // Step 2: Drop ALL non-_id indexes
    console.log('🗑️  Dropping all old indexes...');
    for (const indexName of Object.keys(currentIndexes)) {
      if (indexName === '_id_') continue;
      try {
        await clanCollection.dropIndex(indexName);
        console.log(`  ✅ Dropped: ${indexName}`);
      } catch (err) {
        console.log(`  ⚠️  ${indexName}: ${err.message}`);
      }
    }
    console.log();

    // Step 3: Create NEW partial unique indexes
    console.log('✨ Creating NEW partial unique indexes...');

    try {
      await clanCollection.createIndex(
        { name: 1 },
        {
          unique: true,
          partialFilterExpression: { status: 'active' },
          name: 'name_1_unique_active'
        }
      );
      console.log('  ✅ name index (partial, active only)');
    } catch (err) {
      throw new Error(`Failed to create name index: ${err.message}`);
    }

    try {
      await clanCollection.createIndex(
        { tag: 1 },
        {
          unique: true,
          partialFilterExpression: { status: 'active' },
          name: 'tag_1_unique_active'
        }
      );
      console.log('  ✅ tag index (partial, active only)');
    } catch (err) {
      throw new Error(`Failed to create tag index: ${err.message}`);
    }
    console.log();

    // Step 4: Verify new indexes
    console.log('🔍 Verifying new indexes...');
    const newIndexes = await clanCollection.getIndexes();
    for (const [name, spec] of Object.entries(newIndexes)) {
      if (name !== '_id_') {
        const hasPartial = !!spec.partialFilterExpression;
        const status = hasPartial ? '✅' : '❌';
        console.log(`  ${status} ${name}`);
      }
    }
    console.log();

    // Step 5: Test creation
    console.log('🧪 Testing clan creation...');
    const testName = `TestClan_${Date.now()}`;
    const testTag = `T${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    try {
      const result = await clanCollection.insertOne({
        name: testName,
        tag: testTag,
        description: 'Repair test',
        status: 'active',
        members: [],
        requests: [],
        notices: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`  ✅ Test clan created: ${testName}`);

      // Clean up
      await clanCollection.deleteOne({ _id: result.insertedId });
      console.log('  ✅ Test clan cleaned up\n');
    } catch (err) {
      throw new Error(`Test creation failed: ${err.message}`);
    }

    // Summary
    console.log('='.repeat(70));
    console.log('✨ DATABASE REPAIR COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ Clan creation should now work!');
    console.log('\nWhat was fixed:');
    console.log('  • Dropped old unconditional unique indexes');
    console.log('  • Created partial unique indexes for ACTIVE clans only');
    console.log('  • Archived clans no longer block new clan creation');
    console.log('\nYou can now:');
    console.log('  1. Create new clans in the admin panel');
    console.log('  2. Reuse names/tags from archived clans\n');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

repairDatabase();
