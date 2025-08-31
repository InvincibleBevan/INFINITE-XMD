const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const router = express.Router();

let storedSession = null;

router.get('/', (req, res) => {
    res.sendFile('pairing.html', { root: './public' });
});

router.post('/start', (req, res) => {
    const io = req.io;

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

    // Event: Successful Authentication
    client.on('authenticated', (session) => {
        io.emit('statusMessage', '✅ Successfully paired! Session saved.');
        console.log('Authenticated!');
        const sessionData = JSON.stringify(session);
        storedSession = Buffer.from(sessionData).toString('base64');
        console.log('SESSION SAVED (Base64):', storedSession);
        io.emit('sessionSaved', true);
    });

    client.on('ready', () => {
        io.emit('statusMessage', 'Client is ready!');
        console.log('Client is ready!');
    });

    client.on('disconnected', (reason) => {
        io.emit('statusMessage', `Disconnected: ${reason}`);
        console.log('Client disconnected.', reason);
    });

    // --- THE GUARANTEED METHOD TO GET PAIRING CODE ---
    client.initialize().then(() => {
        // Get the underlying Puppeteer page
        client.getPage().then((page) => {
            // Wait for the pairing code element to appear in the DOM
            page.waitForSelector('div[data-testid="pairing-code"]', { timeout: 60000 })
            .then(() => {
                // Extract the text content of the pairing code element
                return page.$eval('div[data-testid="pairing-code"]', element => element.textContent);
            })
            .then((pairingCode) => {
                if (pairingCode) {
                    console.log('Pairing Code Found:', pairingCode);
                    // Emit the pairing code to the frontend
                    io.emit('pairingCode', pairingCode);
                    io.emit('statusMessage', `Or enter this pairing code: ${pairingCode}`);
                }
            })
            .catch((err) => {
                console.log('Could not find pairing code element (may have been scanned already):', err);
            });
        });
    }).catch(err => {
        console.error('Error initializing client:', err);
        io.emit('statusMessage', 'Failed to start pairing process.');
    });

    res.json({ success: true, message: 'Pairing process started.' });
});

module.exports = router;
