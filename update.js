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
    if (roll < 60) return 1 + Math.floor(Math.random() * 5);
    if (roll < 90) return 5 + Math.floor(Math.random() * 5);
    if (roll < 98) return 10 + Math.floor(Math.random() * 5);
    return 15 + Math.floor(Math.random() * 10);
}

// ----------------------
// Direction logic (HEAVY UP BIAS)
// ----------------------
function randomChange() {
    const mag = randomMagnitude();

    // HARD FLOOR
    if (price <= 1) {
        return +(mag + 5);
    }

    // HARD CEILING
    if (price >= 150) {
        return -mag;
    }

    // Very low price = near-always rise
    if (price <= 20) {
        return (Math.random() < 0.98 ? 1 : -1) * mag;  // 98% UP
    }

    // Low–mid price = strong rise
    if (price <= 60) {
        return (Math.random() < 0.90 ? 1 : -1) * mag;  // 90% UP
    }

    // Normal zone = mostly rising
    if (price <= 100) {
        return (Math.random() < 0.80 ? 1 : -1) * mag;  // 80% UP
    }

    // High price = still rises but rare drops
    if (price <= 130) {
        return (Math.random() < 0.70 ? 1 : -1) * mag;  // 70% UP
    }

    // Near ceiling = light corrections
    return (Math.random() < 0.60 ? 1 : -1) * mag;      // 60% UP
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
// Apply update
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
