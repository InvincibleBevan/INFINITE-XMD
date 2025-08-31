function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showGenerator(type) {
    document.querySelectorAll('.generator-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.querySelector('.generator-options').classList.add('hidden');
    
    const generator = document.getElementById(`${type}-generator`);
    if (generator) {
        generator.classList.remove('hidden');
    }
}

function hideGenerators() {
    document.querySelectorAll('.generator-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.querySelector('.generator-options').classList.remove('hidden');
}

async function generateQR() {
    const qrStatus = document.getElementById('qrStatus');
    const qrContainer = document.getElementById('qrcode');
    
    qrStatus.textContent = 'Generating QR code...';
    
    try {
        const response = await fetch('/api/pair/qr');
        const data = await response.json();
        
        if (data.success) {
            qrContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.qr}`;
            img.alt = 'WhatsApp QR Code';
            img.style.width = '200px';
            img.style.height = '200px';
            qrContainer.appendChild(img);
            qrStatus.textContent = 'Scan this QR code with WhatsApp';
        } else {
            qrStatus.textContent = 'Error: ' + data.error;
        }
    } catch (error) {
        qrStatus.textContent = 'Failed to generate QR code';
    }
}

async function generatePairingCode() {
    const number = document.getElementById('codeNumber').value;
    const codeDisplay = document.getElementById('codeDisplay');
    const codeStatus = document.getElementById('codeStatus');
    
    if (!number) {
        codeStatus.textContent = 'Please enter a phone number';
        return;
    }
    
    codeStatus.textContent = 'Generating pairing code...';
    
    try {
        const response = await fetch(`/api/pair/code?number=${number}`);
        const data = await response.json();
        
        if (data.success) {
            codeDisplay.textContent = data.code;
            codeStatus.textContent = 'Use this code in WhatsApp';
        } else {
            codeStatus.textContent = 'Error: ' + data.error;
        }
    } catch (error) {
        codeStatus.textContent = 'Failed to generate pairing code';
    }
        }
