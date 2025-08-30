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
    
    // Find and activate the correct button
    const activeButton = document.querySelector(`.tab-btn[onclick="showTab('${tabId}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    currentTab = tabId;
    
    // Reset states when switching tabs
    if (tabId === 'qr-tab') {
        resetQRTab();
    } else if (tabId === 'code-tab') {
        resetCodeTab();
    }
}

function resetQRTab() {
    const qrContainer = document.getElementById('qrcode');
    const qrStatus = document.getElementById('qrStatus');
    const actionBtn = document.querySelector('#qr-tab .action-btn');
    
    qrContainer.innerHTML = `
        <div class="qr-placeholder" id="qrPlaceholder">
            <div style="font-size: 48px; margin-bottom: 15px;">📱</div>
            <div>QR code will appear here</div>
        </div>
    `;
    qrStatus.textContent = 'Click "Generate QR Code" to begin';
    qrStatus.style.color = '#666';
    actionBtn.textContent = '🔄 Generate QR Code';
    actionBtn.disabled = false;
}

function resetCodeTab() {
    const codeDisplay = document.getElementById('codeDisplay');
    const codeStatus = document.getElementById('codeStatus');
    const codeNumber = document.getElementById('codeNumber');
    const actionBtn = document.querySelector('#code-tab .action-btn');
    
    codeDisplay.textContent = '';
    codeStatus.textContent = 'Enter your number and click generate';
    codeStatus.style.color = '#666';
    codeNumber.value = '';
    actionBtn.textContent = '⚡ Get Pairing Code';
    actionBtn.disabled = false;
}

// ... rest of your existing functions (generateQR, generatePairingCode) ...    } finally {
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
