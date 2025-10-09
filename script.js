document.addEventListener('DOMContentLoaded', () => {
    const barcodeGeneratorArea = document.getElementById('barcode-generator-area');
    const addBarcodeBtn = document.getElementById('add-barcode-btn');
    let entryCounter = 0;

    // Fonction pour sauvegarder toutes les entrées
    function saveEntries() {
        const entries = [];
        document.querySelectorAll('.barcode-entry').forEach(entryDiv => {
            const input = entryDiv.querySelector('input[type="text"]:not(.note-input)');
            const noteInput = entryDiv.querySelector('.note-input');
            if (input) {
                entries.push({
                    data: input.value,
                    note: noteInput ? noteInput.value : ''
                });
            }
        });
        localStorage.setItem('barcodeEntries', JSON.stringify(entries));
    }

    // Fonction pour créer une nouvelle entrée de code-barres
    function createBarcodeEntry(initialData = "", initialNote = "") {
        entryCounter++;
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('barcode-entry');
        entryDiv.id = `barcode-entry-${entryCounter}`;

        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');

        const dataInput = document.createElement('input');
        dataInput.type = 'text';
        dataInput.value = initialData;
        dataInput.placeholder = 'Données du code-barres';
        dataInput.setAttribute('aria-label', 'Données du code-barres');

        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.value = initialNote;
        noteInput.placeholder = 'Note (optionnel)';
        noteInput.classList.add('note-input');
        noteInput.setAttribute('aria-label', 'Note associée au code-barres');

        inputGroup.appendChild(dataInput);
        inputGroup.appendChild(noteInput);

        const imageContainer = document.createElement('div');
        imageContainer.classList.add('barcode-image-container');

        // Créez un élément SVG pour le code-barres
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = `barcode-svg-${entryCounter}`;

        // Générez le code-barres avec JsBarcode
        JsBarcode(svg, initialData || 'NO DATA', {
            format: "CODE128",
            displayValue: true,
            fontSize: 14,
            margin: 5,
            width: 2,
            height: 50
        });

        imageContainer.appendChild(svg);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Supprimer ce code-barres';
        deleteBtn.setAttribute('aria-label', 'Supprimer ce code-barres');

        // Événement pour mettre à jour le code-barres en temps réel
        let debounceTimer;
        dataInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const data = dataInput.value.trim();
                JsBarcode(svg, data || 'NO DATA', {
                    format: "CODE128",
                    displayValue: true,
                    fontSize: 14,
                    margin: 5,
                    width: 2,
                    height: 50
                });
                saveEntries();
            }, 300);
        });

        // Événement pour sauvegarder la note en temps réel
        noteInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                saveEntries();
            }, 300);
        });

        // Événement pour supprimer l'entrée
        deleteBtn.addEventListener('click', () => {
            entryDiv.remove();
            saveEntries();
        });

        entryDiv.appendChild(inputGroup);
        entryDiv.appendChild(imageContainer);
        entryDiv.appendChild(deleteBtn);

        return entryDiv;
    }

    // Fonction pour charger les entrées sauvegardées
    function loadEntries() {
        const savedEntries = localStorage.getItem('barcodeEntries');
        if (savedEntries) {
            const entries = JSON.parse(savedEntries);
            if (entries.length > 0) {
                entries.forEach(entry => {
                    const newEntry = createBarcodeEntry(entry.data, entry.note);
                    barcodeGeneratorArea.appendChild(newEntry);
                });
            } else {
                barcodeGeneratorArea.appendChild(createBarcodeEntry("Exemple123", ""));
            }
        } else {
            barcodeGeneratorArea.appendChild(createBarcodeEntry("Exemple123", ""));
        }
    }

    // Charger les entrées au démarrage
    loadEntries();

    // Événement pour le bouton "+"
    addBarcodeBtn.addEventListener('click', () => {
        const newEntry = createBarcodeEntry("", "");
        barcodeGeneratorArea.appendChild(newEntry);
        newEntry.querySelector('input[type="text"]:not(.note-input)').focus();
        saveEntries();
    });
});
