const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Add a static method to get the next sequence
counterSchema.statics.getNextSequence = async function(sequenceName) {
  const result = await this.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
};

// Add a static method to initialize counters
counterSchema.statics.initializeCounters = async function() {
  try {
    // Initialize purchaseOrder counter if it doesn't exist
    await this.findOneAndUpdate(
      { _id: 'purchaseOrder' },
      { $setOnInsert: { seq: 0 } },
      { upsert: true, new: true }
    );
    console.log('Counter collection initialized successfully');
  } catch (error) {
    console.error('Error initializing counter collection:', error);
    throw error;
  }
};

module.exports = mongoose.model('Counter', counterSchema); 