const fs = require("fs");

const file = "price.json";
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
let price = data.price;

// ----------------------
// Weighted magnitude (fair for both directions)
// ----------------------
function randomMagnitude() {
    const roll = Math.random() * 100;
    if (roll < 70) return 1 + Math.floor(Math.random() * 5);       // 1–5 (70%)
    if (roll < 90) return 5 + Math.floor(Math.random() * 5);       // 5–10 (20%)
    if (roll < 98) return 10 + Math.floor(Math.random() * 5);      // 10–15 (8%)
    return 20 + Math.floor(Math.random() * 10);                     // 20–30 (2%)
}

// ----------------------
// 50/50 direction logic
// ----------------------
function randomChange() {
    const dir = Math.random() < 0.5 ? -1 : 1; // EXACTLY 50/50
    const magnitude = randomMagnitude();
    return dir * magnitude;
}

// ----------------------
// Rarity label
// ----------------------
function rarityFromChange(change) {
    const abs = Math.abs(change);
    if (abs <= 5) return "Common";
    if (abs <= 10) return "Uncommon";
    if (abs <= 15) return "Rare";
    return "Extremely Rare";
}

// ----------------------
// Apply change
// ----------------------
let change = randomChange();
let newPrice = price + change;

// Prevent price going below 1
if (newPrice < 1) {
    change = 1 - price;
    newPrice = 1;
}

// Save entry
data.history.unshift({
    change: change,
    rarity: rarityFromChange(change),
    timestamp: new Date().toISOString()
});

// Update values
data.price = newPrice;
data.last_update = new Date().toISOString();

// Predict next change (50/50, for warnings)
data.next_change_prediction = Math.abs(randomChange());

// Trim history
data.history = data.history.slice(0, 200);

// Save file
fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
