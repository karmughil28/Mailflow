import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema({
  email: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  error: { type: String, default: '' },
  attemptedAt: { type: Date, default: Date.now }
}, { _id: false });

const campaignSchema = new mongoose.Schema({
  name: { type: String, default: 'Untitled campaign', trim: true },
  subject: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  recipients: { type: [recipientSchema], default: [] },
  status: { type: String, enum: ['sending', 'sent', 'partial', 'failed'], default: 'sending' },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);
