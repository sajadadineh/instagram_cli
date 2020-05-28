#!/usr/bin/env node
'use strict';

const { IgApiClient } = require("instagram-private-api");
const { program } = require('commander');
const chalk = require('chalk')

program
  .requiredOption('-u, --username <type>', 'username on instagram')
  .requiredOption('-p, --password <type>', 'user password')
  .requiredOption('-m, --message <type>', 'send the message you want')
  .requiredOption('-d, --desiredUsername <type>', 'the username you want to message')
  .parse(process.argv);

const ig = new IgApiClient();
ig.state.generateDevice(`${program.username}`);

(async () => {
    //login
    try {
        await ig.simulate.preLoginFlow();
        await ig.account.login(`${program.username}`, `${program.password}`);
        console.log(chalk.bgBlue(chalk.black("user logged in")));
    } catch (error) {
        console.log(chalk.bgRed(chalk.black("user did not log in")) +error);
    }
    //send direct
    try {
        const userId = await ig.user.getIdByUsername(`${program.desiredUsername}`);
        const thread = ig.entity.directThread([userId.toString()]);
        await thread.broadcastText(`${program.message}`);
        console.log(chalk.bgGreen(chalk.black("Message sent")));
    } catch (error) {
        console.log(chalk.bgRed(chalk.black("could not send message")) +error);
    }
  })();