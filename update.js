const fs = require("fs");

const file = "price.json";
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
let price = data.price;

// ----------------------
// Magnitude logic
// ----------------------
function randomMagnitude() {
    const roll = Math.random() * 100;
    if (roll < 65) return 1 + Math.floor(Math.random() * 5);
    if (roll < 90) return 5 + Math.floor(Math.random() * 5);
    if (roll < 98) return 10 + Math.floor(Math.random() * 5);
    return 20 + Math.floor(Math.random() * 10);
}

// ----------------------
// Direction logic (up-biased)
// ----------------------
function randomChange() {
    const mag = randomMagnitude();

    // Hard floor
    if (price <= 1) return +mag;

    // Hard ceiling
    if (price >= 150) return -mag;

    // Strong recovery at low price
    if (price <= 20) {
        return (Math.random() < 0.85 ? 1 : -1) * mag; // 85% UP
    }

    // Moderate up-bias in normal zone
    if (price <= 80) {
        return (Math.random() < 0.65 ? 1 : -1) * mag; // 65% UP
    }

    // Slight correction at high price
    if (price >= 130) {
        return (Math.random() < 0.60 ? -1 : 1) * mag; // 60% DOWN
    }

    return (Math.random() < 0.55 ? 1 : -1) * mag; // Default gentle uptrend
}

// ----------------------
// Rarity label
// ----------------------
function rarityFromChange(change) {
    const abs = Math.abs(change);
    if (abs <= 5) return "Common";
    if (abs <= 10) return "Uncommon";
    if (abs <= 20) return "Rare";
    return "Extremely Rare";
}

// ----------------------
// Apply price update
// ----------------------
let change = randomChange();
let newPrice = price + change;

// Clamp limits
if (newPrice < 1) {
    change = 1 - price;
    newPrice = 1;
}
if (newPrice > 150) {
    change = 150 - price;
    newPrice = 150;
}

// Save history
data.history.unshift({
    change: change,
    rarity: rarityFromChange(change),
    timestamp: new Date().toISOString()
});

// Save state
data.price = newPrice;
data.last_update = new Date().toISOString();
data.next_change_prediction = Math.abs(randomChange());

// Trim history
data.history = data.history.slice(0, 300);

fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
