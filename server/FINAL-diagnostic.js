#!/usr/bin/env node
/**
 * FINAL DIAGNOSTIC: Understand why clan creation is failing
 * Shows indexes, tests queries, and identifies the root issue
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 FINAL DIAGNOSTIC: Why is clan creation failing?');
    console.log('='.repeat(70) + '\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const clanCollection = db.collection('clans');

    // Step 1: Check all indexes
    console.log('📊 Step 1: Current Indexes in Database');
    console.log('-'.repeat(70));
    const indexes = await clanCollection.getIndexes();

    for (const [name, spec] of Object.entries(indexes)) {
      const isPartial = !!spec.partialFilterExpression;
      const status = isPartial ? '✅ PARTIAL' : '❌ NOT PARTIAL';
      console.log(`${status} | ${name}`);
      console.log(`     Key: ${JSON.stringify(spec.key)}`);
      console.log(`     Unique: ${spec.unique || 'no'}`);
      if (spec.partialFilterExpression) {
        console.log(`     Filter: ${JSON.stringify(spec.partialFilterExpression)}`);
      }
    }
    console.log();

    // Step 2: Check all clans
    console.log('📋 Step 2: All Clans in Database');
    console.log('-'.repeat(70));
    const allClans = await clanCollection.find({}).toArray();

    for (const clan of allClans) {
      console.log(`Name: "${clan.name}" | Tag: "${clan.tag}" | Status: ${clan.status}`);
    }
    console.log();

    // Step 3: Test the exact query that would prevent creation
    console.log('🧪 Step 3: Test Creating with New Tag');
    console.log('-'.repeat(70));

    const testTag = `TEST${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    const testName = `TestClan${Date.now()}`;

    console.log(`Attempting to create:`);
    console.log(`  Name: ${testName}`);
    console.log(`  Tag: ${testTag}`);
    console.log();

    // Try the exact query the code does
    const query = {
      $or: [
        { name: testName.trim(), status: 'active' },
        { tag: testTag.toUpperCase().trim(), status: 'active' }
      ]
    };

    console.log('Query used for conflict check:');
    console.log(JSON.stringify(query, null, 2));
    console.log();

    const existingClan = await clanCollection.findOne(query);

    if (existingClan) {
      console.log('❌ Conflict found:');
      console.log(`   Name: ${existingClan.name}`);
      console.log(`   Tag: ${existingClan.tag}`);
    } else {
      console.log('✅ No conflict in database - query works fine');
    }
    console.log();

    // Step 4: Try actual insert
    console.log('🚀 Step 4: Attempting Actual Insert');
    console.log('-'.repeat(70));

    try {
      const result = await clanCollection.insertOne({
        name: testName,
        tag: testTag,
        description: 'Diagnostic test',
        status: 'active',
        members: [],
        requests: [],
        notices: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ INSERT SUCCEEDED!');
      console.log(`   ID: ${result.insertedId}`);

      // Clean up
      await clanCollection.deleteOne({ _id: result.insertedId });
      console.log('   Cleaned up test record');
    } catch (err) {
      console.log('❌ INSERT FAILED!');
      console.log(`   Error Code: ${err.code}`);
      console.log(`   Error Message: ${err.message}`);
      console.log();

      if (err.code === 11000) {
        console.log('⚠️  ANALYSIS: Unique index constraint violation');
        console.log('    This means the index is preventing creation.');
        console.log('    The index might not be partial, or it\'s too broad.');
      }
    }

    console.log();
    console.log('='.repeat(70));
    console.log('📋 CONCLUSION');
    console.log('='.repeat(70));
    console.log('');
    console.log('If insert failed with code 11000:');
    console.log('  → Indexes are NOT partial (or not working correctly)');
    console.log('  → Need to DROP and RECREATE indexes');
    console.log('');
    console.log('If insert succeeded:');
    console.log('  → Indexes are correct!');
    console.log('  → Try creating clans via API');
    console.log('');

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

diagnose();
