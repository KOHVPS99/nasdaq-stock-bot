const fs = require("fs");
const path = require("path");

const DATA_FILE = process.env.DATA_FILE || "./data/alerts.json";

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }
}

function readAlerts() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAlerts(alerts) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(alerts, null, 2), "utf8");
}

function addAlert(alert) {
  const alerts = readAlerts();
  alerts.push(alert);
  writeAlerts(alerts);
  return alert;
}

function removeUserAlert(userId, symbol, targetType = null) {
  const alerts = readAlerts();

  const filtered = alerts.filter((a) => {
    const sameUser = a.userId === userId;
    const sameSymbol = a.symbol === symbol.toUpperCase();
    const sameType = targetType ? a.targetType === targetType.toLowerCase() : true;

    return !(sameUser && sameSymbol && sameType);
  });

  const removedCount = alerts.length - filtered.length;
  writeAlerts(filtered);

  return removedCount;
}

function getAlerts() {
  return readAlerts();
}

function getUserAlerts(userId) {
  return readAlerts().filter((a) => a.userId === userId);
}

function removeAlertById(id) {
  const alerts = readAlerts();
  const filtered = alerts.filter((a) => a.id !== id);
  writeAlerts(filtered);
}

module.exports = {
  addAlert,
  getAlerts,
  getUserAlerts,
  removeUserAlert,
  removeAlertById
};
