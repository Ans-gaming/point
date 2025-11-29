document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'tournamentDataGroups';
    
    // 1. INITIAL DATA STORE (Defaults used only if nothing is in Local Storage)
    let groupDataDefaults = {
        A: [
            // --- NEW TEAM NAMES FOR GROUP A ---
            { name: "GAMING MACHA", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "KRACK GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "ALIAN FF", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "DARK HUNTER", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "LOVEGURU GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "NIGHT HUNTERS", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "SKY SHOOTERS", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "ANS GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "SMARTY BOY", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 }
        ],
        B: [
            // --- NEW TEAM NAMES FOR GROUP B ---
            { name: "TEAM SOUL", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "OP ABHIRAM", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "BLACK 777", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "VIP GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "MRAK", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "RED MAX", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "STAY MAX", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "VINAY GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "BLUE DEVIL", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 }
        ]
    };

    let groupData; 

    // MAPPING & CONSTANTS
    const ROUNDS_MAPPING = { 
        0: 10, 1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3
    };
    const POINTS_PER_WIN = 4;

    // --- Local Storage Functions ---

    function loadData() {
        // *** MODIFIED LOGIC: We force a clean start by overriding any old stored data with the new defaults. ***
        // This ensures the new team names and zero scores are loaded immediately and old data is cleared.
        groupData = groupDataDefaults;
        saveData(); // Overwrite old data with clean defaults immediately.
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData));
    }

    // --- Core Functions ---

    // 2. RENDERING FUNCTION
    function renderTable(groupKey) {
        const teamData = groupData[groupKey];
        const tableBody = document.querySelector(`#pointTable${groupKey} tbody`);

        teamData.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return b.roundsPoints - a.roundsPoints;
        });

        tableBody.innerHTML = ''; 
        teamData.forEach(team => {
            const matchesPlayed = team.won + team.lost;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team.name}</td>
                <td>${matchesPlayed}</td>
                <td>${team.won}</td>
                <td>${team.lost}</td>
                <td>${team.roundsPoints}</td>
                <td>${team.totalPoints}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 3. DROPDOWN POPULATION & FILTERING
    
    function populateTeamSelects(groupKey) {
        const winningSelect = document.getElementById(`winningTeam${groupKey}`);
        const losingSelect = document.getElementById(`losingTeam${groupKey}`);
        const teamNames = groupData[groupKey].map(t => t.name);

        const createOptions = (selectElement, initialText) => {
            selectElement.innerHTML = `<option value="" disabled selected>${initialText}</option>`;
            teamNames.forEach(name => {
                selectElement.appendChild(new Option(name, name));
            });
        };
        
        createOptions(winningSelect, 'Select Winner');
        createOptions(losingSelect, 'Select Loser');
        
        filterLoserSelect(groupKey);
    }

    function filterLoserSelect(groupKey) {
        const winningSelect = document.getElementById(`winningTeam${groupKey}`);
        const losingSelect = document.getElementById(`losingTeam${groupKey}`);
        const selectedWinner = winningSelect.value;
        const currentLoser = losingSelect.value;
        
        const teamNames = groupData[groupKey].map(t => t.name);
        
        losingSelect.innerHTML = '<option value="" disabled selected>Select Loser</option>';
        
        teamNames.forEach(name => {
            if (name !== selectedWinner) {
                const option = new Option(name, name);
                losingSelect.appendChild(option);
            }
        });

        if (currentLoser && currentLoser !== selectedWinner) {
            losingSelect.value = currentLoser;
        }
    }


    // 4. SCORING LOGIC
    function calculateAndApplyScores(teamArray, winnerName, loserName, lostRounds) {
        const winner = teamArray.find(t => t.name === winnerName);
        const loser = teamArray.find(t => t.name === loserName);

        if (!winner || !loser) return;

        const roundPts = ROUNDS_MAPPING[lostRounds] || 0; 
        
        // Update Winner's stats
        winner.won += 1;
        winner.roundsPoints += roundPts; 
        winner.totalPoints = winner.won * POINTS_PER_WIN;
        
        // Update Loser's stats (Loser gets -RoundsPoints)
        loser.lost += 1;
        // The loser's roundsPoints are subtracted from their total roundsPoints
        loser.roundsPoints += (-roundPts); 
        loser.totalPoints = loser.won * POINTS_PER_WIN; 
    }

    // 5. FORM SUBMISSION HANDLER
    document.getElementById('matchFormA').addEventListener('submit', handleFormSubmit);
    document.getElementById('matchFormB').addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(e) {
        e.preventDefault();

        // Use a custom modal instead of alert()
        const showMessage = (message) => {
            console.error(message);
            // Temporary use of alert for functionality demo
            alert(message); 
        };

        const groupKey = e.currentTarget.getAttribute('data-group');
        const teamArray = groupData[groupKey];
        
        const winnerName = document.getElementById(`winningTeam${groupKey}`).value;
        const loserName = document.getElementById(`losingTeam${groupKey}`).value;
        const lostRounds = parseInt(document.getElementById(`lostRounds${groupKey}`).value);

        if (winnerName === "" || loserName === "") {
             showMessage(`Group ${groupKey}: Please select both a winner and a loser.`);
             return;
        }

        if (winnerName === loserName) {
            showMessage(`Group ${groupKey}: Winner and Loser cannot be the same team.`);
            return;
        }
        
        if (isNaN(lostRounds) || lostRounds < 0 || lostRounds > 7) {
            showMessage(`Group ${groupKey}: Invalid input for lost rounds. Please enter a number between 0 and 7.`);
            return;
        }

        calculateAndApplyScores(teamArray, winnerName, loserName, lostRounds);
        saveData(); 
        renderTable(groupKey); 
        e.currentTarget.reset();
        
        // Repopulate to reset the dropdowns to their initial state
        populateTeamSelects(groupKey); 
    }

    // --- Initialization ---
    loadData();
    // After loading, populate the dropdowns and render the tables
    populateTeamSelects('A');
    populateTeamSelects('B');
    renderTable('A'); 
    renderTable('B');
    
    // Attach change listeners for dynamic filtering
    document.getElementById('winningTeamA').addEventListener('change', () => filterLoserSelect('A'));
    document.getElementById('winningTeamB').addEventListener('change', () => filterLoserSelect('B'));
});

