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

// Socket.io for real-time QR updates
io.on('connection', (socket) => {
    console.log('User connected to website');
    
    if (currentQR) {
        socket.emit('qr', currentQR);
    }
});

// API endpoints
app.post('/api/qr', async (req, res) => {
    try {
        const { qr } = req.body;
        currentQR = await qrcode.toDataURL(qr);
        io.emit('qr', currentQR);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Owner number APIs (keep your existing ones)
app.post('/api/save-owner', async (req, res) => {
    try {
        const { number } = req.body;
        if (!number || !number.endsWith('@c.us')) {
            return res.json({ success: false, message: 'Invalid number format' });
        }
        
        ownerNumber = number;
        await fs.writeFile('owner.json', JSON.stringify({ number }));
        
        console.log('✅ Owner number saved:', number);
        res.json({ success: true, message: 'Number saved successfully' });
        
    } catch (error) {
        res.json({ success: false, message: 'Server error' });
    }
});

app.get('/api/get-owner', async (req, res) => {
    try {
        const data = await fs.readFile('owner.json', 'utf8');
        const saved = JSON.parse(data);
        ownerNumber = saved.number;
    } catch (error) {
        // File doesn't exist yet
    }
    res.json({ number: ownerNumber });
});

// Serve different pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pair.html'));
});

app.get('/owner', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'owner.html'));
});

server.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Website running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
    console.log('📁 Pages available: /, /pair, /owner');
});
