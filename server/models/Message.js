/**
 * @file Message.js
 * @description Message model for customer ↔ breeder communication
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dog: {
      type: Schema.Types.ObjectId,
      ref: 'Dog',
      required: false
    },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for faster inbox queries
MessageSchema.index({ toUser: 1, read: 1 });
MessageSchema.index({ fromUser: 1 });
MessageSchema.index({ conversationId: 1 });

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
