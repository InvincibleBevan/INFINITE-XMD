const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Base64AuthStrategy = require('./auth');
const commands = require('./commands');

console.log('🚀 Starting INFINITE-XMD WhatsApp Bot...');

const client = new Client({
    authStrategy: new Base64AuthStrategy(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

client.on('qr', qr => {
    console.log('🔐 INFINITE-XMD Authentication Required:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ INFINITE-XMD is now operational!');
    console.log('🤖 Bot is ready to receive commands');
});

client.on('authenticated', () => {
    console.log('✅ INFINITE-XMD authenticated successfully!');
});

client.on('auth_failure', msg => {
    console.error('❌ INFINITE-XMD auth failure:', msg);
});

client.on('message', message => {
    const command = message.body.split(' ')[0];
    
    if (commands[command]) {
        console.log(`📨 Command received: ${command} from ${message.from}`);
        commands[command](message);
    }
});

client.on('disconnected', (reason) => {
    console.log(`❌ INFINITE-XMD disconnected: ${reason}`);
});

client.initialize();
