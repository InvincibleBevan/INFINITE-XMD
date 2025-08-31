// Smooth scrolling for navigation
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show/hide generators
function showGenerator(type) {
    // Hide all generator contents
    document.querySelectorAll('.generator-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Hide options
    document.querySelector('.generator-options').classList.add('hidden');
    
    // Show selected generator
    const generator = document.getElementById(`${type}-generator`);
    if (generator) {
        generator.classList.remove('hidden');
    }
}

function hideGenerators() {
    // Hide all generators
    document.querySelectorAll('.generator-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show options
    document.querySelector('.generator-options').classList.remove('hidden');
}

// INSTANT QR Code Generation
async function generateQR() {
    const qrStatus = document.getElementById('qrStatus');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const actionBtn = document.querySelector('#qr-generator .large-btn');
    const qrContainer = document.getElementById('qrcode');
    
    // Show loading state
    qrStatus.textContent = '🚀 Connecting to WhatsApp servers... (Instant!)';
    qrStatus.style.color = '#333';
    actionBtn.textContent = '⏳ Generating...';
    actionBtn.disabled = true;
    qrPlaceholder.classList.add('loading');
    qrContainer.innerHTML = '';
    
    try {
        const startTime = Date.now();
        const response = await fetch('/api/pair/qr');
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        const generationTime = (Date.now() - startTime) / 1000;
        
        if (data.success) {
            // Remove loading placeholder
            qrPlaceholder.style.display = 'none';
            
            // Display QR code INSTANTLY
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qr)}&margin=15&bgcolor=ffffff&color=667eea`;
            img.alt = 'WhatsApp QR Code';
            img.className = 'qr-image';
            img.style.border = 'none';
            img.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
            
            qrContainer.appendChild(img);
            qrStatus.innerHTML = `✅ QR generated in ${generationTime.toFixed(1)}s!<br>📱 Scan with WhatsApp → Linked Devices`;
            qrStatus.style.color = 'green';
            
        } else {
            qrStatus.textContent = '❌ Error: ' + (data.error || 'Failed to generate QR');
            qrStatus.style.color = 'red';
            qrPlaceholder.classList.remove('loading');
        }
    } catch (error) {
        qrStatus.innerHTML = '❌ Failed to generate QR code.<br>🔁 Please try again in a moment';
        qrStatus.style.color = 'red';
        qrPlaceholder.classList.remove('loading');
        console.error('QR Error:', error);
    } finally {
        // Reset button after a delay
        setTimeout(() => {
            actionBtn.textContent = '🔄 Generate QR Code';
            actionBtn.disabled = false;
        }, 2000);
    }
}

// Pairing Code Variables
let currentPairingCode = '';
let countdownInterval = null;
let autoCopyTimeout = null;

// Enhanced Pairing Code Generation
async function generatePairingCode() {
    const number = document.getElementById('codeNumber').value.trim();
    if (!number || !/^\d{10,15}$/.test(number)) {
        showStatus('❌ Please enter a valid WhatsApp number (10-15 digits)', 'error');
        return;
    }

    const copySection = document.getElementById('copySection');
    const statusElement = document.getElementById('codeStatus');
    const actionBtn = document.querySelector('#code-generator .large-btn');
    
    // Show loading state
    showStatus('🚀 Contacting WhatsApp servers... (Instant!)', 'loading');
    actionBtn.textContent = '⏳ Generating...';
    actionBtn.disabled = true;
    copySection.classList.add('hidden');
    
    // Clear any existing timers
    clearTimers();
    
    try {
        const startTime = Date.now();
        const response = await fetch(`/api/pair/code?number=${encodeURIComponent(number)}`);
        const data = await response.json();
        const generationTime = (Date.now() - startTime) / 1000;
        
        if (data.success) {
            currentPairingCode = data.code;
            
            // Show copy section
            document.getElementById('pairingCode').textContent = data.code;
            copySection.classList.remove('hidden');
            
            // Start countdown
            startCountdown(120); // 2 minutes
            
            // Auto-copy after 3 seconds
            startAutoCopyCountdown();
            
            showStatus(`✅ Pairing code generated in ${generationTime.toFixed(1)}s!`, 'success');
            
        } else {
            showStatus(`❌ Error: ${data.error || 'Failed to generate code'}`, 'error');
            if (data.tip) {
                showStatus(`💡 Tip: ${data.tip}`, 'error');
            }
        }
    } catch (error) {
        showStatus('❌ Network error. Please try again.', 'error');
        console.error('Pairing Code Error:', error);
    } finally {
        actionBtn.textContent = '⚡ Generate Pairing Code';
        actionBtn.disabled = false;
    }
}

// Copy to Clipboard Function
function copyToClipboard() {
    if (!currentPairingCode) return;
    
    navigator.clipboard.writeText(currentPairingCode).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.classList.add('copied');
        
        // Show confirmation message
        showStatus('✅ Copied to clipboard! Paste in WhatsApp now.', 'success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
        
    }).catch(err => {
        showStatus('❌ Failed to copy. Please copy manually.', 'error');
        
        // Fallback: Select text for manual copy
        const tempInput = document.createElement('input');
        tempInput.value = currentPairingCode;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
    });
}

// Countdown Timer
function startCountdown(seconds) {
    const countdownElement = document.getElementById('countdown');
    let timeLeft = seconds;
    
    // Update immediately
    updateCountdownDisplay(timeLeft);
    
    // Update main countdown
    countdownInterval = setInterval(() => {
        timeLeft--;
        updateCountdownDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            showStatus('⏰ Pairing code expired. Please generate a new one.', 'error');
            document.getElementById('copySection').classList.add('hidden');
        }
    }, 1000);
}

function updateCountdownDisplay(seconds) {
    const countdownElement = document.getElementById('countdown');
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    countdownElement.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    // Change color when under 30 seconds
    if (seconds < 30) {
        countdownElement.style.color = '#f56565';
        countdownElement.style.fontWeight = 'bold';
    }
}

// Auto-copy countdown
function startAutoCopyCountdown() {
    const autoCopyElement = document.getElementById('autoCopyCountdown');
    let timeLeft = 3;
    
    autoCopyElement.textContent = timeLeft;
    
    const interval = setInterval(() => {
        timeLeft--;
        autoCopyElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            copyToClipboard();
        }
    }, 1000);
}

// Show Status Message
function showStatus(message, type) {
    const statusElement = document.getElementById('codeStatus');
    statusElement.innerHTML = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.classList.remove('hidden');
}

// Clear all timers
function clearTimers() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (autoCopyTimeout) clearTimeout(autoCopyTimeout);
    countdownInterval = null;
    autoCopyTimeout = null;
}

// WhatsApp connection status check
async function checkWhatsAppConnection() {
    try {
        const response = await fetch('/api/pair/status');
        const status = await response.json();
        console.log('WhatsApp API Status:', status);
        return status.connected;
    } catch (error) {
        console.error('Status check failed:', error);
        return false;
    }
}

// Validate session
async function validateSession(sessionId) {
    try {
        const response = await fetch(`/api/pair/validate/${sessionId}`);
        return await response.json();
    } catch (error) {
        console.error('Session validation failed:', error);
        return { valid: false };
    }
}

// Emergency cleanup
async function emergencyCleanup() {
    try {
        const response = await fetch('/api/pair/cleanup', { method: 'POST' });
        const data = await response.json();
        console.log('Emergency cleanup:', data);
        return data;
    } catch (error) {
        console.error('Cleanup failed:', error);
        return { success: false };
    }
}

// Number formatting helper
function formatNumberInput(input) {
    // Remove any non-digit characters
    let numbers = input.value.replace(/\D/g, '');
    
    // Format with spaces for readability (254 712 345 678)
    if (numbers.length > 3) {
        numbers = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4');
    }
    
    input.value = numbers;
}

// Input validation
function validateNumberInput(input) {
    const numbers = input.value.replace(/\D/g, '');
    const isValid = numbers.length >= 10 && numbers.length <= 15;
    
    if (!isValid) {
        input.style.borderColor = '#f56565';
    } else {
        input.style.borderColor = '#48bb78';
    }
    
    return isValid;
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 INFINITE-XMD Website Loaded');
    
    // Add smooth scrolling to all nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add input formatting to phone number field
    const numberInput = document.getElementById('codeNumber');
    if (numberInput) {
        numberInput.addEventListener('input', function() {
            formatNumberInput(this);
            validateNumberInput(this);
        });
        
        numberInput.addEventListener('blur', function() {
            validateNumberInput(this);
        });
    }
    
    // Check WhatsApp connection status
    setTimeout(() => {
        checkWhatsAppConnection().then(connected => {
            if (connected) {
                console.log('✅ WhatsApp API is connected and ready');
                showStatus('✅ WhatsApp API connected and ready', 'success');
            } else {
                console.log('⚠️ WhatsApp API connection may be slow');
                showStatus('⚠️ Connecting to WhatsApp API...', 'loading');
            }
        });
    }, 1000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+1 for QR code
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            showGenerator('qr');
        }
        // Ctrl+2 for pairing code
        else if (e.ctrlKey && e.key === '2') {
            e.preventDefault();
            showGenerator('code');
        }
        // Enter to generate when in input field
        else if (e.key === 'Enter' && document.activeElement.id === 'codeNumber') {
            e.preventDefault();
            generatePairingCode();
        }
    });
    
    // Cleanup when leaving the page
    window.addEventListener('beforeunload', clearTimers);
    
    // Periodic connection check every 30 seconds
    setInterval(() => {
        checkWhatsAppConnection().then(connected => {
            if (!connected) {
                console.log('🔄 Rechecking WhatsApp connection...');
            }
        });
    }, 30000);
});

// Export functions for global access (if needed)
window.INFINITE_XMD = {
    generateQR,
    generatePairingCode,
    copyToClipboard,
    checkWhatsAppConnection,
    validateSession,
    emergencyCleanup,
    showGenerator,
    hideGenerators
};
