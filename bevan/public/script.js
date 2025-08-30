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
    document.getElementById('qrStatus').style.color = '#333';
    
    try {
        const response = await fetch(`/api/pair/qr?number=${number}`);
        const data = await response.json();
        
        if (data.success) {
            // Display QR code using the actual QR data from Baileys
            const qrContainer = document.getElementById('qrcode');
            qrContainer.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qr)}`;
            img.alt = 'WhatsApp QR Code';
            img.className = 'qr-image';
            
            qrContainer.appendChild(img);
            document.getElementById('qrStatus').textContent = 'Scan this QR code with WhatsApp';
            document.getElementById('qrStatus').style.color = 'green';
        } else {
            document.getElementById('qrStatus').textContent = 'Error: ' + (data.error || 'Failed to generate QR');
            document.getElementById('qrStatus').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('qrStatus').textContent = 'Failed to generate QR code. Please try again.';
        document.getElementById('qrStatus').style.color = 'red';
        console.error('QR Error:', error);
    }
}

async function generatePairingCode() {
    const number = document.getElementById('codeNumber').value.trim();
    if (!number || !/^\d{10,15}$/.test(number)) {
        alert('Please enter a valid WhatsApp number (10-15 digits)');
        return;
    }

    const codeDisplay = document.getElementById('codeDisplay');
    const codeStatus = document.getElementById('codeStatus');
    
    codeStatus.textContent = 'Requesting pairing code...';
    codeStatus.style.color = '#333';
    codeDisplay.textContent = '';
    
    try {
        const response = await fetch(`/api/pair/code?number=${number}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            codeDisplay.textContent = data.code;
            codeStatus.textContent = 'Use this code in WhatsApp → Linked Devices → Link with pairing code';
            codeStatus.style.color = 'green';
            
            // Auto-format the code if it's in XXXXX-XXXX format
            if (data.code && data.code.includes('-')) {
                codeDisplay.innerHTML = `<span style="font-size: 32px; letter-spacing: 2px;">${data.code}</span>`;
            }
        } else {
            codeStatus.textContent = 'Error: ' + (data.error || 'Failed to generate code');
            codeStatus.style.color = 'red';
        }
    } catch (error) {
        codeStatus.textContent = 'Failed to generate pairing code. Please try again.';
        codeStatus.style.color = 'red';
        console.error('Pairing Code Error:', error);
    }
}

// Add event listeners for Enter key
document.addEventListener('DOMContentLoaded', function() {
    // Add Enter key support for QR tab
    document.getElementById('qrNumber').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQR();
        }
    });
    
    // Add Enter key support for code tab
    document.getElementById('codeNumber').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generatePairingCode();
        }
    });
});
