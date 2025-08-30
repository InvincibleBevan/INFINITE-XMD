const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store owner number (in production, use a database)
let ownerNumber = null;

// API to save owner number
app.post('/api/save-owner', async (req, res) => {
    try {
        const { number } = req.body;
        
        if (!number || !number.endsWith('@c.us')) {
            return res.json({ success: false, message: 'Invalid number format' });
        }
        
        ownerNumber = number;
        
        // Save to file (optional persistence)
        await fs.writeFile('owner.json', JSON.stringify({ number }));
        
        console.log('✅ Owner number saved:', number);
        res.json({ success: true, message: 'Number saved successfully' });
        
    } catch (error) {
        console.error('Error saving owner number:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

// API to get owner number
app.get('/api/get-owner', async (req, res) => {
    try {
        // Try to read from file
        try {
            const data = await fs.readFile('owner.json', 'utf8');
            const saved = JSON.parse(data);
            ownerNumber = saved.number;
        } catch (error) {
            // File doesn't exist yet
        }
        
        res.json({ number: ownerNumber });
    } catch (error) {
        res.json({ number: null });
    }
});

// Get owner number for bot use
app.get('/api/owner-number', (req, res) => {
    res.json({ number: ownerNumber });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Session Website running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
});
