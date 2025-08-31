const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const router = express.Router();

// Store session - For Render, we will log the Base64 session to the console.
let storedSession = null;

// This route handles the initial page load for the pairing section
router.get('/', (req, res) => {
    res.sendFile('pairing.html', { root: './public' });
});

// Socket.io connection for real-time updates is handled via the main server.js
// We access the io instance from the request object set by the middleware
router.post('/start', (req, res) => {
    const io = req.io;

    // Initialize the WhatsApp client with specific options for Render
    const client = new Client({
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        }
    });

    // Event: Generate QR Code
    client.on('qr', async (qr) => {
        console.log('QR Received:', qr);
        try {
            const qrImageUrl = await qrcode.toDataURL(qr);
            io.emit('qrCode', { qr, qrImageUrl });
            io.emit('statusMessage', 'Scan the QR code below...');
        } catch (err) {
            console.error('Error generating QR image:', err);
            io.emit('statusMessage', 'Error generating QR code.');
        }
    });

    // Event: Generate Pairing Code (Numeric)
    client.on('pairing_code', (code) => {
        console.log('Pairing Code Received:', code);
        io.emit('pairingCode', code);
        io.emit('statusMessage', `Alternatively, enter this code in your WhatsApp: ${code}`);
    });

    // Event: Successful Authentication
    client.on('authenticated', (session) => {
        io.emit('statusMessage', '✅ Successfully paired! Session saved. You can close this page.');
        console.log('Authenticated!');

        // Convert session to Base64 for storage
        const sessionData = JSON.stringify(session);
        storedSession = Buffer.from(sessionData).toString('base64');
        
        // TODO: In production, save `storedSession` to a database here.
        // For now, we log it to the console on Render.
        console.log('SESSION SAVED (Base64):', storedSession);
        io.emit('sessionSaved', true);
    });

    client.on('ready', () => {
        io.emit('statusMessage', 'Client is ready!');
        console.log('Client is ready!');
    });

    client.on('disconnected', (reason) => {
        io.emit('statusMessage', `Client was logged out: ${reason}`);
        console.log('Client was logged out', reason);
    });

    // Initialize the client to start the process
    client.initialize();

    res.json({ success: true, message: 'Pairing process started.' });
});

module.exports = router;
