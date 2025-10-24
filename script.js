let entryCounter = 0;
let pinnedBarcodeId = null;

function saveData() {
    const entries = [];
    document.querySelectorAll('.barcode-card').forEach(card => {
        const id = card.dataset.id;
        const dataInput = card.querySelector('.data-input');
        const noteInput = card.querySelector('.note-input');
        entries.push({
            id: id,
            data: dataInput.value,
            note: noteInput.value,
            isPinned: id === pinnedBarcodeId
        });
    });

    const data = {
        entries: entries,
        pinnedId: pinnedBarcodeId
    };

    // Stockage en mémoire (remplacer par localStorage si nécessaire)
    window.barcodeData = data;
}

function loadData() {
    const data = window.barcodeData;

    if (data && data.entries && data.entries.length > 0) {
        data.entries.forEach(entry => {
            createBarcodeCard(entry.data, entry.note, entry.id);
        });
        if (data.pinnedId) {
            pinnedBarcodeId = data.pinnedId;
            updatePinnedBadge();
            hideCardFromList(data.pinnedId);
        }
    } else {
        createBarcodeCard('EXEMPLE123', 'Mon badge');
    }
    updateEmptyState();
}

function createBarcodeCard(data = '', note = '', id = null) {
    entryCounter++;
    const cardId = id || `card-${entryCounter}`;

    const card = document.createElement('div');
    card.className = 'barcode-card';
    card.dataset.id = cardId;

    card.innerHTML = `
        <div class="card-header">
            <div class="card-actions">
                <button class="action-btn pin-btn" title="Épingler">📌</button>
                <button class="action-btn delete-btn" title="Supprimer">✕</button>
            </div>
        </div>
        <div class="input-group">
            <input type="text" class="data-input" value="${data}" placeholder="Données du code-barres">
            <input type="text" class="note-input" value="${note}" placeholder="Note (optionnel)">
        </div>
        <div class="barcode-display">
            <svg class="barcode-svg"></svg>
        </div>
    `;

    const dataInput = card.querySelector('.data-input');
    const noteInput = card.querySelector('.note-input');
    const svg = card.querySelector('.barcode-svg');
    const pinBtn = card.querySelector('.pin-btn');
    const deleteBtn = card.querySelector('.delete-btn');

    function updateBarcode() {
        const barcodeData = dataInput.value.trim() || 'NO DATA';
        try {
            JsBarcode(svg, barcodeData, {
                format: "CODE128",
                displayValue: true,
                fontSize: 14,
                margin: 8,
                width: 2,
                height: 50
            });
        } catch (e) {
            console.error('Erreur génération code-barres:', e);
        }

        if (cardId === pinnedBarcodeId) {
            updatePinnedBadge();
        }
    }

    updateBarcode();

    let debounceTimer;
    dataInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateBarcode();
            saveData();
        }, 300);
    });

    noteInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (cardId === pinnedBarcodeId) {
                updatePinnedBadge();
            }
            saveData();
        }, 300);
    });

    pinBtn.addEventListener('click', () => {
        if (pinnedBarcodeId === cardId) {
            // Désépingler
            pinnedBarcodeId = null;
            updatePinnedBadge();
            showCardInList(cardId);
        } else {
            // Afficher l'ancien code-barres épinglé dans la liste
            if (pinnedBarcodeId) {
                showCardInList(pinnedBarcodeId);
            }
            // Épingler le nouveau
            pinnedBarcodeId = cardId;
            updatePinnedBadge();
            hideCardFromList(cardId);
        }
        saveData();
    });

    deleteBtn.addEventListener('click', () => {
        if (cardId === pinnedBarcodeId) {
            pinnedBarcodeId = null;
            updatePinnedBadge();
        }
        card.remove();
        saveData();
        updateEmptyState();
    });

    document.getElementById('barcodes-grid').appendChild(card);
    return card;
}

function hideCardFromList(cardId) {
    const card = document.querySelector(`[data-id="${cardId}"]`);
    if (card) {
        card.classList.add('hidden');
        updateEmptyState();
    }
}

function showCardInList(cardId) {
    const card = document.querySelector(`[data-id="${cardId}"]`);
    if (card) {
        card.classList.remove('hidden');
        updateEmptyState();
    }
}

function updatePinnedBadge() {
    const pinnedBadge = document.getElementById('pinned-badge');
    const pinnedSvg = document.getElementById('pinned-barcode-svg');
    const pinnedNote = document.getElementById('pinned-note');

    if (!pinnedBarcodeId) {
        pinnedBadge.classList.add('hidden');
        return;
    }

    const card = document.querySelector(`[data-id="${pinnedBarcodeId}"]`);
    if (!card) {
        pinnedBarcodeId = null;
        pinnedBadge.classList.add('hidden');
        return;
    }

    const dataInput = card.querySelector('.data-input');
    const noteInput = card.querySelector('.note-input');

    const barcodeData = dataInput.value.trim() || 'NO DATA';
    try {
        JsBarcode(pinnedSvg, barcodeData, {
            format: "CODE128",
            displayValue: true,
            fontSize: 16,
            margin: 10,
            width: 2.2,
            height: 60
        });
    } catch (e) {
        console.error('Erreur génération code-barres épinglé:', e);
    }

    pinnedNote.textContent = noteInput.value || 'Badge';
    pinnedBadge.classList.remove('hidden');
}

function updateEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const grid = document.getElementById('barcodes-grid');
    const visibleCards = grid.querySelectorAll('.barcode-card:not(.hidden)');

    if (visibleCards.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    document.getElementById('add-btn').addEventListener('click', () => {
        const card = createBarcodeCard();
        card.querySelector('.data-input').focus();
        saveData();
        updateEmptyState();
    });

    document.getElementById('unpin-btn').addEventListener('click', () => {
        const oldPinnedId = pinnedBarcodeId;
        pinnedBarcodeId = null;
        updatePinnedBadge();
        if (oldPinnedId) {
            showCardInList(oldPinnedId);
        }
        saveData();
    });
});