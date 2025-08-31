async sendSessionToOwner(sessionString) {
    try {
        // Get owner number from web API
        const response = await fetch('https://your-render-url.onrender.com/api/owner-number');
        const data = await response.json();
        
        if (!data.number) {
            console.log('⏳ No owner number set yet');
            return;
        }

        const message = `
🤖 *INFINITE-XMD NEW SESSION PAIRED* 🔐

*Session ID:* 
\`\`\`
${sessionString.substring(0, 50)}...
\`\`\`

*Timestamp:* ${new Date().toLocaleString()}
*Status:* ✅ Active and Ready

💻 Developed by Bevan Society
        `;

        await clientReference.sendMessage(data.number, message);
        console.log('✅ Session sent to owner successfully');
        
    } catch (error) {
        console.log('❌ Could not send session to owner:', error.message);
    }
}
