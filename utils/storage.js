const fs = require("fs");

const FILE = "./data/alerts.json";

function loadAlerts() {

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
  }

  return JSON.parse(fs.readFileSync(FILE));
}

function saveAlerts(alerts) {
  fs.writeFileSync(FILE, JSON.stringify(alerts, null, 2));
}

function addAlert(alert) {

  const alerts = loadAlerts();

  alerts.push(alert);

  saveAlerts(alerts);

}

module.exports = { loadAlerts, saveAlerts, addAlert };
