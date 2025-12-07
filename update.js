const fs = require("fs");

const file = "price.json";
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
let price = data.price;

// ----------------------
// Magnitude Bias Function
// ----------------------
function randomMagnitude() {
    const roll = Math.random() * 100;

    if (price <= 30) {
        // Low price → stronger upward pressure
        if (roll < 50) return 5 + Math.floor(Math.random() * 10);   // 5–15 common when cheap
        if (roll < 85) return 10 + Math.floor(Math.random() * 10);  // 10–20 uncommon
        return 20 + Math.floor(Math.random() * 15);                 // 20–35 rare spike
    }

    if (roll < 70) return 1 + Math.floor(Math.random() * 5);
    if (roll < 90) return 5 + Math.floor(Math.random() * 5);
    if (roll < 98) return 10 + Math.floor(Math.random() * 5);

    return 20 + Math.floor(Math.random() * 10);
}

// ----------------------
// Direction Bias (Anti Inflation)
// ----------------------
function randomChange() {
    let direction;

    if (price <= 30) {
        direction = Math.random() < 0.80 ? 1 : -1;  // 80% UP when price is very low
    } 
    else if (price <= 60) {
        direction = Math.random() < 0.65 ? 1 : -1;  // 65% UP
    } 
    else if (price >= 150) {
        direction = Math.random() < 0.65 ? -1 : 1;  // Anti-bubble if price gets crazy
    } 
    else {
        direction = Math.random() < 0.5 ? 1 : -1;   // Normal zone
    }

    return direction * randomMagnitude();
}

// ----------------------
// Rarity Labeling
// ----------------------
function rarityFromChange(change) {
    const abs = Math.abs(change);
    if (abs <= 5) return "Common";
    if (abs <= 10) return "Uncommon";
    if (abs <= 20) return "Rare";
    return "Extremely Rare";
}

// ----------------------
// Apply Change
// ----------------------
let change = randomChange();
let newPrice = price + change;

// Hard floor
if (newPrice < 10) {
    change = 10 - price;
    newPrice = 10;
}

// Append history
data.history.unshift({
    change: change,
    rarity: rarityFromChange(change),
    timestamp: new Date().toISOString()
});

// Save values
data.price = newPrice;
data.last_update = new Date().toISOString();
data.next_change_prediction = Math.abs(randomChange());

// Trim history
data.history = data.history.slice(0, 300);

fs.writeFileSync(file, JSON.stringify(data, null, 2));

console.log("Anti-inflation update → Price:", newPrice);
