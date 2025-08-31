const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Base64AuthStrategy, setClient } = require('./auth');
const commands = require('./commands');
const { updateBio } = require('./autobio');

console.log('🚀 Starting INFINITE-XMD WhatsApp Bot...');
console.log('💻 Developed by Bevan Society');

const client = new Client({
    authStrategy: new Base64AuthStrategy(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

setClient(client);

client.on('qr', async (qr) => {
    console.log('🔐 INFINITE-XMD Authentication Required:');
    qrcode.generate(qr, { small: true });
    
    // Send QR to website
    try {
        const webUrl = process.env.WEB_APP_URL || 'https://your-render-url.onrender.com';
        await axios.post(`${webUrl}/api/qr`, { qr });
        console.log('✅ QR code sent to website');
    } catch (error) {
        console.log('❌ Could not send QR to website:', error.message);
    }
});

client.on('ready', async () => {
    console.log('✅ INFINITE-XMD is now operational!');
    console.log('🤖 Developed by Bevan Society');
    
    try {
        await updateBio(client);
        console.log('✅ Bio set successfully');
    } catch (error) {
        console.log('⚠️ Could not set initial bio');
    }
});

// ... rest of your event handlers ...

client.initialize();
