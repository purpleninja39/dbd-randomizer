let killers = [];

async function loadKillers() {
    const res = await fetch("data/killers.json");
    const data = await res.json();
    killers = data.killers;
}

function getRandomKiller() {
    return killers[Math.floor(Math.random() * killers.length)];
}

function showRandomKiller() {
    const killer = getRandomKiller();

    document.getElementById("killer-name").textContent = killer.name;
    document.getElementById("killer-img").src = killer.image;
}

window.onload = async () => {
    await loadKillers();
    showRandomKiller();
};