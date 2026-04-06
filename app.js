require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect to database
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'korean_learning_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/korean_learning',
    touchAfter: 24 * 3600
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/academic', require('./routes/academic'));
app.use('/teacher', require('./routes/teacher'));
app.use('/student', require('./routes/student'));

// 404
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found', user: req.user });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { message: 'Internal server error', user: req.user });
});

// Socket.IO for realtime messaging
const Message = require('./models/Message');

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const message = await Message.create({ sender: senderId, receiver: receiverId, content });
      const populated = await message.populate('sender receiver');
      io.to(receiverId).emit('receiveMessage', {
        _id: populated._id,
        sender: { _id: populated.sender._id, name: populated.sender.name, avatar: populated.sender.avatar },
        content: populated.content,
        createdAt: populated.createdAt
      });
      socket.emit('messageSent', {
        _id: populated._id,
        receiver: { _id: populated.receiver._id, name: populated.receiver.name },
        content: populated.content,
        createdAt: populated.createdAt
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
