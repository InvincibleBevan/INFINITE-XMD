const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

const router = express.Router();

// Global variables for SINGLE persistent connection
let qrGeneratorClient = null;
let currentQR = null;
let qrResolveFunction = null;
let isQRReady = false;

// Initialize the persistent QR generator
async function initializeQRGenerator() {
    const tempDir = path.join(__dirname, 'temp', 'qr_generator');
    fs.mkdirSync(tempDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(tempDir);

    qrGeneratorClient = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: Browsers.macOS("Safari"),
        shouldSyncHistoryMessage: () => false,
        syncFullHistory: false,
        markOnlineOnConnect: false
    });

    qrGeneratorClient.ev.on('creds.update', saveCreds);

    qrGeneratorClient.ev.on("connection.update", (update) => {
        const { connection, qr } = update;

        if (qr) {
            currentQR = qr;
            isQRReady = true;
            // If someone is waiting for a QR, send it immediately
            if (qrResolveFunction) {
                qrResolveFunction(qr);
                qrResolveFunction = null;
            }
        }

        if (connection === 'open') {
            // After connection, reset for next QR
            setTimeout(() => {
                qrGeneratorClient.ws.close();
                initializeQRGenerator(); // Reinitialize for new QR
            }, 2000);
        }
    });
}

// Initialize the QR generator when server starts
initializeQRGenerator().catch(console.error);

// INSTANT QR Code Endpoint
router.get('/qr', async (req, res) => {
    try {
        let qrToSend = null;

        if (isQRReady && currentQR) {
            // Case 1: QR is already available - send INSTANTLY
            qrToSend = currentQR;
            isQRReady = false;
            currentQR = null;
        } else {
            // Case 2: Wait for new QR (should be very fast)
            qrToSend = await new Promise((resolve) => {
                qrResolveFunction = resolve;
                // Timeout after 5 seconds
                setTimeout(() => resolve(null), 5000);
            });
        }

        if (qrToSend) {
            res.json({ success: true, qr: qrToSend });
        } else {
            res.status(408).json({ error: 'QR generation timeout' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Pairing Code Endpoint (also optimized)
router.get('/code', async (req, res) => {
    const { number } = req.query;
    
    if (!number) {
        return res.status(400).json({ error: 'Phone number required' });
    }

    const sessionId = Math.random().toString(36).substring(2, 15);
    const tempDir = path.join(__dirname, 'temp', sessionId);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: Browsers.macOS("Safari"),
            shouldSyncHistoryMessage: () => false,
            syncFullHistory: false,
            markOnlineOnConnect: false
        });

        sock.ev.on('creds.update', saveCreds);

        // Format the phone number correctly
        const formatPhoneNumber = (num) => {
            let clean = num.replace(/\D/g, '');
            if (clean.startsWith('0')) clean = '254' + clean.substring(1);
            if (clean.length === 9) clean = '254' + clean;
            return clean;
        };

        const formattedNumber = formatPhoneNumber(number);
        
        // Request pairing code immediately
        const code = await sock.requestPairingCode(formattedNumber);
        
        res.json({ success: true, code: code });

        // Handle the rest asynchronously
        sock.ev.on("connection.update", async (update) => {
            if (update.connection === "open") {
                await delay(1000);
                const credsPath = path.join(tempDir, 'creds.json');
                
                if (fs.existsSync(credsPath)) {
                    try {
                        const sessionData = fs.readFileSync(credsPath, 'utf8');
                        const base64Session = Buffer.from(sessionData).toString('base64');
                        const infinitySession = "INFINITY_" + base64Session;

                        const message = `🔐 *YOUR WHATSAPP SESSION ID* - INFINITE-XMD
*Session ID:* \`\`\`${infinitySession}\`\`\``;

                        await sock.sendMessage(sock.user.id, { text: message });
                    } catch (error) {
                        console.error('Error sending session message:', error);
                    }
                }

                await sock.ws.close();
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

    } catch (error) {
        console.error('Pairing code error:', error);
        fs.rmSync(tempDir, { recursive: true, force: true });
        res.status(500).json({ error: 'Failed to generate pairing code' });
    }
});

// Cleanup temp directory on server start
const mainTempDir = path.join(__dirname, 'temp');
if (fs.existsSync(mainTempDir)) {
    fs.rmSync(mainTempDir, { recursive: true, force: true });
}

module.exports = router;
