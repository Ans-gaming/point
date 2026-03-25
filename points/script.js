const STORAGE_KEY = "tournamentData";
const HISTORY_KEY = "history";
const TEAMS_KEY = "customTeams";

let groupData;

// ---------------- TEAM INPUT ----------------
function addTeamInput(value = "") {
    const div = document.createElement("div");
    div.innerHTML = `<input type="text" class="team-input" placeholder="Team Name" value="${value}">`;
    document.getElementById("teamInputs").appendChild(div);
}

document.getElementById("addTeamBtn").onclick = () => addTeamInput();

// ---------------- CREATE TOURNAMENT ----------------
document.getElementById("createTournamentBtn").onclick = () => {
    const inputs = document.querySelectorAll(".team-input");

    let teams = [];

    inputs.forEach(i => {
        if (i.value.trim()) {
            teams.push({
                name: i.value.trim(),
                won: 0,
                lost: 0,
                roundsPoints: 0,
                totalPoints: 0
            });
        }
    });

    if (teams.length < 2) return alert("Add at least 2 teams");

    const mid = Math.ceil(teams.length / 2);

    groupData = {
        A: teams.slice(0, mid),
        B: teams.slice(mid)
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData));
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));

    location.reload();
};

// ---------------- LOAD DATA ----------------
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        groupData = JSON.parse(saved);
    } else {
        groupData = { A: [], B: [] };
    }
}

// ---------------- RENDER TABLE ----------------
function renderTable(group) {
    const tbody = document.querySelector(`#pointTable${group} tbody`);
    const data = groupData[group];

    data.sort((a,b)=> b.totalPoints - a.totalPoints || b.roundsPoints - a.roundsPoints);

    tbody.innerHTML = "";

    data.forEach(t=>{
        const row = `<tr>
            <td>${t.name}</td>
            <td>${t.won+t.lost}</td>
            <td>${t.won}</td>
            <td>${t.lost}</td>
            <td>${t.roundsPoints}</td>
            <td>${t.totalPoints}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ---------------- DROPDOWN ----------------
function populate(group) {
    const win = document.getElementById(`winningTeam${group}`);
    const lose = document.getElementById(`losingTeam${group}`);

    win.innerHTML = "";
    lose.innerHTML = "";

    groupData[group].forEach(t=>{
        win.innerHTML += `<option>${t.name}</option>`;
        lose.innerHTML += `<option>${t.name}</option>`;
    });
}

// ---------------- MATCH ----------------
function applyMatch(group, w, l, r) {
    const win = groupData[group].find(t=>t.name===w);
    const lose = groupData[group].find(t=>t.name===l);

    win.won++;
    win.totalPoints = win.won * 4;
    win.roundsPoints += (10-r);

    lose.lost++;
    lose.roundsPoints -= (10-r);
}

// ---------------- SUBMIT ----------------
document.getElementById("matchFormA").onsubmit = handle;
document.getElementById("matchFormB").onsubmit = handle;

function handle(e){
    e.preventDefault();

    const g = e.target.dataset.group;

    const w = document.getElementById(`winningTeam${g}`).value;
    const l = document.getElementById(`losingTeam${g}`).value;
    const r = parseInt(document.getElementById(`lostRounds${g}`).value);

    if (w===l) return alert("Same team");

    applyMatch(g,w,l,r);

    save();
    renderTable(g);
}

// ---------------- SAVE ----------------
function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groupData));
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", ()=>{
    addTeamInput();
    addTeamInput();

    loadData();

    populate("A");
    populate("B");

    renderTable("A");
    renderTable("B");
});
