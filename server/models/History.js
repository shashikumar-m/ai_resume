const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:      { type: String, required: true, enum: ['resume', 'questions', 'mock', 'code', 'learn'] },
  title:     { type: String, required: true },
  summary:   { type: String, default: '' },
  score:     { type: Number, default: null },
  data:      { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Keep max 50 entries per user per type
historySchema.index({ userId: 1, type: 1, createdAt: -1 })

module.exports = mongoose.model('History', historySchema)
