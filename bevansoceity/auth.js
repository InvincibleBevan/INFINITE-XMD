const { LocalAuth } = require('whatsapp-web.js');

class Base64AuthStrategy extends LocalAuth {
    constructor() {
        super({ clientId: "infinite-xmd" });
    }

    async saveSession(sessionData) {
        try {
            const base64Session = Buffer.from(JSON.stringify(sessionData)).toString('base64');
            
            // Add INFINITY prefix to the session string
            const infinitySession = "INFINITY_" + base64Session;
            
            console.log('\n🔐 INFINITE-XMD SESSION CREATED:');
            console.log('✅ SESSION_BASE64=' + infinitySession);
            console.log('📝 Copy this for Heroku config!');
            console.log('💻 Developed by Bevan Society\n');
            
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    }

    async extractSession() {
        const base64Session = process.env.WA_SESSION_BASE64;
        
        if (base64Session) {
            try {
                // Remove INFINITY_ prefix if present
                let sessionString = base64Session;
                if (sessionString.startsWith('INFINITY_')) {
                    sessionString = sessionString.substring(9); // Remove "INFINITY_"
                }
                
                const sessionData = JSON.parse(Buffer.from(sessionString, 'base64').toString('utf-8'));
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
