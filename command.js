const axios = require('axios');

const commands = {
    '!ping': (message) => message.reply('🏓 INFINITE-XMD is alive!'),
    
    '!hello': (message) => message.reply('👋 Hello from INFINITE-XMD!'),
    
    '!info': (message) => {
        const info = `
🤖 *INFINITE-XMD BOT*
Version: 1.0
Status: Operational
Powered by: WhatsApp Web JS
        `;
        message.reply(info);
    },

    '!joke': async (message) => {
        try {
            const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
            message.reply(`😂 ${response.data.joke}`);
        } catch (error) {
            message.reply('❌ Failed to fetch joke');
        }
    },

    '!time': (message) => {
        const time = new Date().toLocaleString();
        message.reply(`⏰ Server Time: ${time}`);
    },

    '!help': (message) => {
        const helpText = `
🤖 *INFINITE-XMD COMMANDS*
!ping - Check bot status
!hello - Greeting
!info - Bot information
!joke - Random joke
!time - Current time
!help - Show this help
        `;
        message.reply(helpText);
    }
};

module.exports = commands;
