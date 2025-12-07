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

    if (roll < 70) return 1 + Math.floor(Math.random() * 5);
    if (roll < 90) return 5 + Math.floor(Math.random() * 5);
    if (roll < 98) return 10 + Math.floor(Math.random() * 5);
    return 20 + Math.floor(Math.random() * 10);
}

// ----------------------
// Change logic with floor/ceiling
// ----------------------
function randomChange() {
    const mag = randomMagnitude();

    // HARD FLOOR
    if (price <= 1) {
        return +mag;
    }

    // HARD CEILING
    if (price >= 150) {
        return -mag;
    }

    // Low price anti-inflation
    if (price <= 30) {
        return (Math.random() < 0.75 ? 1 : -1) * mag;
    }

    // High price anti-bubble
    if (price >= 130) {
        return (Math.random() < 0.65 ? -1 : 1) * mag;
    }

    // Normal market
    return (Math.random() < 0.5 ? 1 : -1) * mag;
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

// Enforce HARD LIMITS
if (newPrice < 1) {
    change = 1 - price;
    newPrice = 1;
}
if (newPrice > 150) {
    change = 150 - price;
    newPrice = 150;
}

// Update history
data.history.unshift({
    change: change,
    rarity: rarityFromChange(change),
    timestamp: new Date().toISOString()
});

// Update state
data.price = newPrice;
data.last_update = new Date().toISOString();
data.next_change_prediction = Math.abs(randomChange());

// Trim history
data.history = data.history.slice(0, 300);

// Save
fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
