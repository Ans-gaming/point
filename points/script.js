document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'tournamentDataGroups';
    const MAX_MATCHES = 14;
    const BLOCK_SIZE = 3;

    // ================= INITIAL DATA =================
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

    const ROUNDS_MAPPING = { 0:10,1:9,2:8,3:7,4:6,5:5,6:4,7:3 };
    const POINTS_PER_WIN = 4;

    // ================= STORAGE =================
    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            groupData = JSON.parse(saved);
        } else {
            groupData = groupDataDefaults;
            saveData();
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData));
    }

    // ================= STATE =================
    let previousRanks = { A: null, B: null };
    let matchCount = { A: 0, B: 0 };

    // ================= RENDER TABLE =================
    function renderTable(groupKey) {
        const teamData = groupData[groupKey];
        const tableBody = document.querySelector(`#pointTable${groupKey} tbody`);

        const oldRanks = previousRanks[groupKey]
            ? { ...previousRanks[groupKey] }
            : null;

        teamData.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            return b.roundsPoints - a.roundsPoints;
        });

        const newRanks = {};
        teamData.forEach((t, i) => newRanks[t.name] = i);

        const allPlayed = teamData.every(t => (t.won + t.lost) === MAX_MATCHES);

        const block = Math.floor((matchCount[groupKey] - 1) / BLOCK_SIZE);
        const blockStart = block * BLOCK_SIZE + 1;
        const blockEnd = blockStart + BLOCK_SIZE - 1;

        tableBody.innerHTML = '';

        teamData.forEach((team, newIndex) => {

            const playedForArrow = team.won + team.lost;
            const eligibleForArrow =
                playedForArrow >= blockStart &&
                playedForArrow <= blockEnd;

            let icon = "–";
            let color = "gray";
            let blinkClass = "";

            if (eligibleForArrow && oldRanks) {
                const oldIndex = oldRanks[team.name];
                if (newIndex < oldIndex) {
                    icon = "▲";
                    color = "green";
                    blinkClass = "arrow-blink";
                } else if (newIndex > oldIndex) {
                    icon = "▼";
                    color = "red";
                    blinkClass = "arrow-blink";
                }
            }

            const played = team.won + team.lost;
            const isQualified = allPlayed && newIndex < 5;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${isQualified ? `<span class="qualify-badge">Q</span>` : ""}
                    <span class="${blinkClass}" style="color:${color};font-weight:bold;margin-right:6px;">
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

            if (isQualified) row.classList.add("qualified");
            tableBody.appendChild(row);
        });

        previousRanks[groupKey] = newRanks;
    }

    // ================= DROPDOWNS =================
    function populateTeamSelects(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);
        const teams = groupData[groupKey];

        const fill = (sel, label) => {
            sel.innerHTML = `<option disabled selected>${label}</option>`;
            teams.forEach(team => {
                const opt = new Option(team.name, team.name);
                if (team.won + team.lost >= MAX_MATCHES) opt.disabled = true;
                sel.appendChild(opt);
            });
        };

        fill(winSel, "Select Winner");
        fill(loseSel, "Select Loser");
        filterLoserSelect(groupKey);
    }

    function filterLoserSelect(groupKey) {
        const winSel = document.getElementById(`winningTeam${groupKey}`);
        const loseSel = document.getElementById(`losingTeam${groupKey}`);

        loseSel.innerHTML = '<option disabled selected>Select Loser</option>';

        groupData[groupKey].forEach(team => {
            if (team.name === winSel.value) return;
            const opt = new Option(team.name, team.name);
            if (team.won + team.lost >= MAX_MATCHES) opt.disabled = true;
            loseSel.appendChild(opt);
        });
    }

    // ================= MATCH LOGIC =================
    function calculateAndApplyScores(arr, winnerName, loserName, lostRounds) {
        const winner = arr.find(t => t.name === winnerName);
        const loser = arr.find(t => t.name === loserName);
        const roundPts = ROUNDS_MAPPING[lostRounds] || 0;

        winner.won++;
        winner.roundsPoints += roundPts;
        winner.totalPoints = winner.won * POINTS_PER_WIN;

        loser.lost++;
        loser.roundsPoints -= roundPts;
        loser.totalPoints = loser.won * POINTS_PER_WIN;
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const g = e.target.getAttribute("data-group");

        calculateAndApplyScores(
            groupData[g],
            document.getElementById(`winningTeam${g}`).value,
            document.getElementById(`losingTeam${g}`).value,
            parseInt(document.getElementById(`lostRounds${g}`).value)
        );

        matchCount[g]++;
        saveData();
        renderTable(g);
        e.target.reset();
        populateTeamSelects(g);
    }

    document.getElementById('matchFormA').addEventListener('submit', handleFormSubmit);
    document.getElementById('matchFormB').addEventListener('submit', handleFormSubmit);

    // ================= TIE BREAKER (UNCHANGED) =================
    function populateTieBreakerTeams() {
        const groupKey = document.getElementById("tieGroupSelect").value;
        const teams = groupData[groupKey];

        const t1 = document.getElementById("tieTeam1");
        const t2 = document.getElementById("tieTeam2");

        t1.innerHTML = '<option disabled selected>Select Team 1</option>';
        t2.innerHTML = '<option disabled selected>Select Team 2</option>';

        teams.forEach(team => {
            const played = team.won + team.lost;
            if (played < MAX_MATCHES) return;
            t1.appendChild(new Option(team.name, team.name));
            t2.appendChild(new Option(team.name, team.name));
        });
    }

    function applyTieBreaker(groupKey, team1, team2, penalty) {
        const arr = groupData[groupKey];
        const t1 = arr.find(t => t.name === team1);
        const t2 = arr.find(t => t.name === team2);

        if (!t1 || !t2) return;

        t1.lost++;
        t2.lost++;

        t1.roundsPoints -= penalty;
        t2.roundsPoints -= penalty;

        t1.totalPoints = t1.won * POINTS_PER_WIN;
        t2.totalPoints = t2.won * POINTS_PER_WIN;

        saveData();
        renderTable(groupKey);
    }

    document.getElementById("tieGroupSelect").addEventListener("change", populateTieBreakerTeams);
    document.getElementById("tieApplyBtn").addEventListener("click", () => {
        const groupKey = document.getElementById("tieGroupSelect").value;
        applyTieBreaker(
            groupKey,
            document.getElementById("tieTeam1").value,
            document.getElementById("tieTeam2").value,
            parseInt(document.getElementById("tiePenalty").value)
        );
    });

    // ================= INIT =================
    loadData();
    populateTeamSelects("A");
    populateTeamSelects("B");
    renderTable("A");
    renderTable("B");

    document.getElementById("winningTeamA").addEventListener("change", () => filterLoserSelect("A"));
    document.getElementById("winningTeamB").addEventListener("change", () => filterLoserSelect("B"));
});

// ================= RESET BUTTON =================
document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (confirm("Are you sure? This will clear all tournament data.")) {
        localStorage.removeItem('tournamentDataGroups');
        location.reload();
    }
});
