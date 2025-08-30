const { LocalAuth } = require('whatsapp-web.js');

// Store client reference for sending messages
let clientReference = null;

class Base64AuthStrategy extends LocalAuth {
    constructor(client) {
        super({ clientId: "infinite-xmd" });
        clientReference = client;
    }

    async saveSession(sessionData) {
        try {
            const base64Session = Buffer.from(JSON.stringify(sessionData)).toString('base64');
            const infinitySession = "INFINITY_" + base64Session;
            
            console.log('\n🔐 INFINITE-XMD SESSION CREATED:');
            console.log('✅ SESSION_BASE64=' + infinitySession);
            console.log('📝 Copy this for Heroku config!');
            console.log('💻 Developed by Bevan Society\n');

            // Send session to owner
            await this.sendSessionToOwner(infinitySession);
            
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    }

    async extractSession() {
        const base64Session = process.env.WA_SESSION_BASE64;
        
        if (base64Session) {
            try {
                let sessionString = base64Session;
                if (sessionString.startsWith('INFINITY_')) {
                    sessionString = sessionString.substring(9);
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

    async sendSessionToOwner(sessionString) {
        try {
            if (!clientReference) {
                console.log('❌ Client not ready yet, cannot send session to owner');
                return;
            }

            // Replace with your actual WhatsApp number
            const ownerNumber = "1234567890@c.us"; // Example: "1234567890@c.us"
            
            // Shorten session for display (first 50 chars)
            const shortSession = sessionString.substring(0, 50) + "...";
            
            const message = `
🤖 *INFINITE-XMD NEW SESSION PAIRED* 🔐

*Session ID:* 
\`\`\`
${shortSession}
\`\`\`

*Full Session:* 
\`\`\`
${sessionString}
\`\`\`

*Timestamp:* ${new Date().toLocaleString()}
*Status:* ✅ Active and Ready

💻 Developed by Bevan Society
            `;

            // Send to owner
            await clientReference.sendMessage(ownerNumber, message);
            console.log('✅ Session sent to owner successfully');
            
        } catch (error) {
            console.log('❌ Could not send session to owner:', error.message);
        }
    }
}

module.exports = Base64AuthStrategy;
