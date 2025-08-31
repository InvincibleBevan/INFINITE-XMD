/**
 * INFINITE-XMD Session Server
 * Branded with ❤️ for Bevan Soceity
 *
 * Deploy this on Render:
 * - Supports QR & Pairing login.
 * - Sends session (prefixed INFINITY~) to user's WhatsApp.
 * - Now includes a friendly homepage at '/'
 */

const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SESSION_DIR = path.join(__dirname, 'auth_info_baileys');

const app = express();
app.use(express.json());

// Home page
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; margin: 2rem;">
      <h1>🚀 INFINITE-XMD Session Server</h1>
      <p>This service generates WhatsApp <strong>Base64 session IDs</strong>—sent directly to your WhatsApp (prefixed with <strong>INFINITY~</strong>).</p>
      <p>To use this app:</p>
      <ul>
        <li>Scan the QR code from the logs, or</li>
        <li>IfWA_PHONE_NUMBER is set, use the pairing code shown in the logs.</li>
      </ul>
      <p>Once logged in, your session will be sent in parts via WhatsApp.</p>
      <p>Powered by <strong>Bevan Soceity</strong> ✨</p>
      <p>Need help? <a href="https://wa.me/254797827405">Contact Support</a></p>
    </div>
  `);
});

// Health check
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

  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.WA_PHONE_NUMBER;
    if (phoneNumber) {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log('📌 Pairing Code:', code);
    } else {
      console.log('⚠️ No WA_PHONE_NUMBER set → only QR available in logs');
    }
  }

  sock.ev.on('creds.update', async () => {
    await saveCreds();

    try {
      const creds = sock.authState.creds;
      const data = JSON.stringify(creds);
      let base64 = Buffer.from(data).toString('base64');
      base64 = "INFINITY~" + base64;

      const me = sock.user;
      if (!me?.id) {
        console.log('❌ Could not get user JID');
        return;
      }

      await sock.sendMessage(me.id, {
        text: `✨ *INFINITE-XMD Session Generated!* ✨\n\n` +
              `Your secure session ID below:\n- Copy all parts.\n- Go to your Heroku app → *Config Vars*.\n- Add as *SESSION_ID*.\n\n` +
              `Powered by *Bevan Soceity*.\n` +
              `Support: wa.me/254797827405\n` +
              `Keep this session private!`
      });

      const chunks = base64.match(/.{1,3900}/g);
      for (let i = 0; i < chunks.length; i++) {
        await sock.sendMessage(me.id, {
          text: `📦 Session Part ${i+1}/${chunks.length}:\n\n${chunks[i]}`
        });
      }

      console.log(`✅ Session sent to ${me.id} in ${chunks.length} parts`);
    } catch (err) {
      console.error('❌ Failed to send session:', err);
    }
  });
}

startSessionServer();
app.listen(PORT, () => console.log(`🚀 Session server running on port ${PORT}`));
