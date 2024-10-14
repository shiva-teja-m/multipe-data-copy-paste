const textbox1 = document.getElementById('textbox1');
const textbox2 = document.getElementById('textbox2');
const fileInput = document.getElementById('fileInput');
const showDataButton = document.getElementById('showData');
const copiedDataDisplay = document.getElementById('copiedDataDisplay');

let copiedData = {};

// Function to detect Ctrl + Shift + Space
function isCtrlShiftSpace(event) {
    return event.ctrlKey && event.shiftKey && event.code === 'Space';
}

// Function to generate a summary of all copied data
function generateAllDataSummary() {
    let summary = '';
    for (const [key, value] of Object.entries(copiedData)) {
        summary += `\n[${key}] - ${value.type}:\n`;

        if (value.type === 'text') {
            summary += `${value.content}\n`;
        } else if (value.type === 'image') {
            value.content.forEach(file => {
                summary += `Image: ${file.fileName}\n`;
            });
        }
    }
    return summary;
}

// Function to save data to a user-defined file
function saveAllDataToFile() {
    const filename = prompt('Enter filename to save all data:');
    if (filename) {
        const data = generateAllDataSummary();
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Event listener for copying data from textbox1
textbox1.addEventListener('keydown', (e) => {
    if (isCtrlShiftSpace(e)) {
        e.preventDefault();
        const num = prompt('Enter number to save text:');

        if (num !== null && num.trim() !== "") {
            const trimmedNum = num.trim();
            if (copiedData[trimmedNum]) {
                alert(`Error: The number [${trimmedNum}] already exists. Use a different number.`);
            } else {
                copiedData[trimmedNum] = { type: 'text', content: textbox1.value };
                alert(`Text saved as [${trimmedNum}]`);
            }
        }
    }
});

// Event listener for pasting data into textbox2
textbox2.addEventListener('keydown', (e) => {
    if (isCtrlShiftSpace(e)) {
        e.preventDefault();
        const num = prompt('Enter number to paste data:');

        if (num !== null && num.trim() !== "") {
            const trimmedNum = num.trim();
            const data = copiedData[trimmedNum];

            if (data) {
                let pastedContent = '';

                if (data.type === 'text') {
                    pastedContent = data.content;
                    textbox2.value += pastedContent + '\n';
                } else if (data.type === 'image') {
                    data.content.forEach(file => {
                        const img = document.createElement('img');
                        img.src = file.fileData;
                        img.alt = `Image ${file.fileName}`;
                        img.style.maxWidth = '80px';
                        img.style.maxHeight = '80px';
                        textbox2.parentNode.insertBefore(img, textbox2.nextSibling);

                        // Add image filename to content for saving
                        pastedContent += `Image: ${file.fileName}\n`;
                    });
                }
                alert(`Data pasted from [${trimmedNum}]`);
            } else {
                alert(`No data found for [${trimmedNum}]`);
            }
        }
    }
});

// Handle file input and allow saving multiple images for each key
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    const num = prompt('Enter number to save these files:');

    if (num !== null && num.trim() !== "") {
        const trimmedNum = num.trim();
        if (!copiedData[trimmedNum]) {
            copiedData[trimmedNum] = { type: 'image', content: [] };
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                copiedData[trimmedNum].content.push({
                    fileName: file.name,
                    fileData: event.target.result
                });
                alert(`${file.name} saved under [${trimmedNum}]`);

                // Dynamically display image immediately
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = `Image ${file.name}`;
                img.style.maxWidth = '80px';
                img.style.maxHeight = '80px';
                copiedDataDisplay.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
});

// Show all copied data
showDataButton.addEventListener('click', () => {
    copiedDataDisplay.innerHTML = ''; // Clear previous content

    for (const [key, value] of Object.entries(copiedData)) {
        if (value.type === 'text') {
            copiedDataDisplay.innerHTML += `<div><strong>${key}:</strong> ${value.content}</div>`;
        } else if (value.type === 'image') {
            copiedDataDisplay.innerHTML += `<div><strong>${key}:</strong><br>`;
            value.content.forEach(file => {
                copiedDataDisplay.innerHTML += `<div><strong>File:</strong> ${file.fileName}<br>
                <img src="${file.fileData}" alt="Image ${file.fileName}" 
                style="max-width: 80px; max-height: 80px;" /></div>`;
            });
        }
    }
});

// Add a button to save all data to a file
const saveButton = document.createElement('button');
saveButton.textContent = 'Save All Data to File';
saveButton.addEventListener('click', saveAllDataToFile);
document.body.appendChild(saveButton);
