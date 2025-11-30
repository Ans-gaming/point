document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'tournamentDataGroups';
    
    // 1. INITIAL DATA STORE (Defaults used only if nothing is in Local Storage)
    let groupDataDefaults = {
        A: [
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
            { name: "TEAM SOUL", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "OP ABHIRAM", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "BLACK 777", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "VIP GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "MRAK", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "RED MAX", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "STAY MAX", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "VINAY GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "BLUE DEVIL", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 }
        ]
    };

    let groupData; 

    const ROUNDS_MAPPING = { 
        0: 10, 1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3
    };
    const POINTS_PER_WIN = 4;

    function loadData() {
        groupData = groupDataDefaults;
        saveData();
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData));
    }

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

        const teamNames = groupData[groupKey].map(t => t.name);
        
        losingSelect.innerHTML = '<option value="" disabled selected>Select Loser</option>';
        
        teamNames.forEach(name => {
            if (name !== selectedWinner) {
                losingSelect.appendChild(new Option(name, name));
            }
        });
    }

    function calculateAndApplyScores(teamArray, winnerName, loserName, lostRounds) {
        const winner = teamArray.find(t => t.name === winnerName);
        const loser = teamArray.find(t => t.name === loserName);

        if (!winner || !loser) return;

        const roundPts = ROUNDS_MAPPING[lostRounds] || 0; 
        
        winner.won += 1;
        winner.roundsPoints += roundPts; 
        winner.totalPoints = winner.won * POINTS_PER_WIN;
        
        loser.lost += 1;
        loser.roundsPoints += (-roundPts); 
        loser.totalPoints = loser.won * POINTS_PER_WIN; 
    }

    document.getElementById('matchFormA').addEventListener('submit', handleFormSubmit);
    document.getElementById('matchFormB').addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(e) {
        e.preventDefault();

        const showMessage = (message) => alert(message);

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
            showMessage(`Group ${groupKey}: Invalid input for lost rounds. Please enter 0-7.`);
            return;
        }

        calculateAndApplyScores(teamArray, winnerName, loserName, lostRounds);
        saveData(); 
        renderTable(groupKey); 
        e.currentTarget.reset();
        
        populateTeamSelects(groupKey); 
    }

    // --------------------------
    // ⭐⭐⭐ TIE BREAKER FUNCTIONS ⭐⭐⭐
    // --------------------------

    function populateTieBreakerTeams() {
        const groupKey = document.getElementById('tieGroupSelect').value;
        const teamList = groupData[groupKey].map(t => t.name);

        const t1 = document.getElementById('tieTeam1');
        const t2 = document.getElementById('tieTeam2');

        t1.innerHTML = '<option disabled selected>Select Team 1</option>';
        t2.innerHTML = '<option disabled selected>Select Team 2</option>';

        teamList.forEach(name => {
            t1.appendChild(new Option(name, name));
            t2.appendChild(new Option(name, name));
        });
    }

    function applyTieBreaker(groupKey, team1, team2, penalty) {

        const teamArray = groupData[groupKey];
        const t1 = teamArray.find(t => t.name === team1);
        const t2 = teamArray.find(t => t.name === team2);

        if (!t1 || !t2) return;

        t1.roundsPoints -= penalty;
        t2.roundsPoints -= penalty;

        saveData();
        renderTable(groupKey);

        alert(`Tie Breaker Applied!\n${team1}: -${penalty}\n${team2}: -${penalty}`);
    }

    document.getElementById('tieGroupSelect').addEventListener('change', populateTieBreakerTeams);

    document.getElementById('tieApplyBtn').addEventListener('click', () => {

        const groupKey = document.getElementById('tieGroupSelect').value;
        const t1 = document.getElementById('tieTeam1').value;
        const t2 = document.getElementById('tieTeam2').value;
        const penalty = parseInt(document.getElementById('tiePenalty').value);

        if (!t1 || !t2) {
            alert("Select both teams for tie breaker.");
            return;
        }

        if (t1 === t2) {
            alert("Both teams cannot be the same.");
            return;
        }

        applyTieBreaker(groupKey, t1, t2, penalty);
    });

    // --------------------------
    // INITIAL LOAD
    // --------------------------

    loadData();
    populateTeamSelects('A');
    populateTeamSelects('B');
    renderTable('A'); 
    renderTable('B');

    populateTieBreakerTeams();

    document.getElementById('winningTeamA').addEventListener('change', () => filterLoserSelect('A'));
    document.getElementById('winningTeamB').addEventListener('change', () => filterLoserSelect('B'));

});
