const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const instructorRoutes = require('./routes/instructor');
const studentRoutes = require('./routes/student');
const { db } = require('./config/firebase');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Classroom Management API is running' });
});

const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ userId, role }) => {
    activeUsers.set(socket.id, { userId, role });
    socket.join(userId);
    console.log(`${role} ${userId} joined`);
  });

  socket.on('sendMessage', async ({ from, to, message, fromRole, toRole }) => {
    const chatMessage = {
      id: Date.now().toString(),
      from,
      to,
      message,
      fromRole,
      toRole,
      timestamp: new Date().toISOString()
    };

    try {
      const chatId = [from, to].sort().join('_');
      await db.collection('messages').doc(chatId).collection('chat').add(chatMessage);

      io.to(from).emit('newMessage', chatMessage);
      io.to(to).emit('newMessage', chatMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('getMessages', async ({ user1, user2 }, callback) => {
    try {
      const chatId = [user1, user2].sort().join('_');
      const messagesSnapshot = await db.collection('messages')
        .doc(chatId)
        .collection('chat')
        .orderBy('timestamp', 'asc')
        .get();

      const messages = [];
      messagesSnapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      callback({ success: true, messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      callback({ success: false, error: 'Failed to fetch messages' });
    }
  });

  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
