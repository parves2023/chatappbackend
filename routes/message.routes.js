const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/message.model');
const router = express.Router();

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get messages for a specific group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!isValidObjectId(groupId)) {
      return res.status(400).json({ message: 'Invalid groupId' });
    }

    const messages = await Message.find({ groupId })
      .populate('sender', 'name photo')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch group messages', error: err.message });
  }
});

// Get messages between two users (private chat)
router.get('/private/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (!isValidObjectId(user1) || !isValidObjectId(user2)) {
      return res.status(400).json({ message: 'Invalid userId(s)' });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    })
      .populate('sender', 'name photo')
      .populate('receiver', 'name photo')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch private messages', error: err.message });
  }
});

// Post a new message
router.post('/', async (req, res) => {
  try {
    const { sender, groupId, receiver, data } = req.body;

    // Validation
    if (!sender || !data) {
      return res.status(400).json({ message: 'Sender and message content are required' });
    }
    if (!groupId && !receiver) {
      return res.status(400).json({ message: 'Either groupId or receiver must be provided' });
    }
    if (groupId && !isValidObjectId(groupId)) {
      return res.status(400).json({ message: 'Invalid groupId' });
    }
    if (receiver && !isValidObjectId(receiver)) {
      return res.status(400).json({ message: 'Invalid receiverId' });
    }
    if (!isValidObjectId(sender)) {
      return res.status(400).json({ message: 'Invalid senderId' });
    }

    const message = new Message({ sender, groupId, receiver, data });
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

module.exports = router;
