const chalk = require("chalk");
const prompt = require("prompt"),
  optimist = require("optimist");

const { db } = require("./db");

prompt.start();
prompt.override = optimist.argv;

// chalk color for output message
exports.chalk_red = (str) => chalk.bgRed(chalk.black(str));
exports.chalk_blue = (str) => chalk.bgBlue(chalk.black(str));
exports.chalk_green = (str) => chalk.bgGreen(chalk.black(str));

// get input from the user and save in db
exports.getPromptAndPutDB = (question, key, message) => {
  return new Promise((resolve, reject) => {
    prompt.get(question, (err, result) => {
      if (err) reject(console.log(err));
      db.put(key, result[question]);
      resolve(console.log(this.chalk_blue(message)));
    });
  });
};
