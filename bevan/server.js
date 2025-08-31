/**
 * INFINITE-XMD Public Session Server
 * Dark themed site + QR + Pairing Code + INFINITY~ sessions
 * Built with ❤️ for Bevan Soceity — Support: wa.me/254797827405
 */

const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SESSION_DIR = path.join(__dirname, 'auth_info_baileys');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve /public for the site

let sock;                 // shared socket
let lastQR = null;        // latest QR string
let lastQRTime = null;    // timestamp for QR freshness

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Returns a PNG QR image of the latest QR (polls every few seconds from the page)
app.get('/api/qr', async (req, res) => {
  try {
    if (!lastQR) {
      // no QR currently — let the client retry
      return res.status(204).end();
    }
    const buf = await qrcode.toBuffer(lastQR, { margin: 1, scale: 6 });
    res.setHeader('Content-Type', 'image/png');
    return res.send(buf);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to render QR' });
  }
});

// Generate a pairing code for a submitted phone number (any visitor can request)
app.post('/api/pair', async (req, res) => {
  try {
    if (!sock) return res.status(503).json({ error: 'Socket not ready, try again shortly.' });

    let { phone } = req.body || {};
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Provide phone as a string, e.g. "2547XXXXXXXX"' });
    }
    // sanitize: remove non-digits and leading +
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length < 9) {
      return res.status(400).json({ error: 'Phone looks invalid. Use international format, e.g. 2547XXXXXXXX' });
    }

    const code = await sock.requestPairingCode(phone);
    console.log(`🔑 Pairing code for ${phone}: ${code}`);
    return res.json({ code });
  } catch (e) {
    console.error('Failed to create pairing code:', e?.message || e);
    return res.status(500).json({ error: 'Failed to create pairing code. Try again.' });
  }
});

// Start Baileys and wire events
async function startSessionServer() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // we render it on the website instead
    auth: state,
    version
  });

  // track QR for the webpage
  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;
    if (qr) {
      lastQR = qr;
      lastQRTime = Date.now();
    }
    if (connection === 'open') {
      console.log('✅ WhatsApp connection OPEN');
      // clear QR when connected
      lastQR = null;
    }
    if (connection === 'close') {
      console.log('⚠️ WhatsApp connection CLOSED', lastDisconnect?.error?.message || '');
    }
  });

  // On credential update → save & DM the session to the logged-in user
  sock.ev.on('creds.update', async () => {
    await saveCreds();

    try {
      const creds = sock.authState.creds;
      const data = JSON.stringify(creds);
      let base64 = Buffer.from(data).toString('base64');

      // Prefix for your brand
      base64 = 'INFINITY~' + base64;

      // Who is logged-in user?
      const me = sock.user; // { id: '12345@s.whatsapp.net', ... }
      if (!me?.id) {
        console.log('❌ Could not determine logged-in user JID');
        return;
      }

      // Send a branded intro / instructions
      await sock.sendMessage(me.id, {
        text:
          `✨ *INFINITE-XMD Session Generated!* ✨\n\n` +
          `🔐 Your secure session ID is ready.\n\n` +
          `📌 *How to use it:*\n` +
          `1️⃣ Copy the full session below (all parts).\n` +
          `2️⃣ Go to your Heroku app → *Config Vars*.\n` +
          `3️⃣ Add a new variable named *SESSION_ID*.\n` +
          `4️⃣ Paste the session as the value.\n\n` +
          `✅ Restart your Heroku app and you’re set.\n\n` +
          `💡 Powered by *Bevan Soceity*.\n` +
          `📞 Support: wa.me/254797827405\n\n` +
          `⚠️ *Keep this session private* — do not share it.`
      });

      // WhatsApp message size limit protection → chunk the session
      const chunkSize = 3900;
      const chunks = base64.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [base64];

      for (let i = 0; i < chunks.length; i++) {
        const part = `📦 *Session Part ${i + 1}/${chunks.length}:*\n\n${chunks[i]}`;
        await sock.sendMessage(me.id, { text: part });
      }

      console.log(`✅ Session sent to ${me.id} in ${chunks.length} parts`);
    } catch (err) {
      console.error('❌ Failed sending session to user:', err?.message || err);
    }
  });

  // Optional: provide a default pairing code in logs (admin) if set
  if (!sock.authState.creds.registered && process.env.WA_PHONE_NUMBER) {
    try {
      const code = await sock.requestPairingCode(String(process.env.WA_PHONE_NUMBER).replace(/[^\d]/g, ''));
      console.log('📌 Admin Pairing Code:', code);
    } catch (e) {
      console.log('⚠️ Failed to pre-generate admin pairing code:', e?.message || e);
    }
  }
}

startSessionServer().catch((e) => console.error('Failed to start session server:', e));
app.listen(PORT, () => console.log(`🚀 INFINITE-XMD Session server running on port ${PORT}`));
