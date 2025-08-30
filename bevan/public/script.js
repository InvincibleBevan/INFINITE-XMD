let currentTab = 'qr-tab';

function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-btn[onclick="showTab('${tabId}')"]`).classList.add('active');
    currentTab = tabId;
}

async function generateQR() {
    const number = document.getElementById('qrNumber').value.trim();
    if (!number || !/^\d{10,15}$/.test(number)) {
        alert('Please enter a valid WhatsApp number (10-15 digits)');
        return;
    }

    document.getElementById('qrStatus').textContent = 'Generating QR code...';
    
    try {
        const response = await fetch(`/api/pair/qr?number=${number}`);
        const data = await response.json();
        
        if (data.success) {
            // Display QR code
            const qrContainer = document.getElementById('qrcode');
            qrContainer.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qr)}`;
            img.alt = 'WhatsApp QR Code';
            img.className = 'qr-image';
            
            qrContainer.appendChild(img);
            document.getElementById('qrStatus').textContent = 'Scan this QR code with WhatsApp';
        } else {
            document.getElementById('qrStatus').textContent = 'Error: ' + data.error;
        }
    } catch (error) {
        document.getElementById('qrStatus').textContent = 'Failed to generate QR code';
    }
}

async function generatePairingCode() {
    const number = document.getElementById('codeNumber').value.trim();
    if (!number || !/^\d{10,15}$/.test(number)) {
        alert('Please enter a valid WhatsApp number (10-15 digits)');
        return;
    }

    document.getElementById('codeStatus').textContent = 'Generating pairing code...';
    
    try {
        const response = await fetch(`/api/pair/code?number=${number}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('codeDisplay').textContent = data.code;
            document.getElementById('codeStatus').textContent = 'Use this code in WhatsApp → Linked Devices';
        } else {
            document.getElementById('codeStatus').textContent = 'Error: ' + data.error;
        }
    } catch (error) {
        document.getElementById('codeStatus').textContent = 'Failed to generate pairing code';
    }
}
