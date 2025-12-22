document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'tournamentDataGroups';
    const LAST_MATCH_KEY = 'lastMatchTeamsData'; // Stores the last played teams to keep arrows on refresh
    
    // 1. INITIAL DATA STORE [cite: 1-5]
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
    let lastMatchTeams = { A: [], B: [] }; // Tracks the last two teams to play [cite: 38]

    // POINT RULES [cite: 6-7]
    const ROUNDS_MAPPING = { 0: 10, 1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3 };
    const POINTS_PER_WIN = 4;

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedLast = localStorage.getItem(LAST_MATCH_KEY);
        if (saved) {
            groupData = JSON.parse(saved); [cite: 8, 9]
        } else {
            groupData = groupDataDefaults; [cite: 10]
            saveData();
        }
        if (savedLast) {
            lastMatchTeams = JSON.parse(savedLast);
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData)); [cite: 11, 12]
        localStorage.setItem(LAST_MATCH_KEY, JSON.stringify(lastMatchTeams));
    }

    let previousRanks = { A: {}, B: {} };

    // RENDER TABLE [cite: 13-24]
    function renderTable(groupKey) {
        const teamData = groupData[groupKey];
        const tableBody = document.querySelector(`#pointTable${groupKey} tbody`);
        
        // Count total matches played in this group to trigger arrow logic
        const totalPlayed = teamData.reduce((sum, t) => sum + (t.won + t.lost), 0) / 2;

        const oldOrder = [...teamData].map(t => t.name); [cite: 14]
        previousRanks[groupKey] = {};
        oldOrder.forEach((name, index) => previousRanks[groupKey][name] = index);

        teamData.sort((a, b) => { [cite: 15]
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            return b.roundsPoints - a.roundsPoints;
        });

        const allPlayed = teamData.every(t => (t.won + t.lost) === 14); [cite: 16]
        tableBody.innerHTML = ''; [cite: 17]

        teamData.forEach((team, newIndex) => {
            const oldIndex = previousRanks[groupKey][team.name];
            let icon = "–";
            let color = "gray";
            let blinkClass = "";

            // --- ARROW LOGIC START ---
            let showArrow = false;
            if (totalPlayed <= 3) {
                // First 3 matches: show for everyone who changed rank
                if (oldIndex !== newIndex) showArrow = true;
            } else {
                // 4th match onwards: ONLY show for teams in the last match
                if (oldIndex !== newIndex && lastMatchTeams[groupKey].includes(team.name)) {
                    showArrow = true;
                }
            }

            if (showArrow) {
                if (oldIndex > newIndex) {
                    icon = "▲"; color = "green"; blinkClass = "arrow-blink"; [cite: 17, 18]
                } else if (oldIndex < newIndex) {
                    icon = "▼"; color = "red"; blinkClass = "arrow-blink"; [cite: 18]
                }
            }
            // --- ARROW LOGIC END ---

            const played = team.won + team.lost;
            const row = document.createElement('tr');

            row.style.transform = `translateY(${(oldIndex - newIndex) * 10}px)`; [cite: 19]
            setTimeout(() => row.style.transform = "translateY(0)", 20);

            const isQualified = allPlayed && newIndex < 5; [cite: 19]

            row.innerHTML = `
                <td>
                    <span style="margin-right:5px;">${isQualified ? `<span class="qualify-badge">Q</span>` : ""}</span> [cite: 20, 21]
                    <span class="${blinkClass}" style="color:${color}; font-weight:bold; margin-right:5px;">${icon}</span> [cite: 21]
                    ${team.name}
                </td>
                <td>${played}</td>
                <td>${team.won}</td>
                <td>${team.lost}</td>
                <td>${team.roundsPoints}</td> [cite: 22]
                <td>${team.totalPoints}</td>
            `;

            if (isQualified) row.classList.add("qualified"); [cite: 23, 24]
            tableBody.appendChild(row);
        });
    }

    // POPULATE DROPDOWNS [cite: 25-28]
    function populateTeamSelects(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);
        const teams = groupData[groupKey];

        const setDropdown = (select, placeholder) => {
            select.innerHTML = `<option disabled selected>${placeholder}</option>`;
            teams.forEach(team => {
                const played = team.won + team.lost;
                const opt = new Option(team.name, team.name);
                if (played >= 14) { opt.disabled = true; opt.style.color = "gray"; } [cite: 27, 28]
                select.appendChild(opt);
            });
        };
        setDropdown(winSel, "Select Winner"); [cite: 29]
        setDropdown(loseSel, "Select Loser");
        filterLoserSelect(groupKey);
    }

    function filterLoserSelect(groupKey) { [cite: 30-33]
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);
        const teams = groupData[groupKey];
        loseSel.innerHTML = '<option disabled selected>Select Loser</option>'; [cite: 30]
        teams.forEach(team => {
            if (team.name === winSel.value) return; [cite: 31]
            const played = team.won + team.lost;
            const opt = new Option(team.name, team.name);
            if (played >= 14) { opt.disabled = true; opt.style.color = "gray"; } [cite: 32]
            loseSel.appendChild(opt);
        });
    }

    function calculateAndApplyScores(arr, winnerName, loserName, lostRounds) { [cite: 34-36]
        const winner = arr.find(t => t.name === winnerName);
        const loser = arr.find(t => t.name === loserName);
        const roundPts = ROUNDS_MAPPING[lostRounds] || 0;
        winner.won += 1;
        winner.roundsPoints += roundPts;
        winner.totalPoints = winner.won * POINTS_PER_WIN; [cite: 35]
        loser.lost += 1;
        loser.roundsPoints -= roundPts;
        loser.totalPoints = loser.won * POINTS_PER_WIN;
    }

    function handleFormSubmit(e) { [cite: 37-41]
        e.preventDefault();
        const g = e.target.getAttribute("data-group");
        const winner = document.getElementById(`winningTeam${g}`).value;
        const loser = document.getElementById(`losingTeam${g}`).value;
        const lostRounds = parseInt(document.getElementById(`lostRounds${g}`).value);

        if (!winner || !loser || winner === loser) { alert("Select valid teams."); return; } [cite: 39]
        if (lostRounds < 0 || lostRounds > 7) { alert("Lost rounds must be 0–7."); return; } [cite: 40]

        // Track teams in the current match for arrow logic
        lastMatchTeams[g] = [winner, loser];

        calculateAndApplyScores(groupData[g], winner, loser, lostRounds);
        saveData();
        renderTable(g);
        e.target.reset();
        populateTeamSelects(g);
    }

    document.getElementById('matchFormA').addEventListener('submit', handleFormSubmit); [cite: 36]
    document.getElementById('matchFormB').addEventListener('submit', handleFormSubmit);

    // TIE BREAKER SYSTEM [cite: 41-53]
    function populateTieBreakerTeams() {
        const groupKey = document.getElementById("tieGroupSelect").value; [cite: 41, 42]
        const teams = groupData[groupKey];
        const t1 = document.getElementById("tieTeam1");
        const t2 = document.getElementById("tieTeam2");
        t1.innerHTML = '<option disabled selected>Select Team 1</option>';
        t2.innerHTML = '<option disabled selected>Select Team 2</option>';
        teams.forEach(team => {
            const played = team.won + team.lost;
            const opt1 = new Option(team.name, team.name);
            const opt2 = new Option(team.name, team.name);
            if (played >= 14) { opt1.disabled = opt2.disabled = true; opt1.style.color = opt2.style.color = "gray"; } [cite: 44]
            t1.appendChild(opt1);
            t2.appendChild(opt2);
        });
    }

    function applyTieBreaker(groupKey, team1, team2, penalty) { [cite: 45-50]
        const arr = groupData[groupKey];
        const t1 = arr.find(t => t.name === team1);
        const t2 = arr.find(t => t.name === team2);
        if (!t1 || !t2) return;
        
        lastMatchTeams[groupKey] = [team1, team2]; // Tie break counts as a match for arrows

        t1.roundsPoints -= penalty; [cite: 48]
        t2.roundsPoints -= penalty;
        t1.lost += 1; [cite: 49]
        t2.lost += 1;
        t1.totalPoints = t1.won * 4; [cite: 50]
        t2.totalPoints = t2.won * 4;
        saveData();
        renderTable(groupKey);
        alert(`Tie Breaker Applied!\n${team1}: -${penalty}\n${team2}: -${penalty}`);
    }

    document.getElementById("tieGroupSelect").addEventListener("change", populateTieBreakerTeams); [cite: 51]
    document.getElementById("tieApplyBtn").addEventListener("click", () => {
        const groupKey = document.getElementById("tieGroupSelect").value;
        const t1 = document.getElementById("tieTeam1").value;
        const t2 = document.getElementById("tieTeam2").value;
        const penalty = parseInt(document.getElementById("tiePenalty").value);
        if (!t1 || !t2 || t1 === t2) { alert("Select valid teams."); return; } [cite: 52]
        applyTieBreaker(groupKey, t1, t2, penalty);
    });

    // INITIAL LOAD [cite: 53]
    loadData();
    populateTeamSelects("A");
    populateTeamSelects("B");
    renderTable("A");
    renderTable("B");
    populateTieBreakerTeams();
    document.getElementById("winningTeamA").addEventListener("change", () => filterLoserSelect("A")); [cite: 54]
    document.getElementById("winningTeamB").addEventListener("change", () => filterLoserSelect("B"));
});

// RESET ALL DATA BUTTON 
document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Are you sure? This will clear all tournament data.")) {
        localStorage.removeItem('tournamentDataGroups');
        localStorage.removeItem('lastMatchTeamsData'); // Clear arrow memory too
        alert("Data cleared! Page will reload.");
        location.reload();
    }
});
