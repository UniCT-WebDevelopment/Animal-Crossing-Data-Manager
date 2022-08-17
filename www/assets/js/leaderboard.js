const table = document.querySelector("table tbody");
const chatBtn = document.querySelector("a[href='chat.html']");
const encyclopedia = document.querySelector(".navbar-start > .has-dropdown");

window.addEventListener('load', () => {
    fetch(`/get/leaderboard`)
    .then(res => res.json())
    .then(players => {
        players.forEach(player => {
            const tr = document.createElement("tr");

            const username = document.createElement("th");
            username.innerText = player.username;

            const score = document.createElement("td");
            score.innerText = player.score;

            const insects = document.createElement("td");
            insects.innerText = player.insects;
            const fishes = document.createElement("td");
            fishes.innerText = player.fishes;
            const seaCreatures = document.createElement("td");
            seaCreatures.innerText = player["sea_creatures"];
            
            tr.append(username, score, insects, fishes, seaCreatures);
            table.appendChild(tr);
        })
    });
    if (localStorage.length) {
        chatBtn.classList.remove("is-hidden");
        encyclopedia.classList.remove("is-hidden");
    } else {
        chatBtn.classList.add("is-hidden");
        encyclopedia.classList.add("is-hidden");
    }

});