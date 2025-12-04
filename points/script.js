document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'tournamentDataGroups';
    
    // 1. INITIAL DATA STORE
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
            { name: "SMARTY BOY", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "THE LEGEND", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 }  
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
            { name: "BLUE DEVIL", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "OTC", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 }
        ]
    };

    let groupData;

    // POINT RULES
    const ROUNDS_MAPPING = { 
        0: 10, 1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3
    };
    const POINTS_PER_WIN = 4;

    // -----------------------------------------
    // ✅ FIXED loadData (no more deleting data)
    // -----------------------------------------
    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        
        if (saved) {
            groupData = JSON.parse(saved);  // load saved data
        } else {
            groupData = groupDataDefaults;  // first time only
            saveData();
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData));
    }

    // RENDER TABLE
    function renderTable(groupKey) {
        const teamData = groupData[groupKey];
        const tableBody = document.querySelector(`#pointTable${groupKey} tbody`);

        teamData.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints)
                return b.totalPoints - a.totalPoints;
            return b.roundsPoints - a.roundsPoints;
        });

        tableBody.innerHTML = '';
        teamData.forEach(team => {
            const played = team.won + team.lost;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team.name}</td>
                <td>${played}</td>
                <td>${team.won}</td>
                <td>${team.lost}</td>
                <td>${team.roundsPoints}</td>
                <td>${team.totalPoints}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // POPULATE DROPDOWNS
    function populateTeamSelects(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);
        const names = groupData[groupKey].map(t => t.name);

        const set = (sel, text) => {
            sel.innerHTML = `<option disabled selected>${text}</option>`;
            names.forEach(n => sel.appendChild(new Option(n, n)));
        };

        set(winSel, "Select Winner");
        set(loseSel, "Select Loser");
        filterLoserSelect(groupKey);
    }

    // FILTER LOSER OPTIONS
    function filterLoserSelect(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);

        loseSel.innerHTML = '<option disabled selected>Select Loser</option>';

        groupData[groupKey].forEach(t => {
            if (t.name !== winSel.value)
                loseSel.appendChild(new Option(t.name, t.name));
        });
    }

    // APPLY MATCH RESULTS
    function calculateAndApplyScores(arr, winnerName, loserName, lostRounds) {
        const winner = arr.find(t => t.name === winnerName);
        const loser = arr.find(t => t.name === loserName);

        const roundPts = ROUNDS_MAPPING[lostRounds] || 0;

        winner.won += 1;
        winner.roundsPoints += roundPts;
        winner.totalPoints = winner.won * POINTS_PER_WIN;

        loser.lost += 1;
        loser.roundsPoints -= roundPts;
        loser.totalPoints = loser.won * POINTS_PER_WIN;
    }

    // FORM SUBMISSION
    document.getElementById('matchFormA').addEventListener('submit', handleFormSubmit);
    document.getElementById('matchFormB').addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(e) {
        e.preventDefault();

        const g = e.target.getAttribute("data-group");
        const winner = document.getElementById(`winningTeam${g}`).value;
        const loser = document.getElementById(`losingTeam${g}`).value;
        const lostRounds = parseInt(document.getElementById(`lostRounds${g}`).value);

        if (!winner || !loser || winner === loser) {
            alert("Select valid teams.");
            return;
        }
        if (lostRounds < 0 || lostRounds > 7) {
            alert("Lost rounds must be 0–7.");
            return;
        }

        calculateAndApplyScores(groupData[g], winner, loser, lostRounds);

        saveData();
        renderTable(g);
        e.target.reset();
        populateTeamSelects(g);
    }

    // ------------------------------------------------------
    // ⭐⭐⭐ TIE BREAKER SYSTEM ⭐⭐⭐
    // ------------------------------------------------------

    function populateTieBreakerTeams() {
        const groupKey = document.getElementById("tieGroupSelect").value;
        const names = groupData[groupKey].map(t => t.name);

        const t1 = document.getElementById("tieTeam1");
        const t2 = document.getElementById("tieTeam2");

        t1.innerHTML = '<option disabled selected>Select Team 1</option>';
        t2.innerHTML = '<option disabled selected>Select Team 2</option>';

        names.forEach(n => {
            t1.appendChild(new Option(n, n));
            t2.appendChild(new Option(n, n));
        });
    }

    // FINAL TIE BREAKER FUNCTION (PLAYED+1, LOST+1, -ROUNDS)
    function applyTieBreaker(groupKey, team1, team2, penalty) {

        const arr = groupData[groupKey];
        const t1 = arr.find(t => t.name === team1);
        const t2 = arr.find(t => t.name === team2);

        if (!t1 || !t2) return;

        // Deduct round points
        t1.roundsPoints -= penalty;
        t2.roundsPoints -= penalty;

        // Played +1 because Lost +1
        t1.lost += 1;
        t2.lost += 1;

        // Total points unchanged
        t1.totalPoints = t1.won * 4;
        t2.totalPoints = t2.won * 4;

        saveData();
        renderTable(groupKey);

        alert(`Tie Breaker Applied!\n${team1}: -${penalty}\n${team2}: -${penalty}`);
    }

    document.getElementById("tieGroupSelect").addEventListener("change", populateTieBreakerTeams);

    document.getElementById("tieApplyBtn").addEventListener("click", () => {

        const groupKey = document.getElementById("tieGroupSelect").value;
        const t1 = document.getElementById("tieTeam1").value;
        const t2 = document.getElementById("tieTeam2").value;
        const penalty = parseInt(document.getElementById("tiePenalty").value);

        if (!t1 || !t2) {
            alert("Select both teams.");
            return;
        }
        if (t1 === t2) {
            alert("Teams cannot be the same.");
            return;
        }

        applyTieBreaker(groupKey, t1, t2, penalty);
    });

    // INITIAL LOAD
    loadData();
    populateTeamSelects("A");
    populateTeamSelects("B");
    renderTable("A");
    renderTable("B");

    populateTieBreakerTeams();

    document.getElementById("winningTeamA").addEventListener("change", () => filterLoserSelect("A"));
    document.getElementById("winningTeamB").addEventListener("change", () => filterLoserSelect("B"));

});

