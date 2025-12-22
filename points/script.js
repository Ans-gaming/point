document.addEventListener('DOMContentLoaded', () => {
    
    const STORAGE_KEY = 'tournamentDataGroups';
    
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
    let lastMatchTeams = { A: [], B: [] };

    // POINT RULES [cite: 6, 7]
    const ROUNDS_MAPPING = { 
        0: 10, 1: 9, 2: 8, 3: 7, 4: 6, 5: 5, 6: 4, 7: 3
    };
    const POINTS_PER_WIN = 4;

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            groupData = JSON.parse(saved); [cite: 8]
        } else {
            groupData = groupDataDefaults; [cite: 9]
            saveData(); [cite: 10]
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData)); [cite: 11]
    }

    let previousRanks = { A: {}, B: {} };

    // RENDER TABLE [cite: 13]
    function renderTable(groupKey) {
        const teamData = groupData[groupKey];
        const tableBody = document.querySelector(`#pointTable${groupKey} tbody`);
        
        // Calculate total matches played to trigger arrow logic
        const totalPlayedInGroup = teamData.reduce((sum, t) => sum + (t.won + t.lost), 0) / 2;

        const oldOrder = [...teamData].map(t => t.name); [cite: 14]
        previousRanks[groupKey] = {};
        oldOrder.forEach((name, index) => previousRanks[groupKey][name] = index);

        teamData.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints)
                return b.totalPoints - a.totalPoints; [cite: 15]
            return b.roundsPoints - a.roundsPoints;
        });

        const allPlayed = teamData.every(t => (t.won + t.lost) === 14); [cite: 16]
        tableBody.innerHTML = '';

        teamData.forEach((team, newIndex) => {
            const oldIndex = previousRanks[groupKey][team.name];

            let icon = "–";
            let color = "gray";
            let blinkClass = "";

            // NEW ARROW LOGIC
            let showArrow = false;
            if (totalPlayedInGroup <= 3) {
                if (oldIndex !== newIndex) showArrow = true;
            } else {
                if (oldIndex !== newIndex && lastMatchTeams[groupKey].includes(team.name)) {
                    showArrow = true;
                }
            }

            if (showArrow) {
                if (oldIndex > newIndex) {
                    icon = "▲"; [cite: 17]
                    color = "green";
                    blinkClass = "arrow-blink"; [cite: 18]
                } else if (oldIndex < newIndex) {
                    icon = "▼";
                    color = "red";
                    blinkClass = "arrow-blink";
                }
            }

            const played = team.won + team.lost;
            const row = document.createElement('tr');
            row.style.transform = `translateY(${(oldIndex - newIndex) * 10}px)`; [cite: 19]
            setTimeout(() => row.style.transform = "translateY(0)", 20);

            const isQualified = allPlayed && newIndex < 5; [cite: 19]
            const badge = isQualified ? `<span class="qualify-badge">Q</span>` : ""; [cite: 19]

            row.innerHTML = `
                <td>
                    <span style="margin-right:5px;">${isQualified ? `<span class="qualify-badge">Q</span>` : ""}</span>
                    <span class="${blinkClass}" style="color:${color}; font-weight:bold; margin-right:5px;">${icon}</span>
                    ${team.name}
                </td>
                <td>${played}</td> [cite: 21]
                <td>${team.won}</td>
                <td>${team.lost}</td>
                <td>${team.roundsPoints}</td> [cite: 22]
                <td>${team.totalPoints}</td>
            `;

            if (isQualified) row.classList.add("qualified"); [cite: 23]
            tableBody.appendChild(row);
        });
    }

    function populateTeamSelects(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`); [cite: 25]
        const loseSel = document.getElementById(`losingTeam${groupKey}`); [cite: 26]
        const teams = groupData[groupKey];

        const setDropdown = (select, placeholder) => {
            select.innerHTML = `<option disabled selected>${placeholder}</option>`;
            teams.forEach(team => {
                const played = team.won + team.lost;
                const opt = new Option(team.name, team.name);
                if (played >= 14) { [cite: 27]
                    opt.disabled = true;
                    opt.style.color = "gray"; [cite: 28]
                }
                select.appendChild(opt);
            });
        };

        setDropdown(winSel, "Select Winner");
        setDropdown(loseSel, "Select Loser");
        filterLoserSelect(groupKey);
    }

    function filterLoserSelect(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`); [cite: 29]
        const loseSel = document.getElementById(`losingTeam${groupKey}`); [cite: 30]
        const teams = groupData[groupKey];

        loseSel.innerHTML = '<option disabled selected>Select Loser</option>';
        teams.forEach(team => {
            if (team.name === winSel.value) return; [cite: 31]
            const played = team.won + team.lost;
            const opt = new Option(team.name, team.name);
            if (played >= 14) { [cite: 32]
                opt.disabled = true;
                opt.style.color = "gray";
            }
            loseSel.appendChild(opt);
        });
    }

    function calculateAndApplyScores(arr, winnerName, loserName, lostRounds) {
        const winner = arr.find(t => t.name === winnerName); [cite: 33]
        const loser = arr.find(t => t.name === loserName); [cite: 34]
        const roundPts = ROUNDS_MAPPING[lostRounds] || 0;

        winner.won += 1;
        winner.roundsPoints += roundPts;
        winner.totalPoints = winner.won * POINTS_PER_WIN; [cite: 35]

        loser.lost += 1;
        loser.roundsPoints -= roundPts;
        loser.totalPoints = loser.won * POINTS_PER_WIN;
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const g = e.target.getAttribute("data-group"); [cite: 37]
        const winner = document.getElementById(`winningTeam${g}`).value;
        const loser = document.getElementById(`losingTeam${g}`).value; [cite: 38]
        const lostRounds = parseInt(document.getElementById(`lostRounds${g}`).value);

        if (!winner || !loser || winner === loser) {
            alert("Select valid teams."); [cite: 39]
            return;
        }

        lastMatchTeams[g] = [winner, loser];

        calculateAndApplyScores(groupData[g], winner, loser, lostRounds); [cite: 40]
        saveData();
        renderTable(g);
        e.target.reset();
        populateTeamSelects(g);
    }

    document.getElementById('matchFormA').addEventListener('submit', handleFormSubmit); [cite: 36]
    document.getElementById('matchFormB').addEventListener('submit', handleFormSubmit);

    // RESTORED TIE BREAKER SYSTEM [cite: 41]
    function populateTieBreakerTeams() {
        const groupKey = document.getElementById("tieGroupSelect").value;
        const teams = groupData[groupKey]; [cite: 42]
        const t1 = document.getElementById("tieTeam1");
        const t2 = document.getElementById("tieTeam2");

        t1.innerHTML = '<option disabled selected>Select Team 1</option>'; [cite: 43]
        t2.innerHTML = '<option disabled selected>Select Team 2</option>';

        teams.forEach(team => {
            const played = team.won + team.lost;
            const opt1 = new Option(team.name, team.name);
            const opt2 = new Option(team.name, team.name);

            if (played >= 14) { [cite: 44]
                opt1.disabled = true;
                opt2.disabled = true;
                opt1.style.color = "gray";
                opt2.style.color = "gray";
            }
            t1.appendChild(opt1);
            t2.appendChild(opt2);
        });
    }

    function applyTieBreaker(groupKey, team1, team2, penalty) {
        const arr = groupData[groupKey]; [cite: 45]
        const t1 = arr.find(t => t.name === team1); [cite: 46]
        const t2 = arr.find(t => t.name === team2); [cite: 47]

        if (!t1 || !t2) return;

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

    loadData(); [cite: 53]
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
        localStorage.removeItem('tournamentDataGroups'); [cite: 54]
        location.reload();
    }
});
