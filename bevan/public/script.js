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

// Generate QR Code
async function generateQR() {
    const qrStatus = document.getElementById('qrStatus');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const actionBtn = document.querySelector('#qr-generator .large-btn');
    
    // Show loading state
    qrStatus.textContent = 'Connecting to WhatsApp servers... (5-10 seconds)';
    qrStatus.style.color = '#333';
    actionBtn.textContent = '⏳ Generating...';
    actionBtn.disabled = true;
    qrPlaceholder.classList.add('loading');
    
    try {
        const response = await fetch('/api/pair/qr');
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
            qrStatus.textContent = '✅ QR code generated! Scan with WhatsApp → Linked Devices';
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
        actionBtn.textContent = '🔄 Generate QR Code';
        actionBtn.disabled = false;
        qrPlaceholder.classList.remove('loading');
    }
}

// Generate Pairing Code
async function generatePairingCode() {
    const number = document.getElementById('codeNumber').value.trim();
    if (!number || !/^\d{10,15}$/.test(number)) {
        alert('Please enter a valid WhatsApp number (10-15 digits). Include country code without + (e.g., 254712345678)');
        return;
    }

    const codeDisplay = document.getElementById('codeDisplay');
    const codeStatus = document.getElementById('codeStatus');
    const actionBtn = document.querySelector('#code-generator .large-btn');
    
    codeStatus.innerHTML = '🔄 Contacting WhatsApp servers... (10-20 seconds)';
    codeStatus.style.color = '#333';
    codeDisplay.textContent = '';
    actionBtn.textContent = '⏳ Generating...';
    actionBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/pair/code?number=${encodeURIComponent(number)}`);
        const data = await response.json();
        
        if (data.success) {
            codeDisplay.textContent = data.code;
            codeStatus.innerHTML = '✅ Pairing code generated! Use it in WhatsApp → Linked Devices → Link with pairing code';
            codeStatus.style.color = 'green';
            
        } else {
            codeStatus.innerHTML = `❌ Error: ${data.error || 'Failed to generate code'}<br>💡 Tip: ${data.tip || 'Try using full number with country code'}`;
            codeStatus.style.color = 'red';
        }
    } catch (error) {
        codeStatus.innerHTML = '❌ Failed to generate pairing code. Please try again.';
        codeStatus.style.color = 'red';
        console.error('Pairing Code Error:', error);
    } finally {
        actionBtn.textContent = '⚡ Generate Pairing Code';
        actionBtn.disabled = false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('INFINITE-XMD Website Loaded');
    
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
});
