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
