let killers = [];
let addons = [];

async function loadData() {
    const killersRes = await fetch("data/killers.json");
    const killersJson = await killersRes.json();
    killers = killersJson.killers;

    const addonsRes = await fetch("data/addons.json");
    const addonsJson = await addonsRes.json();
    addons = addonsJson.addons;
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomKiller() {
    return randomItem(killers);
}

function getRandomPerk(killer) {
    return randomItem(killer.perks);
}

function getRandomAddon() {
    return randomItem(addons);
}

function generateLoadout() {
    const killer = getRandomKiller();
    const perk = getRandomPerk(killer);

    const addon1 = getRandomAddon();
    const addon2 = getRandomAddon(); // hope you don't roll double Iri LOL

    // Render items
    document.getElementById("killer-name").textContent = killer.name;
    document.getElementById("killer-img").src = killer.image;

    const perkImg = typeof perk === "string" ? perk : perk.image;
    document.getElementById("perk-img").src = perkImg;

    const addon1Img = typeof addon1 === "string" ? addon1 : addon1.image;
    const addon2Img = typeof addon2 === "string" ? addon2 : addon2.image;

    document.getElementById("addon1-img").src = addon1Img;
    document.getElementById("addon2-img").src = addon2Img;
}

window.onload = async () => {
    await loadData();
    generateLoadout();

    document.getElementById("roll-btn").addEventListener("click", generateLoadout);
};