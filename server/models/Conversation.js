/**
 * @file Conversation.js
 * @description Conversation model for grouping customer ↔ breeder messages
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    dog: { type: Schema.Types.ObjectId, ref: 'Dog', required: false },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, dog: 1 });

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;
