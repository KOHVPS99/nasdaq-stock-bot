const fs = require("fs");

const file = "./data/alerts.json";

function load(){
return JSON.parse(fs.readFileSync(file));
}

function save(data){
fs.writeFileSync(file, JSON.stringify(data,null,2));
}

function addAlert(alert){

const alerts = load();

alerts.push(alert);

save(alerts);

}

module.exports = { addAlert, load, save };
