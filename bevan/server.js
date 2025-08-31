const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const pairingRouter = require('./routes/pairing');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Routes
app.use('/api/pair', pairingRouter);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Website running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
});
