const fs = require("fs");

const file = "price.json";
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
let price = data.price;
let upStreak = data.up_streak || 0;

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
// Change logic (5 ups → forced drop)
// ----------------------
function randomChange() {
    const mag = randomMagnitude();

    // HARD FLOOR
    if (price <= 1) return +(mag + 5);

    // HARD CEILING
    if (price >= 150) return -mag;

    // 🔁 Every 5 increases → force a drop
    if (upStreak >= 5) {
        return -mag;
    }

    // Normal: mostly goes up
    return (Math.random() < 0.85 ? 1 : -1) * mag;
}

// ----------------------
// Rarity labels
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

// ✅ Update streak logic
if (change > 0) {
    upStreak++;
} else {
    upStreak = 0; // reset after a drop
}

// Save history
data.history.unshift({
    change: change,
    rarity: rarityFromChange(change),
    timestamp: new Date().toISOString()
});

// Save state
data.price = newPrice;
data.up_streak = upStreak;
data.last_update = new Date().toISOString();
data.next_change_prediction = Math.abs(randomMagnitude());

// Trim history
data.history = data.history.slice(0, 300);

// Save file
fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
console.log("Up streak:", upStreak);
