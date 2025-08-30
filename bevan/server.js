const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const pairingRouter = require('./routes/pairing');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use pairing router
app.use('/api/pair', pairingRouter);

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Session Generator running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
    console.log('📱 Base64 Session + Baileys Pairing');
    console.log('🚀 Ready for pairing codes and QR codes');
});

// Add CORS support
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
