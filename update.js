const fs = require("fs");

const file = "price.json";
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
let price = data.price;

// ----------------------
// Weighted change magnitude
// ----------------------
function randomWeightedMagnitude() {
    const roll = Math.random() * 100;
    if (roll < 70) return 1 + Math.floor(Math.random() * 5);       // common 1–5
    if (roll < 90) return 5 + Math.floor(Math.random() * 5);       // uncommon 5–10
    if (roll < 98) return 10 + Math.floor(Math.random() * 5);      // rare 10–15
    return 20 + Math.floor(Math.random() * 10);                     // extremely rare 20–30
}

// ----------------------
// Generate random change (up or down)
// ----------------------
function randomChange() {
    const magnitude = randomWeightedMagnitude();
    const dir = Math.random() < 0.5 ? -1 : 1; // 50% chance up/down
    return dir * magnitude;
}

// ----------------------
// Determine rarity based on magnitude
// ----------------------
function rarityFromChange(change) {
    const abs = Math.abs(change);
    if (abs <= 5) return "Common";
    if (abs <= 10) return "Uncommon";
    if (abs <= 15) return "Rare";
    return "Extremely Rare";
}

// ----------------------
// Apply actual change
// ----------------------
let change = randomChange();
let newPrice = price + change;

// Ensure price never goes below 1
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
// Forecast next update
// ----------------------
const forecastChange = randomChange();
data.next_change_prediction = Math.abs(forecastChange);

// ----------------------
// Last update timestamp
// ----------------------
data.last_update = new Date().toISOString();

// ----------------------
// Save JSON
// ----------------------
fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
console.log("Next predicted change:", data.next_change_prediction);
