document.addEventListener('DOMContentLoaded', () => {
    const barcodeGeneratorArea = document.getElementById('barcode-generator-area');
    const addBarcodeBtn = document.getElementById('add-barcode-btn');
    const tecItBaseUrl = 'https://barcode.tec-it.com/barcode.ashx?code=Code128&translate-esc=on&data=';

    let entryCounter = 0; // Pour garantir des IDs uniques si besoin, bien que l'index de l'array suffise souvent pour la persistance.

    // Fonction pour sauvegarder toutes les entrées
    function saveEntries() {
        const entries = [];
        document.querySelectorAll('.barcode-entry').forEach(entryDiv => {
            const input = entryDiv.querySelector('input[type="text"]');
            const noteInput = entryDiv.querySelector('input[type="text"][placeholder="Note (optionnel)"]');
            if (input) {
                entries.push({
                    data: input.value,
                    note: noteInput ? noteInput.value : '' // Sauvegarde aussi la note
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
        entryDiv.id = `barcode-entry-${entryCounter}`; // ID unique pour l'élément DOM

        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group'); // Nouveau conteneur pour l'input et la note

        const dataInput = document.createElement('input');
        dataInput.type = 'text';
        dataInput.value = initialData;
        dataInput.placeholder = 'Données du code-barres';
        dataInput.setAttribute('aria-label', 'Données du code-barres');

        const noteInput = document.createElement('input'); // Nouveau champ pour la note
        noteInput.type = 'text';
        noteInput.value = initialNote;
        noteInput.placeholder = 'Note (optionnel)';
        noteInput.classList.add('note-input'); // Ajout d'une classe pour le style
        noteInput.setAttribute('aria-label', 'Note associée au code-barres');


        inputGroup.appendChild(dataInput);
        inputGroup.appendChild(noteInput);


        const imageContainer = document.createElement('div');
        imageContainer.classList.add('barcode-image-container');

        const img = document.createElement('img');
        img.alt = 'Barcode';
        img.src = tecItBaseUrl + encodeURIComponent(initialData || 'NO DATA'); // Affiche 'NO DATA' si vide

        imageContainer.appendChild(img);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '&times;'; // Caractère 'X'
        deleteBtn.title = 'Supprimer ce code-barres';
        deleteBtn.setAttribute('aria-label', 'Supprimer ce code-barres');

        // Événement pour mettre à jour le code-barres en temps réel (ou presque)
        let debounceTimer;
        dataInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const data = dataInput.value.trim();
                img.src = tecItBaseUrl + encodeURIComponent(data || 'NO DATA'); // Met à jour l'image
                saveEntries(); // Sauvegarde après chaque modification de données
            }, 300);
        });

        // Événement pour sauvegarder la note en temps réel
        noteInput.addEventListener('input', () => {
            clearTimeout(debounceTimer); // Utilise le même debounce pour la note
            debounceTimer = setTimeout(() => {
                saveEntries(); // Sauvegarde après chaque modification de note
            }, 300);
        });

        // Événement pour supprimer l'entrée
        deleteBtn.addEventListener('click', () => {
            entryDiv.remove();
            saveEntries(); // Sauvegarde après suppression
        });

        entryDiv.appendChild(inputGroup); // Ajoute le groupe d'inputs
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
                // Si aucune entrée n'est sauvegardée ou le tableau est vide, ajoute une entrée par défaut
                barcodeGeneratorArea.appendChild(createBarcodeEntry("Exemple123", ""));
            }
        } else {
            // Si aucune donnée n'existe encore dans LocalStorage, ajoute une entrée par défaut
            barcodeGeneratorArea.appendChild(createBarcodeEntry("Exemple123", ""));
        }
    }

    // Charger les entrées au démarrage
    loadEntries();

    // Événement pour le bouton "+"
    addBarcodeBtn.addEventListener('click', () => {
        const newEntry = createBarcodeEntry("", ""); // Nouvelle entrée vide
        barcodeGeneratorArea.appendChild(newEntry);
        // Focus sur le nouvel input de données pour une meilleure UX
        newEntry.querySelector('input[type="text"]:not(.note-input)').focus();
        saveEntries(); // Sauvegarde après l'ajout d'une nouvelle entrée
    });
});