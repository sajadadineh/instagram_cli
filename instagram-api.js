const { IgApiClient } = require("instagram-private-api");

const { chalk_red, chalk_blue, chalk_green } = require("./utils");

const ig = new IgApiClient();

// use instagram-private-api in npm for login and send direct in instagram
module.exports.loginInstagramAndSendDirect = loginInstagramAndSendDirect;
async function loginInstagramAndSendDirect(
  sendMessage,
  username,
  password,
  id,
  message
) {
  ig.state.generateDevice(username);
  //login
  try {
    await ig.simulate.preLoginFlow();
    await ig.account.login(username, password);
    console.log(
      chalk_blue(
        "user logged in, username and password is correct and save in db "
      )
    );
  } catch (error) {
    console.log(
      chalk_red("user did not log in, username and password is incorrect ") +
        error
    );
  }
  if (sendMessage === true) {
    // send direct
    try {
      const userId = await ig.user.getIdByUsername(id);
      const thread = ig.entity.directThread([userId.toString()]);
      await thread.broadcastText(message);
      console.log(chalk_green("Message sent"));
    } catch (error) {
      console.log(chalk_red("could not send message") + error);
    }
  }
}
