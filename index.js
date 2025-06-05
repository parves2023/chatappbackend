const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/user.model');
const Group = require('./models/group.model');
const Message = require('./models/message.model');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://parves32:O6AcxyBUJwPSvda7@cluster0.3tilc.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0')

  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

  //my db name is

// REST API Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/groups', require('./routes/group.routes'));
app.use('/api/messages', require('./routes/message.routes'));

// HTTP and Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend URL
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🟢 New socket connected:', socket.id);

  // Join a group
  socket.on('join_group', ({ groupId }) => {
    socket.join(groupId);
    console.log(`🔗 Socket ${socket.id} joined group ${groupId}`);
  });

  // Send group message
  socket.on('send_group_message', async ({ senderId, groupId, message }) => {
    try {
      const newMsg = await Message.create({
        sender: senderId,
        groupId,
        data: message,
      });

      const populated = await newMsg.populate('sender', 'name photo');

      io.to(groupId).emit('receive_group_message', populated);
    } catch (err) {
      console.error('❌ Error saving group message:', err);
    }
  });

  // Private message
  socket.on('send_private_message', async ({ senderId, receiverId, message }) => {
    try {
      const newMsg = await Message.create({
        sender: senderId,
        receiver: receiverId,
        data: message,
      });

      const populated = await newMsg.populate('sender', 'name photo');

      // Emit to both users (assuming they both join their own room by userId)
      io.to(senderId).emit('receive_private_message', populated);
      io.to(receiverId).emit('receive_private_message', populated);
    } catch (err) {
      console.error('❌ Error saving private message:', err);
    }
  });

  // Join personal room (for private messages)
  socket.on('register_user', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined personal room`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// Run server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
