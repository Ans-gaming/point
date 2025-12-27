const STORAGE_KEY = 'tournamentDataGroups';
const HISTORY_KEY = 'tournamentHistory';

let groupData;

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData));
}

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INITIAL DATA STORE
    let groupDataDefaults = {
        A: [
            { name: "VORTEX GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "VINAY GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "OTC", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "ANS GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "NIGHT HUNTERS", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "AGENT 03", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "SMARTY BOY", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "THE SHIELD", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 }  
        ],
        B: [
            { name: "DARK HUNTER", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "GAMER AADI", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "SKY SHOOTERS", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "KRACK GAMING", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "BLUE DEVIL", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "THE LEGEND", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "DEATH GUN", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 },
            { name: "MRAK", won: 0, lost: 0, roundsPoints: 0, totalPoints: 0 }
        ]
    };

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

let previousRanks = {
    A: {},
    B: {}
};

    // RENDER TABLE
  function renderTable(groupKey) {
    const teamData = groupData[groupKey];
    const tableBody = document.querySelector(`#pointTable${groupKey} tbody`);

    const oldOrder = [...teamData].map(t => t.name);
    previousRanks[groupKey] = {};
    oldOrder.forEach((name, index) => previousRanks[groupKey][name] = index);

    // Sort normally
    teamData.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints)
            return b.totalPoints - a.totalPoints;
        return b.roundsPoints - a.roundsPoints;
    });

    // ⭐ Check if ALL teams played 9 matches
    const allPlayed = teamData.every(t => (t.won + t.lost) === 14);

    tableBody.innerHTML = '';

    teamData.forEach((team, newIndex) => {
        const oldIndex = previousRanks[groupKey][team.name];

        let icon = "–";
        let color = "gray";
        let blinkClass = "";

        if (oldIndex > newIndex) {
            icon = "▲";
            color = "green";
            blinkClass = "arrow-blink";
        } else if (oldIndex < newIndex) {
            icon = "▼";
            color = "red";
            blinkClass = "arrow-blink";
        }
        const row = document.createElement('tr');

        // ⭐ Smooth slide animation
        row.style.transform = `translateY(${(oldIndex - newIndex) * 10}px)`;
        setTimeout(() => row.style.transform = "translateY(0)", 20);

        const played = team.won + team.lost;

// 🟢 Early qualification / elimination
let status = ""; // "", "Q", "E"

// BEFORE 14 MATCHES
if (!allPlayed) {
    if (team.won >= 9) status = "Q";
    else if (team.lost >= 9) status = "E";
}
// AFTER 14 MATCHES
else {
    if (newIndex < 5) status = "Q";
    else status = "E";
}

        row.innerHTML = `
            <td>
        <span style="margin-right:5px;">
    ${status === "Q" ? `<span class="qualify-badge">Q</span>` : ""}
    ${status === "E" ? `<span class="eliminate-badge">E</span>` : ""}
</span>

        <span class="${blinkClass}" style="color:${color}; font-weight:bold; margin-right:5px;">
            ${icon}
        </span>
        ${team.name}
    </td>

            <td>${played}</td>
            <td>${team.won}</td>
            <td>${team.lost}</td>
            <td>${team.roundsPoints}</td>
            <td>${team.totalPoints}</td>
        `;

        // ⭐ Highlight qualified / eliminated rows
if (status === "Q") {
    row.classList.add("qualified");
}
if (status === "E") {
    row.classList.add("eliminated");
}

        tableBody.appendChild(row);
    });
}
  
    // POPULATE DROPDOWNS
 function populateTeamSelects(groupKey) {
    const winSel = document.getElementById(`winningTeam${groupKey}`);
    const loseSel = document.getElementById(`losingTeam${groupKey}`);
    const teams = groupData[groupKey];

    // Helper to fill dropdowns
    const setDropdown = (select, placeholder) => {
        select.innerHTML = `<option disabled selected>${placeholder}</option>`;

        teams.forEach(team => {
            const played = team.won + team.lost;
            const opt = new Option(team.name, team.name);

            // ⭐ If played 9 matches → disable option
            if (played >= 14) {
                opt.disabled = true;
                opt.style.color = "gray";
            }

            select.appendChild(opt);
        });
    };

    setDropdown(winSel, "Select Winner");
    setDropdown(loseSel, "Select Loser");

    filterLoserSelect(groupKey);
}

    // FILTER LOSER OPTIONS
    function filterLoserSelect(groupKey) {
    const winSel = document.getElementById(`winningTeam${groupKey}`);
    const loseSel = document.getElementById(`losingTeam${groupKey}`);
    const teams = groupData[groupKey];

    loseSel.innerHTML = '<option disabled selected>Select Loser</option>';

    teams.forEach(team => {
        const played = team.won + team.lost;

        // Skip winner team
        if (team.name === winSel.value) return;

        const opt = new Option(team.name, team.name);

        // ⭐ Disable team if it has completed 9 matches
        if (played >= 14) {
            opt.disabled = true;
            opt.style.color = "gray";
        }

        loseSel.appendChild(opt);
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
    const winnerSel = document.getElementById(`winningTeam${g}`);
    const loserSel = document.getElementById(`losingTeam${g}`);
    const roundsSel = document.getElementById(`lostRounds${g}`);

    const winner = winnerSel.value;
    const loser = loserSel.value;
    const lostRounds = roundsSel.value;

    const hasWinner = winnerSel.selectedIndex !== 0;
    const hasLoser = loserSel.selectedIndex !== 0;
    const hasRounds = lostRounds !== "" && lostRounds !== null;

    /* -------------------------------------------------
       🔥 PERFECT VALIDATION MATRIX (as you requested)
    --------------------------------------------------*/

    // 1️⃣ Only Winner selected
    if (hasWinner && !hasLoser && !hasRounds) {
        alert("Select Losing Team Name & Loser's Rounds (0–7).");
        return;
    }

    // 2️⃣ Only Loser selected
    if (!hasWinner && hasLoser && !hasRounds) {
        alert("Select Winning Team Name & Loser's Rounds (0–7).");
        return;
    }

    // 3️⃣ Only Rounds selected
    if (!hasWinner && !hasLoser && hasRounds) {
        alert("Select Winning Team Name & Losing Team Name.");
        return;
    }

    // 4️⃣ Loser + Rounds selected
    if (!hasWinner && hasLoser && hasRounds) {
        alert("Select Winning Team Name.");
        return;
    }

    // 5️⃣ Winner + Rounds selected
    if (hasWinner && !hasLoser && hasRounds) {
        alert("Select Losing Team Name.");
        return;
    }

    // ❌ Winner & Loser same
    if (winner === loser) {
        alert("Winning Team and Losing Team cannot be the same.");
        return;
    }

    // ❌ Rounds range check
    const roundsNum = parseInt(lostRounds);
    if (isNaN(roundsNum) || roundsNum < 0 || roundsNum > 7) {
        alert("Loser's Rounds must be between 0 and 7.");
        return;
    }
        
    saveHistory(); // ✅ SAVE STATE BEFORE CHANGE
    /* -------------------------------------------------
       ✅ ALL VALID → APPLY RESULT
    --------------------------------------------------*/
    calculateAndApplyScores(groupData[g], winner, loser, roundsNum);

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
    const teams = groupData[groupKey];

    const t1 = document.getElementById("tieTeam1");
    const t2 = document.getElementById("tieTeam2");

    t1.innerHTML = '<option disabled selected>Select Team 1</option>';
    t2.innerHTML = '<option disabled selected>Select Team 2</option>';

    teams.forEach(team => {
        const played = team.won + team.lost;

        const opt1 = new Option(team.name, team.name);
        const opt2 = new Option(team.name, team.name);

        // ⭐ Disable if team completed 14 matches
        if (played >= 14) {
            opt1.disabled = true;
            opt2.disabled = true;
            opt1.style.color = "gray";
            opt2.style.color = "gray";
        }

        t1.appendChild(opt1);
        t2.appendChild(opt2);
    });
}

    // FINAL TIE BREAKER FUNCTION (PLAYED+1, LOST+1, -ROUNDS)
    function applyTieBreaker(groupKey, team1, team2, penalty) {
        
        saveHistory(); // ✅ 🔥 THIS IS THE MISSING LINE
        
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
    // 🔓 Expose functions for undoLastEntry (CORRECT PLACE)
    window.renderTable = renderTable;
    window.populateTeamSelects = populateTeamSelects;

});

document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Are you sure? This will clear all tournament data.")) {
        localStorage.removeItem('tournamentDataGroups');
        localStorage.removeItem('tournamentHistory');
        alert("Data cleared! Page will reload.");
        location.reload();
    }
});

function saveHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    history.push(JSON.stringify(groupData));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function undoLastEntry() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    if (history.length === 0) {
        alert("No last entry to delete.");
        return;
    }

    const previousState = history.pop();
    groupData = JSON.parse(previousState);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    saveData();

    renderTable("A");
    renderTable("B");
    populateTeamSelects("A");
    populateTeamSelects("B");

    alert("Last entry deleted successfully!");
}

document.getElementById("undoLastBtn").addEventListener("click", () => {
    if (confirm("Delete last match entry?")) {
        undoLastEntry();
    }
});



