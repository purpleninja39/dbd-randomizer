let killers = [];
let addons = [];
let allPerks = [];

let currentKiller = null;

//Loads in the data from our json files, killers, addons, and perks
async function loadData() {
    const killersRes = await fetch("data/killers.json");
    const killersJson = await killersRes.json();
    killers = killersJson.killers;

    const addonsRes = await fetch("data/addons.json");
    const addonsJson = await addonsRes.json();
    addons = addonsJson.addons;

    const perksRes = await fetch("data/perks.json");
    const perksJson = await perksRes.json();
    allPerks = perksJson.perks;

    loadSavedStatuses();
}

//Returns random item from an array
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


//Returns a list of killers that are still valid
//A killer is only valid if one of their perks has status: "O"
//This logic is kind of circular, since a killer is diabled by setting their perks to "X"
//But I'll be damned before I go back and edit the killers.json file LOOOOL
function getAvailableKillers() {

    return killers.filter(killer => {
        // Find perks belonging to this killer
        const killerPerks = allPerks.filter(
            //This is very fallible, as I typed in the killers' name by hand.
            perk => perk.from === killer.name
        );
        // This'll return true if one the killer's perks is available, therefore
        // adding the killer to the returned array.
        return killerPerks.some(
            perk => perk.status === "O"
        );
    });
}

//This grabs the available killers, then selects a random one
function getRandomKiller() {
    const availableKillers =
        getAvailableKillers();
    if (availableKillers.length === 0) {
        return null;
    }
    return randomItem(availableKillers);
}

//Selects a random adept perk from the chosen killer
function getRandomAdeptPerk(killer) {
    return randomItem(killer.perks);
}

//Incidentially, this function is weighted kind of strangely.
//Brown add-ons and Iridescent add-ons are half as likely to be chosen
function getRandomAddon() {
    return randomItem(addons);
}


//Populates the 3 perk dropdowns, only showing available perks (status: O)
function populateDropdowns() {
    // Only allow active perks, also alphabetizes them
    const availablePerks = allPerks
        .filter(perk => perk.status === "O")
        .sort((a, b) => a.name.localeCompare(b.name));

    // Store references to the 3 dropdowns
    const selects = [
        document.getElementById("perk-select-1"),
        document.getElementById("perk-select-2"),
        document.getElementById("perk-select-3")
    ];

    // Populate each dropdown
    selects.forEach(select => {

        // Clear existing options
        select.innerHTML = "";

        // Add all available perks
        availablePerks.forEach(perk => {
            const option = document.createElement("option");
            option.value = perk.name;
            option.textContent = perk.name;
            select.appendChild(option);
        });
    });
}


//This perk generates a random loadout, consisting of:
//-A random killer
//-A random adept perk from that killer
//-Two random addons
//-Refreshing the perk dropdowns showing the available perks
function generateLoadout() {
    currentKiller = getRandomKiller();
    const killer = currentKiller;
    if (!killer) {
        return;
    }

    const perk = getRandomAdeptPerk(killer);

    const addon1 = getRandomAddon();
    const addon2 = getRandomAddon(); // hope you don't roll double Iri LOL

    // Render killer elements
    document.getElementById("killer-name").textContent = killer.name;
    document.getElementById("killer-img").src = killer.image;

    const perkImg = typeof perk === "string" ? perk : perk.image;
    document.getElementById("perk-img").src = perkImg;

    document.getElementById("addon1-img").src = addon1.image;
    document.getElementById("addon2-img").src = addon2.image;

    //Refreshes dropdowns
    populateDropdowns();
}

//Records a loss
//All the current killers' perks are disabled.
//Any general perks currently selected are disabled
//Generates a new loadout.
function recordLoss() {

    // Safety check
    if (!currentKiller) return;

    // Read selected dropdown perks
    const selectedPerks = [
        document.getElementById("perk-select-1").value,
        document.getElementById("perk-select-2").value,
        document.getElementById("perk-select-3").value
    ];

    // Iterate through every perk
    // Honestly there's probably an easier way to do this but I'm stupid LOL
    allPerks.forEach(perk => {

        // Disable killer-specific perks
        const isKillerPerk =
            perk.from === currentKiller.name;

        // Disable selected General perks
        const isSelectedGeneralPerk =
            perk.from === "General" &&
            selectedPerks.includes(perk.name);

        // Mark as disabled
        if (isKillerPerk || isSelectedGeneralPerk) {
            perk.status = "X";
        }
    });

    // Save changes
    saveStatuses();

    // Check if any killers remain
    const availableKillers = getAvailableKillers();

    // No killers left
    if (availableKillers.length === 0) {

        // Display message
        document.getElementById("end-message").textContent =
            "All killers have been eliminated. Better luck next time!";

        // Play sound
        const sound =
            document.getElementById("end-sound");

        sound.currentTime = 0;
        sound.play();

        return;
    }

    // Generate next loadout
    generateLoadout();
}

// Saves perk statuses.
// Should persist after browser refresh
function saveStatuses() {
    localStorage.setItem(
        "perkStatuses",
        JSON.stringify(allPerks)
    );
}

// Loads the perk statuses
// This'll save the streak/challenge info after refresh or closing
function loadSavedStatuses() {

    const saved =
        localStorage.getItem("perkStatuses");

    // Nothing saved yet
    if (!saved) return;

    const savedPerks = JSON.parse(saved);

    // Apply saved statuses
    allPerks.forEach(perk => {
        const savedVersion = savedPerks.find(
            p => p.name === perk.name
        );
        if (savedVersion) {
            perk.status = savedVersion.status;
        }
    });
}

// This function will run after the website loads
// -Loads all JSON data
// -Generates the current loadout
// -Attaches button listeners
window.onload = async () => {
    await loadData();
    generateLoadout();

    // Roll button
    document
        .getElementById("roll-btn")
        .addEventListener("click", generateLoadout);
    // Loss button
    document
        .getElementById("loss-btn")
        .addEventListener("click", recordLoss);

    initializeChaosPage();
};

// This function will return count random, non-repeating items from arr.
function getRandomUniqueItems(arr, count) {
    // Clone array so original is untouched
    const shuffled = [...arr];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(
            Math.random() * (i + 1)
        );
        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

function generateChaosBuild() {
    // Random killer
    const killer =
        randomItem(killers);
    // Random perks
    const perks =
        getRandomUniqueItems(allPerks, 4);
    // Random addons
    const addon1 =
        getRandomAddon();
    const addon2 =
        getRandomAddon();

    // Render killer
    document.getElementById(
        "killer-name"
    ).textContent = killer.name;

    document.getElementById(
        "killer-img"
    ).src = killer.image;

    // Render perks
    document.getElementById(
        "perk1-img"
    ).src = perks[0].image;

    document.getElementById(
        "perk2-img"
    ).src = perks[1].image;

    document.getElementById(
        "perk3-img"
    ).src = perks[2].image;

    document.getElementById(
        "perk4-img"
    ).src = perks[3].image;

    // Render addons
    document.getElementById(
        "addon1-img"
    ).src = addon1.image;

    document.getElementById(
        "addon2-img"
    ).src = addon2.image;
}

function initializeChaosPage() {
    // Prevent errors if page
    // doesn't contain chaos UI
    const button =
        document.getElementById(
            "roll-random-btn"
        );
    if (!button) return;

    generateChaosBuild();

    button.addEventListener(
        "click",
        generateChaosBuild
    );
}