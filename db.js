const levelup = require("levelup");
const leveldown = require("leveldown");

const db = levelup(leveldown("./mydb"));

exports.db = db;
