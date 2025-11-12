import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixPaymentIndex = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/e-learning";
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('payments');

    // List all indexes
    console.log('\n📋 Current indexes on payments collection:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the problematic index if it exists
    try {
      // Try to drop stripePaymentIntentId index (old name)
      await collection.dropIndex('stripePaymentIntentId_1');
      console.log('\n✅ Dropped old stripePaymentIntentId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('\nℹ️  stripePaymentIntentId_1 index does not exist (already removed)');
      } else {
        console.log(`\n⚠️  Could not drop stripePaymentIntentId_1: ${err.message}`);
      }
    }

    try {
      // Try to drop paymentIntentId index if it exists (might be non-sparse)
      await collection.dropIndex('paymentIntentId_1');
      console.log('✅ Dropped old paymentIntentId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  paymentIntentId_1 index does not exist');
      } else {
        console.log(`⚠️  Could not drop paymentIntentId_1: ${err.message}`);
      }
    }

    // Create new sparse unique index
    try {
      await collection.createIndex(
        { paymentIntentId: 1 },
        { unique: true, sparse: true, name: 'paymentIntentId_1_sparse' }
      );
      console.log('✅ Created new sparse unique index on paymentIntentId');
    } catch (err) {
      console.log(`⚠️  Could not create index: ${err.message}`);
    }

    // List indexes again to confirm
    console.log('\n📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
};

fixPaymentIndex();

