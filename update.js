const fs = require("fs");

// Load JSON
let data = JSON.parse(fs.readFileSync("price.json", "utf8"));
let price = data.price;

// Weighted rarity ranges
function getRandomChange() {
    const roll = Math.random() * 100;

    if (roll < 70) return { amount: randBetween(1, 5), rarity: "Common" };         // 70%
    if (roll < 90) return { amount: randBetween(5, 10), rarity: "Uncommon" };     // 20%
    if (roll < 99) return { amount: randBetween(10, 15), rarity: "Rare" };        // 9%
    return { amount: randBetween(20, 30), rarity: "Extremely Rare" };             // 1%
}

// Random integer between two values
function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random direction (up/down)
const dir = Math.random() < 0.5 ? -1 : 1;

// Get weighted change
const changeInfo = getRandomChange();
let newPrice = price + dir * changeInfo.amount;

// Price cannot drop below 1
if (newPrice < 1) {
    newPrice = 1;
}

// Save history entry
const entry = {
    change: dir * changeInfo.amount,
    newPrice: newPrice,
    timestamp: new Date().toISOString(),
    rarity: changeInfo.rarity
};

data.price = newPrice;
data.last_update = new Date().toISOString();
data.history.unshift(entry);

// Keep last 200 records (optional)
data.history = data.history.slice(0, 200);

// Save updated JSON
fs.writeFileSync("price.json", JSON.stringify(data, null, 2));

console.log("Updated price:", newPrice);
