document.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const imageSelection = document.getElementById('imageSelection');
    const imageSelectionError = document.getElementById('imageSelectionError');
    const generateGameBtn = document.getElementById('generateGameBtn');
    const gameLinks = document.getElementById('gameLinks');
    const linksList = document.getElementById('linksList');
    const restartSetupBtn = document.getElementById('restartSetupBtn');
    
    // --- НОВЫЕ ЭЛЕМЕНТЫ ДЛЯ ИНСТРУКЦИЙ ---
    const gameInstructionsInput = document.getElementById('gameInstructions');
    const instructionArea = document.getElementById('instructionArea');
    const instructionText = document.getElementById('instructionText');

    // Fixed to 2 players
    const numPlayersInGame = 2; 

    const opponentCardImage = document.getElementById('opponentCardImage');
    const myCardQuestion = document.getElementById('myCardQuestion');
    const myCardActualImage = document.getElementById('myCardActualImage');

    // Available images
    const availableImages = [
        'card_zyxw8.png',
        'card_vuts7.png',
        'card_rqpo6.png',
        'card_mlkj5.png',
        'card_ihgf4.png',
        'card_edcb3.png'
    ];

    // Populate image selection checkboxes
    availableImages.forEach(imageName => {
        const imageOptionDiv = document.createElement('div');
        imageOptionDiv.classList.add('image-option');
        imageOptionDiv.innerHTML = `
            <input type="checkbox" id="img-${imageName}" value="${imageName}">
            <label for="img-${imageName}">
                <img src="${imageName}" alt="${imageName.split('.')[0]}">
            </label>
        `;
        imageSelection.appendChild(imageOptionDiv);

        const checkbox = imageOptionDiv.querySelector('input[type="checkbox"]');
        imageOptionDiv.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            imageOptionDiv.classList.toggle('selected', checkbox.checked);
            validateSelection();
        });
        checkbox.addEventListener('change', () => {
             imageOptionDiv.classList.toggle('selected', checkbox.checked);
             validateSelection();
        });
    });

    // --- Validation Logic (Enable/Disable Generate button) ---
    function validateSelection() {
        const selectedImages = Array.from(document.querySelectorAll('#imageSelection input[type="checkbox"]:checked')).map(cb => cb.value);
        const requiredImages = numPlayersInGame;

        if (selectedImages.length >= requiredImages) {
            generateGameBtn.disabled = false;
            imageSelectionError.style.display = 'none';
        } else {
            generateGameBtn.disabled = true;
            imageSelectionError.textContent = `Please select at least ${requiredImages} images to start the game.`;
            imageSelectionError.style.display = 'block';
        }
    }


    // --- URL Parameters Check on Load ---
    const urlParams = new URLSearchParams(window.location.search);
    const myCardFromUrl = urlParams.get('myCard');
    const opponentCardFromUrl = urlParams.get('opponentCard');
    
    // --- ЧТЕНИЕ ИНСТРУКЦИЙ ИЗ URL ---
    const instructionsFromUrl = urlParams.get('instructions');

    if (myCardFromUrl && opponentCardFromUrl) {
        setupScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        
        // Показываем инструкции, если они есть
        if (instructionsFromUrl) {
            instructionArea.style.display = 'block';
            instructionText.innerText = instructionsFromUrl;
        }

        opponentCardImage.src = opponentCardFromUrl;
        opponentCardImage.alt = "Opponent's card: " + opponentCardFromUrl;
        myCardActualImage.src = myCardFromUrl; // Still setting src for potential future reveal mechanism
        myCardActualImage.alt = "Your card: " + myCardFromUrl;
    } else {
        setupScreen.style.display = 'block';
        gameScreen.style.display = 'none';
    }

    // --- Event listener for "Generate Game" button ---
    generateGameBtn.addEventListener('click', () => {
        const selectedImages = Array.from(document.querySelectorAll('#imageSelection input[type="checkbox"]:checked')).map(cb => cb.value);

        if (selectedImages.length < numPlayersInGame) {
             alert(`Please select at least ${numPlayersInGame} images to start the game.`);
             return;
        }

        // Получаем текст инструкций
        const instructionsVal = gameInstructionsInput.value.trim();

        const shuffledImages = selectedImages.sort(() => Math.random() - 0.5);

        linksList.innerHTML = ''; // Clear previous links

        const baseUrl = window.location.origin + window.location.pathname;

        for (let i = 0; i < numPlayersInGame; i++) {
            const playerType = `Player ${i + 1}`;

            const myCard = shuffledImages[i];
            const opponentCardIndex = (i + 1) % numPlayersInGame;
            const opponentCard = shuffledImages[opponentCardIndex];

            // Формируем базовый URL
            let playerGameUrl = `${baseUrl}?myCard=${encodeURIComponent(myCard)}&opponentCard=${encodeURIComponent(opponentCard)}`;
            
            // Если есть инструкции, добавляем их в URL
            if (instructionsVal) {
                playerGameUrl += `&instructions=${encodeURIComponent(instructionsVal)}`;
            }

            const linkItemDiv = document.createElement('div');
            linkItemDiv.classList.add('link-item');
            linkItemDiv.innerHTML = `
                <strong>${playerType}:</strong>
                <div class="link-wrapper">
                    <a href="${playerGameUrl}" target="_blank">${playerGameUrl}</a>
                    <button class="copy-button" data-link="${playerGameUrl}">Copy</button>
                </div>
            `;
            linksList.appendChild(linkItemDiv);
        }

        gameLinks.style.display = 'block';

        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', (e) => {
                copyToClipboard(e.target.dataset.link, e.target);
            });
        });
    });

    // --- Only Start Over button on setup screen ---
    restartSetupBtn.addEventListener('click', () => {
        window.location.href = window.location.origin + window.location.pathname;
    });

    // --- Utility Function: Copy to Clipboard ---
    function copyToClipboard(text, buttonElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = 'Copied!';
            setTimeout(() => {
                buttonElement.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Error copying link. Please copy manually.');
        });
    }

    // Initial validation check
    validateSelection();
    console.log("Guess Who I Am: Game Loaded!");
});
