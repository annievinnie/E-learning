import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    for (const idx of indexes) {
      console.log(`   ${idx.name}: ${JSON.stringify(idx.key)}`);
    }

    console.log('\n🔧 Fixing indexes...\n');

    // Drop old problematic indexes
    const indexesToDrop = ['stripePaymentIntentId_1', 'paymentIntentId_1'];
    for (const idxName of indexesToDrop) {
      try {
        await collection.dropIndex(idxName);
        console.log(`✅ Dropped index: ${idxName}`);
      } catch (err) {
        if (err.code === 27 || err.codeName === 'IndexNotFound') {
          console.log(`ℹ️  Index ${idxName} does not exist (skipping)`);
        } else {
          console.log(`⚠️  Could not drop ${idxName}: ${err.message}`);
        }
      }
    }

    // Create new sparse unique index
    try {
      await collection.createIndex(
        { paymentIntentId: 1 },
        { unique: true, sparse: true, name: 'paymentIntentId_1' }
      );
      console.log('✅ Created sparse unique index on paymentIntentId\n');
    } catch (err) {
      console.log(`⚠️  Index creation: ${err.message}\n`);
    }

    console.log('📋 Final indexes:');
    const finalIndexes = await collection.indexes();
    for (const idx of finalIndexes) {
      console.log(`   ${idx.name}: ${JSON.stringify(idx.key)}`);
    }

    console.log('\n✅ Done! Restart your server now.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixIndex();

