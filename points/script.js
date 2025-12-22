document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'tournamentDataGroups';
    const LAST_MATCH_TEAMS_KEY = 'lastMatchTeams'; // Key to save the last played teams
    
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
    let lastPlayedTeams = { A: [], B: [] }; // Track teams for arrow logic

    // POINT RULES [cite: 6, 7]
    const ROUNDS_MAPPING = { 0: 10, 1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3 };
    const POINTS_PER_WIN = 4;

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedLastTeams = localStorage.getItem(LAST_MATCH_TEAMS_KEY);
        if (saved) {
            groupData = JSON.parse(saved); [cite: 8, 9]
        } else {
            groupData = groupDataDefaults; [cite: 10]
            saveData();
        }
        if (savedLastTeams) {
            lastPlayedTeams = JSON.parse(savedLastTeams);
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData)); [cite: 12]
        localStorage.setItem(LAST_MATCH_TEAMS_KEY, JSON.stringify(lastPlayedTeams));
    }

    let previousRanks = { A: {}, B: {} };

    // RENDER TABLE [cite: 13]
    function renderTable(groupKey) {
        const teamData = groupData[groupKey];
        const tableBody = document.querySelector(`#pointTable${groupKey} tbody`);
        
        // Calculate total matches played in this group [cite: 16]
        const totalMatchesInGroup = teamData.reduce((sum, team) => sum + (team.won + team.lost), 0) / 2;

        const oldOrder = [...teamData].map(t => t.name); [cite: 14]
        previousRanks[groupKey] = {};
        oldOrder.forEach((name, index) => previousRanks[groupKey][name] = index);

        teamData.sort((a, b) => { [cite: 15]
            if (b.totalPoints !== a.totalPoints)
                return b.totalPoints - a.totalPoints;
            return b.roundsPoints - a.roundsPoints;
        });

        const allPlayed = teamData.every(t => (t.won + t.lost) === 14); [cite: 16]
        tableBody.innerHTML = ''; [cite: 17]

        teamData.forEach((team, newIndex) => {
            const oldIndex = previousRanks[groupKey][team.name];

            let icon = "–";
            let color = "gray";
            let blinkClass = "";

            // --- NEW ARROW LOGIC ---
            // 1. Show arrows for first 3 matches for everyone
            // 2. After 3 matches, show arrows ONLY for teams involved in the last match
            let showArrow = false;
            if (totalMatchesInGroup <= 3) {
                if (oldIndex !== newIndex) showArrow = true;
            } else {
                if (oldIndex !== newIndex && lastPlayedTeams[groupKey].includes(team.name)) {
                    showArrow = true;
                }
            }

            if (showArrow) {
                if (oldIndex > newIndex) {
                    icon = "▲"; color = "green"; blinkClass = "arrow-blink"; [cite: 18]
                } else if (oldIndex < newIndex) {
                    icon = "▼"; color = "red"; blinkClass = "arrow-blink"; [cite: 18]
                }
            }

            const played = team.won + team.lost;
            const row = document.createElement('tr');

            row.style.transform = `translateY(${(oldIndex - newIndex) * 10}px)`; [cite: 19]
            setTimeout(() => row.style.transform = "translateY(0)", 20);

            const isQualified = allPlayed && newIndex < 5; [cite: 20]

            row.innerHTML = `
                <td>
                    <span style="margin-right:5px;">
                        ${isQualified ? `<span class="qualify-badge">Q</span>` : ""} [cite: 21]
                    </span>
                    <span class="${blinkClass}" style="color:${color}; font-weight:bold; margin-right:5px;">
                        ${icon}
                    </span>
                    ${team.name}
                </td>
                <td>${played}</td>
                <td>${team.won}</td>
                <td>${team.lost}</td>
                <td>${team.roundsPoints}</td> [cite: 22]
                <td>${team.totalPoints}</td>
            `;

            if (isQualified) {
                row.classList.add("qualified"); [cite: 23, 24]
            }

            tableBody.appendChild(row);
        });
    }

    // POPULATE DROPDOWNS [cite: 25]
    function populateTeamSelects(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);
        const teams = groupData[groupKey];

        const setDropdown = (select, placeholder) => {
            select.innerHTML = `<option disabled selected>${placeholder}</option>`;
            teams.forEach(team => { [cite: 27]
                const played = team.won + team.lost;
                const opt = new Option(team.name, team.name);
                if (played >= 14) {
                    opt.disabled = true; [cite: 28]
                    opt.style.color = "gray";
                }
                select.appendChild(opt);
            });
        };

        setDropdown(winSel, "Select Winner");
        setDropdown(loseSel, "Select Loser");
        filterLoserSelect(groupKey);
    }

    function filterLoserSelect(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);
        const teams = groupData[groupKey];
        loseSel.innerHTML = '<option disabled selected>Select Loser</option>'; [cite: 30]
        teams.forEach(team => { [cite: 31]
            if (team.name === winSel.value) return;
            const played = team.won + team.lost;
            const opt = new Option(team.name, team.name);
            if (played >= 14) {
                opt.disabled = true; [cite: 32]
                opt.style.color = "gray";
            }
            loseSel.appendChild(opt);
        });
    }

    function calculateAndApplyScores(arr, winnerName, loserName, lostRounds) {
        const winner = arr.find(t => t.name === winnerName); [cite: 34]
        const loser = arr.find(t => t.name === loserName);
        const roundPts = ROUNDS_MAPPING[lostRounds] || 0;
        winner.won += 1;
        winner.roundsPoints += roundPts;
        winner.totalPoints = winner.won * POINTS_PER_WIN; [cite: 35]
        loser.lost += 1;
        loser.roundsPoints -= roundPts;
        loser.totalPoints = loser.won * POINTS_PER_WIN; [cite: 36]
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const g = e.target.getAttribute("data-group");
        const winner = document.getElementById(`winningTeam${g}`).value;
        const loser = document.getElementById(`losingTeam${g}`).value;
        const lostRounds = parseInt(document.getElementById(`lostRounds${g}`).value);

        if (!winner || !loser || winner === loser) {
            alert("Select valid teams."); [cite: 38, 39]
            return;
        }

        // Track teams in the current match for arrow logic
        lastPlayedTeams[g] = [winner, loser];

        calculateAndApplyScores(groupData[g], winner, loser, lostRounds);
        saveData();
        renderTable(g);
        e.target.reset();
        populateTeamSelects(g); [cite: 41]
    }

    document.getElementById('matchFormA').addEventListener('submit', handleFormSubmit); [cite: 36]
    document.getElementById('matchFormB').addEventListener('submit', handleFormSubmit);

    // TIE BREAKER SYSTEM [cite: 41]
    function populateTieBreakerTeams() {
        const groupKey = document.getElementById("tieGroupSelect").value;
        const teams = groupData[groupKey];
        const t1 = document.getElementById("tieTeam1");
        const t2 = document.getElementById("tieTeam2");
        t1.innerHTML = '<option disabled selected>Select Team 1</option>'; [cite: 42, 43]
        t2.innerHTML = '<option disabled selected>Select Team 2</option>';
        teams.forEach(team => {
            const played = team.won + team.lost;
            const opt1 = new Option(team.name, team.name);
            const opt2 = new Option(team.name, team.name);
            if (played >= 14) {
                opt1.disabled = true; [cite: 44]
                opt2.disabled = true;
                opt1.style.color = "gray";
                opt2.style.color = "gray";
            }
            t1.appendChild(opt1);
            t2.appendChild(opt2);
        });
    }

    function applyTieBreaker(groupKey, team1, team2, penalty) {
        const arr = groupData[groupKey];
        const t1 = arr.find(t => t.name === team1); [cite: 46]
        const t2 = arr.find(t => t.name === team2);
        if (!t1 || !t2) return; [cite: 47]

        // Track tie breaker teams for arrows
        lastPlayedTeams[groupKey] = [team1, team2];

        t1.roundsPoints -= penalty; [cite: 48]
        t2.roundsPoints -= penalty;
        t1.lost += 1; [cite: 49]
        t2.lost += 1;
        t1.totalPoints = t1.won * 4; [cite: 50]
        t2.totalPoints = t2.won * 4;

        saveData();
        renderTable(groupKey);
        alert(`Tie Breaker Applied!\n${team1}: -${penalty}\n${team2}: -${penalty}`); [cite: 50]
    }

    document.getElementById("tieGroupSelect").addEventListener("change", populateTieBreakerTeams); [cite: 51]
    document.getElementById("tieApplyBtn").addEventListener("click", () => {
        const groupKey = document.getElementById("tieGroupSelect").value;
        const t1 = document.getElementById("tieTeam1").value;
        const t2 = document.getElementById("tieTeam2").value;
        const penalty = parseInt(document.getElementById("tiePenalty").value);
        if (!t1 || !t2) {
            alert("Select both teams.");
            return;
        }
        if (t1 === t2) { [cite: 52]
            alert("Teams cannot be the same.");
            return;
        }
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

document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Are you sure? This will clear all tournament data.")) {
        localStorage.removeItem('tournamentDataGroups');
        localStorage.removeItem('lastMatchTeams');
        alert("Data cleared! Page will reload.");
        location.reload();
    }
});
