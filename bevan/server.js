const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');

// Import the pairing route
const pairingRouter = require('./routes/pairing');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to set up socket.io in the request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the pairing router for all routes related to pairing
app.use('/pairing', pairingRouter);

// Route for the main homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Bevan app running on http://localhost:${PORT}`);
});
