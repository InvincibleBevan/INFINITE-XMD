// Connect to server
const socket = io();

socket.on('connect', () => {
    console.log('Connected to INFINITE-XMD server');
    document.getElementById('status').textContent = 'Connected to server';
});

socket.on('qr', (qrCode) => {
    document.getElementById('status').textContent = 'Scan the QR code with WhatsApp';
    // QR code generation would go here
    console.log('QR code received:', qrCode);
});

socket.on('authenticated', () => {
    document.getElementById('status').textContent = '✅ WhatsApp authenticated successfully!';
    document.getElementById('status').style.color = 'green';
});

socket.on('ready', () => {
    document.getElementById('status').textContent = '🤖 INFINITE-XMD is ready!';
});

socket.on('disconnect', () => {
    document.getElementById('status').textContent = '❌ Disconnected from server';
    document.getElementById('status').style.color = 'red';
});

// Simulate QR code for demonstration (replace with real QR generation)
function simulateQR() {
    document.getElementById('status').textContent = 'Displaying QR code...';
    setTimeout(() => {
        socket.emit('simulate_qr');
    }, 2000);
}

// Start simulation on page load
window.addEventListener('load', simulateQR);
/* Add these to your existing CSS */

.owner-section {
    margin: 25px 0;
    padding: 20px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 10px;
}

.owner-section h3 {
    color: #856404;
    margin-bottom: 10px;
}

.owner-section p {
    color: #666;
    margin-bottom: 15px;
}

.input-group {
    margin-bottom: 15px;
    text-align: left;
}

.input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.input-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.input-group input:focus {
    border-color: #667eea;
    outline: none;
}

.input-group small {
    color: #666;
    font-size: 12px;
}

button {
    background: #28a745;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    width: 100%;
}

button:hover {
    background: #218838;
}

button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
}

.message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.message.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}
