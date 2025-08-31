const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const SESSION_FILE = path.join(__dirname, 'session.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ✅ Save session (Base64)
app.post('/api/session', (req, res) => {
    const { session } = req.body;
    if (!session) {
        return res.status(400).json({ error: 'Session is required' });
    }

    fs.writeFileSync(SESSION_FILE, JSON.stringify({ session }), 'utf8');
    console.log('💾 Session saved to session.json');
    res.json({ message: 'Session saved successfully' });
});

// ✅ Get session
app.get('/api/session', (req, res) => {
    if (!fs.existsSync(SESSION_FILE)) {
        return res.status(404).json({ error: 'No session found' });
    }
    const data = fs.readFileSync(SESSION_FILE, 'utf8');
    res.json(JSON.parse(data));
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🚀 Session server running on http://localhost:${PORT}`);
});
