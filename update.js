// update.js
const fs = require("fs");

const file = "price.json";
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
let price = data.price;

// Weighted rarity ranges (70/20/9/1)
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomChange() {
  const roll = Math.random() * 100;
  if (roll < 70) return { amount: randBetween(1, 5), rarity: "Common" };         // 70%
  if (roll < 90) return { amount: randBetween(5, 10), rarity: "Uncommon" };     // 20%
  if (roll < 99) return { amount: randBetween(10, 15), rarity: "Rare" };        // 9%
  return { amount: randBetween(20, 30), rarity: "Extremely Rare" };             // 1%
}

// Choose up/down fairly (50/50)
const dir = Math.random() < 0.5 ? -1 : 1;
const changeInfo = getRandomChange();

let change = dir * changeInfo.amount;
let newPrice = price + change;

// Enforce floor at 1
if (newPrice < 1) {
  change = 1 - price;
  newPrice = 1;
}

// Add entry to top of history
const entry = {
  change: change,
  newPrice: newPrice,
  timestamp: new Date().toISOString(),
  rarity: changeInfo.rarity
};

data.price = newPrice;
data.last_update = new Date().toISOString();
data.history.unshift(entry);

// keep a reasonable history size
data.history = data.history.slice(0, 200);

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("Updated price ->", newPrice, "change:", change, "rarity:", changeInfo.rarity);
