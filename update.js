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
// Direction logic (high prices are rare)
// ----------------------
function randomChange() {
    const mag = randomMagnitude();

    // HARD FLOOR: price = 1 → strong forced rise
    if (price <= 1) {
        return +(mag + 5);
    }

    // Very low price (1–20): strong recovery
    if (price <= 20) {
        return (Math.random() < 0.90 ? 1 : -1) * mag;  // 90% UP
    }

    // Affordable range (21–60)
    if (price <= 60) {
        return (Math.random() < 0.65 ? 1 : -1) * mag;  // 65% UP
    }

    // Upper normal (61–100)
    if (price <= 100) {
        return (Math.random() < 0.45 ? 1 : -1) * mag;  // 55% DOWN
    }

    // High price (101–130)
    if (price <= 130) {
        return (Math.random() < 0.25 ? 1 : -1) * mag;  // 75% DOWN
    }

    // Extreme zone (131–150)
    return (Math.random() < 0.10 ? 1 : -1) * mag;      // 90% DOWN
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

// Save file
fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
