// models/Log.ts
import mongoose, { Schema, model, models } from 'mongoose';

const LogSchema = new Schema({
  id: { type: String, required: true },
  question: String,
  answer: String,
  userId: String,
  sessionId: String,
  timestamp: String,
  responseTime: Number,
  model: String,
  tokensUsed: Number,
  error: String,
  status: { type: String, enum: ['pending', 'completed', 'error'], default: 'pending' },
  completedAt: String,
});

export const Log = models.log || model('log', LogSchema);
