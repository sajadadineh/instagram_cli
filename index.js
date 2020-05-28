#!/usr/bin/env node

const { IgApiClient } = require("instagram-private-api");

const ig = new IgApiClient();

ig.state.generateDevice("username");

(async () => {
  await ig.simulate.preLoginFlow();
  await ig.account.login("username", "password");
  console.log("The user logged in")
})();
