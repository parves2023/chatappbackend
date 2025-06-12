// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/user.model');
const Message = require('./models/message.model');
const { log } = require('console');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://parves32:O6AcxyBUJwPSvda7@cluster0.3tilc.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// REST API Routes (if needed)
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/groups', require('./routes/group.routes'));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // adjust as needed
    methods: ['GET', 'POST'],
  },
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);
  socket.on('register_user', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined personal room`);
  });

  socket.on('join_group', ({ groupId }) => {
    socket.join(groupId);
    console.log(`🔗 Socket ${socket.id} joined group ${groupId}`);
  });

  socket.on('send_group_message', async ({ senderId, groupId, message, SenderName }) => {


    log('📩 Group message sent:', { senderId, groupId, message,SenderName });

    socket.to(groupId).emit('receive_group_message', {
      sender: senderId,
      SenderName: SenderName,
      groupId,
      data: message,
      createdAt: new Date().toISOString(),
    });
    try {
      // Save message to database
      const newMessage = new Message({
        sender: senderId,
        groupId,
        data: message,
      });
      await newMessage.save();
      console.log('✅ Message saved to database:', newMessage);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });




socket.on('send_global_message', ({ message }) => {
  console.log('📩 Global message sent:', message);
  
  // Broadcast to everyone (including sender)
  io.emit('receive_group_message', {
    data: message,
    createdAt: new Date().toISOString(),
  });
});
  

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
