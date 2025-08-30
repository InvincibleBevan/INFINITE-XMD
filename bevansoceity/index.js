const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Base64AuthStrategy = require('./auth');
const commands = require('./commands');
const { updateBio } = require('./autobio');

console.log('🚀 Starting INFINITE-XMD WhatsApp Bot...');
console.log('💻 Developed by Bevan Society');

// Create client with auth strategy that receives client reference
const client = new Client({
    authStrategy: new Base64AuthStrategy(client), // Pass client to auth
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

// ... rest of your index.js code remains the same ...
client.on('qr', qr => {
    console.log('🔐 INFINITE-XMD Authentication Required:');
    qrcode.generate(qr, { small: true });
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

client.on('message', message => {
    const command = message.body.split(' ')[0];
    
    if (commands[command]) {
        console.log(`📨 Command: ${command} from ${message.from}`);
        commands[command](message);
    }
});

client.initialize();
