// models/Log.ts
import  { Schema, model, models } from 'mongoose';

const LogSchema = new Schema({
  requestId: { type: String, required: true },
  applianceId: String,
  sessionId: String,
  deviceUDID: String,
  homeId: String,
  prompt: String,
  response: String,
  skuNumber: String,
  timestamp: { type: Date, default: Date.now },
  responseTime: Number,
});

export const Log = models.log || model('log', LogSchema);
