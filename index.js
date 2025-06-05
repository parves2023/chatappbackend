const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());

const server = http.createServer(app);

const uri = 'mongodb+srv://parves32:O6AcxyBUJwPSvda7@cluster0.3tilc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

let messagesCollection;

// MongoDB connection
async function connectMongo() {
  try {
    await client.connect();
    const db = client.db('chat-app');
    messagesCollection = db.collection('messages');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err);
  }
}

connectMongo(); // Call the function

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

let onlineUsers = 0;

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  onlineUsers++;
  io.emit('update_users_count', onlineUsers);

  socket.on('join', ({ name }) => {
    socket.username = name;
    const time = new Date().toLocaleTimeString();
    console.log(`✅ ${name} joined at ${time}`);

    io.emit('user_joined', {
      name,
      timestamp: time,
    });
  });

  socket.on('send_message', async (data) => {
    io.emit('receive_message', data);

    // Save to MongoDB
    try {
      await messagesCollection.insertOne({
        name: data.name,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error('❌ Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers--;
    io.emit('update_users_count', onlineUsers);

    const time = new Date().toLocaleTimeString();
    if (socket.username) {
      console.log(`❌ ${socket.username} left at ${time}`);
      io.emit('user_left', {
        name: socket.username,
        timestamp: time,
      });
    } else {
      console.log(`❌ Unknown user disconnected: ${socket.id}`);
    }
  });
});

// Optional: Expose saved messages on GET request
app.get('/messages', async (req, res) => {
  try {
    const allMessages = await messagesCollection.find({}).toArray();
    res.json(allMessages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

server.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
