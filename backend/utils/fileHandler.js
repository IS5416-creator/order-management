const fs = require("fs");

function readData(filePath) {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };
