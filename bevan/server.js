/**
 * INFINITE-XMD Session Server
 * Branded with ❤️ for Bevan Soceity
 *
 * Deploy this on Render:
 * - Shows QR in logs (for local login)
 * - Supports Pairing Code login (for headless servers)
 * - After login, sends Base64 session (prefixed INFINITY~) 
 *   directly to the user’s WhatsApp in chunks
 */

const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SESSION_DIR = path.join(__dirname, 'auth_info_baileys');

const app = express();
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

async function startSessionServer() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    version
  });

  // If creds not registered, try pairing code
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.WA_PHONE_NUMBER;
    if (phoneNumber) {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log('📌 Pairing Code:', code);
    } else {
      console.log('⚠️ No WA_PHONE_NUMBER set → only QR available in logs');
    }
  }

  // When session updates → save and send to user
  sock.ev.on('creds.update', async () => {
    await saveCreds();

    try {
      const creds = sock.authState.creds;
      const data = JSON.stringify(creds);
      let base64 = Buffer.from(data).toString('base64');

      // Add INFINITY~ prefix
      base64 = "INFINITY~" + base64;

      const me = sock.user;
      if (!me || !me.id) {
        console.log('❌ Could not determine logged-in user JID');
        return;
      }

      // Send welcome + instructions
      await sock.sendMessage(me.id, {
        text: `✨ *INFINITE-XMD Session Generated!* ✨\n\n` +
              `🔐 Your secure session ID has been created.\n\n` +
              `📌 *How to use it:*\n` +
              `1️⃣ Copy the full session below (all parts).\n` +
              `2️⃣ Go to your Heroku app → *Config Vars*.\n` +
              `3️⃣ Add a new variable named *SESSION_ID*.\n` +
              `4️⃣ Paste the copied session as its value.\n\n` +
              `✅ Done! Restart your Heroku app and your bot will run instantly.\n\n` +
              `💡 Powered by *Bevan Soceity*.\n` +
              `📞 Contact support: wa.me/254797827405\n\n` +
              `⚠️ *Keep your session private* – do not share it with anyone.`
      });

      // Split session into chunks
      const chunkSize = 3900; // safe limit
      const chunks = base64.match(new RegExp(`.{1,${chunkSize}}`, 'g'));

      for (let i = 0; i < chunks.length; i++) {
        const part = `📦 *Session Part ${i + 1}/${chunks.length}:*\n\n${chunks[i]}`;
        await sock.sendMessage(me.id, { text: part });
      }

      console.log(`✅ Session sent to ${me.id} in ${chunks.length} parts`);
    } catch (err) {
      console.error('❌ Failed to send session:', err);
    }
  });
}

startSessionServer();
app.listen(PORT, () => console.log(`🚀 Session server running on ${PORT}`));
