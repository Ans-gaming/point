document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'tournamentDataGroups';
    let matchCount = { A: 0, B: 0 };
    let recentMatches = { A: [], B: [] };
    
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

        const involvedTeams = recentMatches[groupKey].flat();

        if (involvedTeams.includes(team.name)) {
            if (oldIndex > newIndex) {
                icon = "▲";
                color = "green";
                blinkClass = "arrow-blink";
            } else if (oldIndex < newIndex) {
                icon = "▼";
                color = "red";
                blinkClass = "arrow-blink";
            }
        } else {
            // After 4th match → pair arrows logic
            if (matchCount[groupKey] >= 4) {
                // Example: pair arrows 1↔3, 4↔6
                const index = newIndex + 1; // 1-based
                if (index === 1 || index === 3 || index === 4 || index === 6) {
                    icon = "↔"; // or ▲/▼ depending on your design
                    color = "blue";
                }
            }
        }

        const played = team.won + team.lost;
        const row = document.createElement('tr');

        // ⭐ Smooth slide animation
        row.style.transform = `translateY(${(oldIndex - newIndex) * 10}px)`;
        setTimeout(() => row.style.transform = "translateY(0)", 20);

        // ⭐ Qualification badge only when ALL played 9 matches
        const isQualified = allPlayed && newIndex < 5;
        const badge = isQualified ? `<span class="qualify-badge">Q</span>` : "";

        row.innerHTML = `
            <td>
        <span style="margin-right:5px;">
            ${isQualified ? `<span class="qualify-badge">Q</span>` : ""}
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

        // ⭐ Add highlight class AFTER all teams complete 9 matches
        if (isQualified) {
            row.classList.add("qualified");
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
        // Track match count
        matchCount[g] += 1;
        
        // Save recent matches (keep last 3 or 1 depending on count)
        recentMatches[g].push([winner, loser]);
        if (matchCount[g] <= 3) {
            // keep last 3
            if (recentMatches[g].length > 3) recentMatches[g].shift();
        } else {
            // after 4th → only keep last match
            recentMatches[g] = [[winner, loser]];
        }

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

document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Are you sure? This will clear all tournament data.")) {
        localStorage.removeItem('tournamentDataGroups');
        alert("Data cleared! Page will reload.");
        location.reload();
    }
});

