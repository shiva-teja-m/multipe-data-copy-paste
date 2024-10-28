const textbox1 = document.getElementById('textbox1');
const textbox2 = document.getElementById('textbox2');
const fileInput = document.getElementById('fileInput');
const showDataButton = document.getElementById('showData');
const copiedDataDisplay = document.getElementById('copiedDataDisplay');

let copiedData = {}; // Store text and files

// Function to detect Ctrl + Shift + Space
function isCtrlShiftSpace(event) {
    return event.ctrlKey && event.shiftKey && event.code === 'Space';
}

// Handle copying text
textbox1.addEventListener('keydown', (e) => {
    if (isCtrlShiftSpace(e)) {
        e.preventDefault();
        const num = prompt('Enter number to save text:');

        if (num && num.trim()) {
            const key = num.trim();
            if (copiedData[key]) {
                alert(`Error: The number [${key}] already exists.`);
            } else {
                copiedData[key] = { type: 'text', content: textbox1.value };
                alert(`Text saved as [${key}]`);
            }
        }
    }
});

// Handle pasting data
textbox2.addEventListener('keydown', (e) => {
    if (isCtrlShiftSpace(e)) {
        e.preventDefault();
        const num = prompt('Enter number to paste data:');
        
        if (num && num.trim()) {
            const key = num.trim();
            const data = copiedData[key];

            if (data) {
                if (data.type === 'text') {
                    textbox2.value += data.content + '\n';
                } else if (data.type === 'file') {
                    data.content.forEach(file => {
                        const img = document.createElement('img');
                        img.src = file.fileData;
                        img.alt = `Image ${file.fileName}`;
                        img.style.maxWidth = '80px';
                        img.style.maxHeight = '80px';
                        textbox2.parentNode.insertBefore(img, textbox2.nextSibling);
                    });
                }
                alert(`Data pasted from [${key}]`);
            } else {
                alert(`No data found for [${key}]`);
            }
        }
    }
});

// Handle file input
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    const num = prompt('Enter number to save these files:');

    if (num && num.trim()) {
        const key = num.trim();
        if (!copiedData[key]) {
            copiedData[key] = { type: 'file', content: [] };
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                copiedData[key].content.push({
                    fileName: file.name,
                    fileData: event.target.result
                });
                alert(`${file.name} saved under [${key}]`);
            };
            reader.readAsDataURL(file);
        });
    }
});

// Save all data to a ZIP file
function saveAllDataToFile() {
    const zip = new JSZip();

    // Add text and files to the ZIP
    for (const [key, value] of Object.entries(copiedData)) {
        if (value.type === 'text') {
            zip.file(`${key}.txt`, value.content);
        } else if (value.type === 'file') {
            value.content.forEach(file => {
                const base64Data = file.fileData.split(',')[1]; // Remove Data URI prefix
                zip.file(file.fileName, base64Data, { base64: true });
            });
        }
    }

    // Generate and download the ZIP
    zip.generateAsync({ type: 'blob' })
        .then(blob => {
            const filename = prompt('Enter filename to save:');
            if (filename) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${filename}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
            }
        })
        .catch(error => {
            console.error('Error generating ZIP:', error);
            alert('Failed to save data. Check console for details.');
        });
}

// Add Save Button
const saveButton = document.createElement('button');
saveButton.textContent = 'Save All Data to ZIP';
saveButton.addEventListener('click', saveAllDataToFile);
document.body.appendChild(saveButton);

// Show all copied data
showDataButton.addEventListener('click', () => {
    copiedDataDisplay.innerHTML = ''; // Clear previous content

    for (const [key, value] of Object.entries(copiedData)) {
        copiedDataDisplay.innerHTML += `<div><strong>${key}:</strong> ${value.type}</div>`;
    }
});
