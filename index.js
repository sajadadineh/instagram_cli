#!/usr/bin/env node
"use strict";
const { program } = require("commander");

const { chalk_blue, chalk_green, getPromptAndPutDB } = require("./utils");
const { loginInstagramAndSendDirect } = require("./instagram-api");
const { db } = require("./db");

program
  .command("get")
  .description("get data in db")
  .action(function () {
    getDataInDB();
  });

program
  .command("login")
  .description("login in instagram")
  .action(function () {
    loginInInstagram();
  });

program
  .command("message")
  .description("message in direct")
  .action(function () {
    directMessage();
  });

program.parse(process.argv);

async function getDataInDB() {
  await db
    .createReadStream({ reverse: true })
    .on("data", function (data) {
      console.log(
        chalk_blue(data.key.toString()),
        "=",
        chalk_green(data.value.toString())
      );
    })
    .on("error", function (err) {
      console.log(err);
    });
}

async function loginInInstagram() {
  await getPromptAndPutDB("username", "username", "");
  await getPromptAndPutDB("password", "password", "processing ...");
  await Promise.all([db.get("username"), db.get("password")])
    .then((arr) => arr.map((element) => element.toString())) // fix by iman ghvs
    .then((arr) => {
      loginInstagramAndSendDirect(false, ...arr);
    });
}

async function directMessage() {
  await getPromptAndPutDB("message", "message", "");
  await getPromptAndPutDB("id", "id", "save message and id in db");
  await Promise.all([
    db.get("username"),
    db.get("password"),
    db.get("id"),
    db.get("message"),
  ])
    .then((arr) => arr.map((element) => element.toString()))
    .then((arr) => {
      loginInstagramAndSendDirect(true, ...arr);
    });
}
