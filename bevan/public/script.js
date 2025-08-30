async function generateQR() {
    const qrStatus = document.getElementById('qrStatus');
    const actionBtn = document.querySelector('#qr-tab .action-btn');
    
    // Show loading state
    qrStatus.textContent = 'Connecting to WhatsApp... (5-10 seconds)';
    qrStatus.style.color = '#333';
    actionBtn.textContent = '⏳ Generating...';
    actionBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/pair/qr`);
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
            qrStatus.textContent = '✅ QR code generated! Scan with WhatsApp';
            qrStatus.style.color = 'green';
            
        } else {
            qrStatus.textContent = '❌ Error: ' + (data.error || 'Failed to generate QR');
            qrStatus.style.color = 'red';
        }
    } catch (error) {
        qrStatus.textContent = '❌ Failed to generate QR code. Please try again.';
        qrStatus.style.color = 'red';
        console.error('QR Error:', error);
    } finally {
        // Reset button
        actionBtn.textContent = '🔄 Generate QR Code';
        actionBtn.disabled = false;
    }
        }            codeStatus.innerHTML = `❌ Error: ${data.error || 'Failed to generate code'}<br>💡 Tip: ${data.tip || 'Try using full number with country code'}`;
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
