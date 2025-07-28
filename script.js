let playerCount = 0
let imposter = 0

function startGame() {
    playerCount = document.getElementById('playerCount').value;
    
    if (playerCount >= 3 && playerCount <= 20) {
        window.open("game.html?players=" + playerCount, "_self")
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

// This runs when the game page loads
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    gamePlayerCount = parseInt(urlParams.get('players'));
    
    // Generate random imposter (1 to playerCount)
    gameImposter = Math.floor(Math.random() * gamePlayerCount) + 1;
    
    // Load the game data
    loadGameData();
    
    console.log("Game started with " + gamePlayerCount + " players");
    console.log("Imposter is player " + gameImposter); // Only visible in browser console
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
    } catch (error) {
        console.error("Error loading game data:", error);
        alert("Error loading game data. Please refresh the page.");
    }
}

function reveal() {
    if (currentPlayer <= gamePlayerCount && selectedCategory && selectedItem) {
        // Check if current player is the imposter
        if (currentPlayer === gameImposter) {
            alert("Player " + currentPlayer + ": You are THE IMPOSTER!\n\nCategory: " + selectedCategory + "\n\nYou don't know the specific item - try to blend in!");
        } else {
            alert("Player " + currentPlayer + ": You are a CREWMATE!\n\nCategory: " + selectedCategory + "\nItem: " + selectedItem);
        }
        
        currentPlayer++;
        
        // Update button text
        const revealButton = document.querySelector('button[onClick="reveal()"]');
        if (currentPlayer <= gamePlayerCount) {
            revealButton.textContent = "Pass to Player " + currentPlayer;
        } else {
            revealButton.textContent = "All roles revealed!";
            revealButton.disabled = true;
        }
    } else if (!selectedCategory || !selectedItem) {
        alert("Game data is still loading. Please wait a moment and try again.");
    }
}

