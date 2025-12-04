/**
 * @file messageRoutes.js
 * @description Routes for buyer ↔ breeder messaging with conversation threads
 */

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const BlockedUser = require('../models/BlockedUser');
const jwtAuth = require('../middleware/jwtAuth');
const Conversation = require('../models/Conversation');

// ---------------------------------------------
// Send a message
// ---------------------------------------------
router.post('/', jwtAuth, async (req, res) => {
  try {
    const { recipient, dogId, body } = req.body;

    if (!recipient || !dogId || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Block check
    const blocked = await BlockedUser.findOne({
      blocker: recipient,
      blocked: req.user._id
    });
    if (blocked) {
      return res.status(403).json({ error: 'You are blocked from messaging this breeder' });
    }

    // Find or create conversation
    let convo = await Conversation.findOne({
      dog: dogId,
      participants: { $all: [req.user._id, recipient] }
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user._id, recipient],
        dog: dogId
      });
    }

    // Create message
    const msg = await Message.create({
      fromUser: req.user._id,
      toUser: recipient,
      dog: dogId,
      subject: `Inquiry about dog`,
      message: body,
      conversationId: convo._id
    });

    convo.lastMessage = msg._id;
    await convo.save();

    res.json(msg);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ---------------------------------------------
// Get all conversations for logged-in user
// ---------------------------------------------
router.get('/conversations', jwtAuth, async (req, res) => {
  try {
    const convos = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email')
      .populate('dog', 'name')
      .populate({
        path: 'lastMessage',
        populate: { path: 'fromUser toUser', select: 'name email' }
      })
      .sort({ updatedAt: -1 });

    res.json(convos);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// ---------------------------------------------
// Get all messages in a conversation
// ---------------------------------------------
router.get('/conversation/:conversationId', jwtAuth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('dog', 'name');

    res.set('Cache-Control', 'no-store');
    res.json(messages);
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// ---------------------------------------------
// Reply to a message
// ---------------------------------------------
router.post('/:id/reply', jwtAuth, async (req, res) => {
  try {
    const parent = await Message.findById(req.params.id);
    if (!parent) return res.status(404).json({ error: 'Original message not found' });

    const text = req.body.body || req.body.message; // ✅ Accept both "body" and "message"
    if (!text) return res.status(400).json({ error: 'Reply cannot be empty' });

    const replyMsg = await Message.create({
      fromUser: req.user._id,
      toUser: parent.fromUser.equals(req.user._id) ? parent.toUser : parent.fromUser,
      dog: parent.dog,
      message: text,  // ✅ use unified field
      subject: parent.subject,
      conversationId: parent.conversationId
    });

    await Conversation.findByIdAndUpdate(parent.conversationId, {
      lastMessage: replyMsg._id
    });

    res.json(replyMsg);
  } catch (err) {
    console.error('Error sending reply:', err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// ---------------------------------------------
// Mark a conversation as read
// ---------------------------------------------
router.post('/conversation/:id/read', jwtAuth, async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        conversationId: req.params.id,
        toUser: req.user._id,
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ updated: result.modifiedCount > 0 });
  } catch (err) {
    console.error("Error marking messages read:", err);
    res.status(500).json({ error: "Failed to update read status" });
  }
});

// ---------------------------------------------
// Unread count badge
// ---------------------------------------------
router.get('/unread/count', jwtAuth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      toUser: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// ---------------------------------------------
// Delete a conversation
// ---------------------------------------------
router.delete("/conversation/:id", jwtAuth, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    if (!convo.participants.includes(req.user._id)) {
      return res.status(403).json({ error: "Not authorized to delete this conversation" });
    }

    await Message.deleteMany({ conversationId: convo._id });
    await convo.deleteOne();

    res.json({ message: "Conversation deleted" });
  } catch (err) {
    console.error("Error deleting conversation:", err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

module.exports = router;
