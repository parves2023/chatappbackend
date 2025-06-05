const Message = require('../models/message.model');

exports.sendMessage = async (req, res) => {
  try {
    const { sender, groupId, receiver, data } = req.body;

    const message = await Message.create({
      sender,
      groupId: groupId || null,
      receiver: receiver || null,
      data,
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessagesByGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const messages = await Message.find({ groupId }).populate('sender');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
