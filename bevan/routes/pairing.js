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

const router = express.Router(); // ← This should be the only express thing here

// Utility: Generate random ID
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

// Utility: Remove file/folder
function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
    return true;
}

// Store active pairing sessions
const activeSessions = new Map();

// GET endpoint for pairing codes
router.get('/code', async (req, res) => {
    // ... keep your existing code here
});

// GET endpoint for QR code
router.get('/qr', async (req, res) => {
    // ... keep your existing code here
});

// Cleanup expired sessions (5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of activeSessions.entries()) {
        if (now - session.createdAt > 300000) {
            if (session.sock) session.sock.ws.close();
            removeFile(session.tempDir);
            activeSessions.delete(sessionId);
        }
    }
}, 60000);

module.exports = router; // ← Make sure this is at the end
