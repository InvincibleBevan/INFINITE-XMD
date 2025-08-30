const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Use absolute path for static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 INFINITE-XMD Session Website running on port ${PORT}`);
    console.log('💻 Developed by Bevan Society');
});
