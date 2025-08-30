const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { Server } = require('socket.io');
const http = require('http');
const qrcode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let ownerNumber = null;
let currentQR = null;

// Store QR code
io.on('connection', (socket) => {
    console.log('User connected to website');
    
    // Send current QR if exists
    if (currentQR) {
        socket.emit('qr', currentQR);
    }
});

// API to receive QR from bot
app.post('/api/qr', async (req, res) => {
    try {
        const { qr } = req.body;
        currentQR = qr;
        
        // Convert to data URL for web display
        const qrDataUrl = await qrcode.toDataURL(qr);
        io.emit('qr', qrDataUrl);
        
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ... keep your existing owner number APIs ...

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Session Website running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
});
