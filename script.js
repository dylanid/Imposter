let playerCount = 0
let imposter = 0

function createPlayerInputs() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const playerInputs = document.getElementById('playerInputs');
    const startButton = document.getElementById('startButton');
    
    if (playerCount >= 3 && playerCount <= 20) {
        playerInputs.innerHTML = '';
        
        for (let i = 1; i <= playerCount; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input';
            playerDiv.innerHTML = `
                <div class="player-number">${i}</div>
                <input type="text" id="player${i}" placeholder="Player ${i} name" required>
            `;
            playerInputs.appendChild(playerDiv);
        }
        
        startButton.disabled = false;
    } else {
        playerInputs.innerHTML = '';
        startButton.disabled = true;
    }
}

function startGame() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    
    if (playerCount >= 3 && playerCount <= 20) {
        // Collect player names
        const playerNames = [];
        for (let i = 1; i <= playerCount; i++) {
            const name = document.getElementById(`player${i}`).value.trim();
            if (name === '') {
                alert(`Please enter a name for Player ${i}`);
                return;
            }
            playerNames.push(name);
        }
        
        // Pass player names to the game page
        const namesParam = encodeURIComponent(JSON.stringify(playerNames));
        window.open("game.html?players=" + playerCount + "&names=" + namesParam, "_self");
    } else {
        alert("Please enter a number between 3 and 20");
    }
}

// Global variables for the game
let gamePlayerCount = 0;
let gameImposter = 0;
let currentPlayer = 1;
let gameData = null;
let selectedCategory = null;
let selectedItem = null;
let playerNames = [];

// This runs when the game page loads
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    gamePlayerCount = parseInt(urlParams.get('players'));
    
    // Get player names from URL
    const namesParam = urlParams.get('names');
    if (namesParam) {
        playerNames = JSON.parse(decodeURIComponent(namesParam));
    }
    
    // Generate random imposter (1 to playerCount)
    gameImposter = Math.floor(Math.random() * gamePlayerCount) + 1;
    
    // Load the game data
    loadGameData();
    
    // Update the initial message
    updatePlayerMessage();
    
    // Load the game data and show category display
    loadGameData();
    
    console.log("Game started with " + gamePlayerCount + " players");
    console.log("Imposter is player " + gameImposter); // Only visible in browser console
}

function updatePlayerMessage() {
    const playerInfo = document.getElementById('playerInfo');
    if (playerNames.length > 0) {
        const currentPlayerName = playerNames[currentPlayer - 1];
        playerInfo.innerHTML = `
            <strong>Step ${currentPlayer} of ${gamePlayerCount}</strong><br><br>
            Pass the device to <strong>${currentPlayerName}</strong><br><br>
            When ${currentPlayerName} is ready, click "Reveal" to see their role.
        `;
    } else {
        playerInfo.innerHTML = `
            <strong>Step ${currentPlayer} of ${gamePlayerCount}</strong><br><br>
            Pass the device to <strong>Player ${currentPlayer}</strong><br><br>
            When Player ${currentPlayer} is ready, click "Reveal" to see their role.
        `;
    }
}

// Load the data from data.json
async function loadGameData() {
    try {
        const response = await fetch('data.json');
        gameData = await response.json();
        
        // Get all category names
        const categories = Object.keys(gameData);
        
        // Select a random category
        const randomCategoryName = categories[Math.floor(Math.random() * categories.length)];
        selectedCategory = randomCategoryName;
        
        // Get items for the selected category
        const items = gameData[randomCategoryName];
        
        // Select a random item from that category
        selectedItem = items[Math.floor(Math.random() * items.length)];
        
        console.log("Category: " + selectedCategory);
        console.log("Item: " + selectedItem);
        
        // Show the category display after data is loaded
        showCategoryDisplay();
        
        return true; // Return a promise-like value
    } catch (error) {
        console.error("Error loading game data:", error);
        alert("Error loading game data. Please refresh the page.");
        return false;
    }
}

function showCategoryDisplay() {
    if (selectedCategory) {
        const categoryDisplay = document.getElementById('categoryDisplay');
        const categoryName = document.getElementById('categoryName');
        
        categoryDisplay.style.display = 'block';
        categoryName.textContent = selectedCategory;
    }
}

function reveal() {
    if (currentPlayer <= gamePlayerCount && selectedCategory && selectedItem) {
        const currentPlayerName = playerNames.length > 0 ? playerNames[currentPlayer - 1] : `Player ${currentPlayer}`;
        
        // Check if current player is the imposter
        if (currentPlayer === gameImposter) {
            alert(`${currentPlayerName}, you are THE IMPOSTER!\n\nCategory: ${selectedCategory}\n\nYou don't know the specific item - try to blend in!\n\nClick Close when you're ready to pass the device.`);
        } else {
            alert(`${currentPlayerName}, you are a PLAYER!\n\nCategory: ${selectedCategory}\nItem: ${selectedItem}\n\nRemember this information!\n\nClick Close when you're ready to pass the device.`);
        }
        
        currentPlayer++;
        
        // Update the message and button
        updatePlayerMessage();
        
        const revealButton = document.querySelector('button[onClick="reveal()"]');
        if (currentPlayer <= gamePlayerCount) {
            const nextPlayerName = playerNames.length > 0 ? playerNames[currentPlayer - 1] : `Player ${currentPlayer}`;
        } else {
            revealButton.textContent = "All roles revealed!";
            revealButton.disabled = true;
            
            // Update final message
            const playerInfo = document.getElementById('playerInfo');
            playerInfo.innerHTML = `
                <strong>🎉 All roles have been revealed!</strong><br><br>
                <strong>Game Setup Complete</strong><br><br>
                Now discuss with your group and try to identify the imposter!<br><br>
                <em>Remember: Players know the category AND item. The imposter only knows the category.</em>
            `;
        }
    } else if (!selectedCategory || !selectedItem) {
        alert("Game data is still loading. Please wait a moment and try again.");
    }
}

