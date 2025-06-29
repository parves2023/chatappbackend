const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null, // null if private message
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null, // for private messaging
  },
  data: {
    type: String,
    required: true,
  },
  SenderName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
