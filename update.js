const fs = require("fs");

const file = "price.json";
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
let price = data.price;

// ----------------------
// Random change function
// ----------------------
function randomChange() {
    const roll = Math.random() * 100;
    let amount;

    if (roll < 70) amount = 1 + Math.floor(Math.random() * 5);       // common 1–5
    else if (roll < 90) amount = 5 + Math.floor(Math.random() * 5);  // uncommon 5–10
    else if (roll < 98) amount = 10 + Math.floor(Math.random() * 5); // rare 10–15
    else amount = 20 + Math.floor(Math.random() * 10);               // extremely rare 20–30

    const dir = Math.random() < 0.5 ? -1 : 1; // fair 50/50
    return dir * amount;
}

// ----------------------
// Rarity helper
// ----------------------
function rarityFromChange(change) {
    const abs = Math.abs(change);
    if (abs <= 5) return "Common";
    if (abs <= 10) return "Uncommon";
    if (abs <= 15) return "Rare";
    return "Extremely Rare";
}

// ----------------------
// 1. Apply actual change
// ----------------------
const change = randomChange();
let newPrice = price + change;

// Ensure minimum price
if (newPrice < 1) {
    change = 1 - price;
    newPrice = 1;
}

// Append to history
const entry = {
    change: change,
    rarity: rarityFromChange(change),
    timestamp: new Date().toISOString()
};

data.price = newPrice;
data.history.unshift(entry);
data.history = data.history.slice(0, 200);

// ----------------------
// 2. Create forecast for next update
// ----------------------
const forecastChange = randomChange();
data.next_change_prediction = Math.abs(forecastChange);

// ----------------------
// 3. Last update timestamp
// ----------------------
data.last_update = new Date().toISOString();

// ----------------------
// Save JSON
// ----------------------
fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
console.log("Next predicted change:", data.next_change_prediction);
