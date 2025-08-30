const { LocalAuth } = require('whatsapp-web.js');

class Base64AuthStrategy extends LocalAuth {
    constructor() {
        super({ clientId: "infinite-xmd" });
    }

    async saveSession(sessionData) {
        try {
            const base64Session = Buffer.from(JSON.stringify(sessionData)).toString('base64');
            console.log('\n🔐 INFINITE-XMD SESSION CREATED:');
            console.log('✅ SESSION_BASE64=' + base64Session);
            console.log('📝 Copy this for Heroku config!');
            console.log('Developed by Bevan Society\n');
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    }

    async extractSession() {
        const base64Session = process.env.WA_SESSION_BASE64;
        if (base64Session) {
            try {
                const sessionData = JSON.parse(Buffer.from(base64Session, 'base64').toString('utf-8'));
                console.log('♻️ Session restored - Developed by Bevan Society');
                return sessionData;
            } catch (err) {
                console.log('❌ Invalid session. Need new QR scan.');
                return null;
            }
        }
        return null;
    }
}

module.exports = Base64AuthStrategy;
