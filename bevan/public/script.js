async function generatePairingCode() {
    const number = document.getElementById('codeNumber').value.trim();
    if (!number || !/^\d{10,15}$/.test(number)) {
        alert('Please enter a valid WhatsApp number (10-15 digits). Include country code without + (e.g., 254712345678)');
        return;
    }

    const codeDisplay = document.getElementById('codeDisplay');
    const codeStatus = document.getElementById('codeStatus');
    
    codeStatus.textContent = 'Requesting pairing code from WhatsApp...';
    codeStatus.style.color = '#333';
    codeDisplay.textContent = '';
    
    try {
        const response = await fetch(`/api/pair/code?number=${number}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            codeDisplay.textContent = data.code;
            codeStatus.innerHTML = `
                ✅ <strong>Pairing code generated!</strong><br>
                📱 <strong>How to use:</strong><br>
                1. Open WhatsApp<br>
                2. Go to Menu → Linked Devices<br>
                3. Tap "Link with pairing code"<br>
                4. Enter this code: <strong>${data.code}</strong>
            `;
            codeStatus.style.color = 'green';
            
        } else {
            codeStatus.innerHTML = `❌ Error: ${data.error || 'Failed to generate code'}<br>💡 Tip: ${data.tip || 'Try using full number with country code'}`;
            codeStatus.style.color = 'red';
        }
    } catch (error) {
        codeStatus.innerHTML = '❌ Failed to generate pairing code. Please try again.<br>💡 Make sure to use full number with country code (e.g., 254712345678)';
        codeStatus.style.color = 'red';
        console.error('Pairing Code Error:', error);
    }
}            qrContainer.appendChild(img);
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
    // Add Enter key support for code tab only (QR doesn't need number)
    document.getElementById('codeNumber').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generatePairingCode();
        }
    });
});
