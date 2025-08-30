const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const pairingRouter = require('./routes/pairing');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use pairing router
app.use('/api/pair', pairingRouter);

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Session Generator running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
});

// Make io available to routes
app.set('io', io);
