#!/usr/bin/env node

const { IgApiClient } = require("instagram-private-api");
const { program } = require('commander');

program
  .requiredOption('-u, --username <type>', 'username on instagram')
  .requiredOption('-p, --password <type>', 'user password')
  .requiredOption('-m, --message <type>', 'send the message you want')
  .requiredOption('-d, --desiredUsername <type>', 'the username you want to message')
  .parse(process.argv);

const ig = new IgApiClient();

ig.state.generateDevice(`${program.username}`);

(async () => {
  await ig.simulate.preLoginFlow();
  await ig.account.login(`${program.username}`, `${program.password}`);
  console.log("The user logged in")
  const userId = await ig.user.getIdByUsername(`${program.desiredUsername}`);
  const thread = ig.entity.directThread([userId.toString()]);
  await thread.broadcastText(`${program.message}`);
  console.log("Message sent")
})();
