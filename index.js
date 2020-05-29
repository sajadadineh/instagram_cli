#!/usr/bin/env node
'use strict';

const { IgApiClient } = require("instagram-private-api");
const { program } = require('commander');
const chalk = require('chalk')
const levelup = require('levelup');
const leveldown = require('leveldown');
const R = require('ramda')
const prompt = require('prompt'),
      optimist = require('optimist')

const ig = new IgApiClient();
var db = levelup(leveldown('./mydb'));

prompt.override = optimist.argv
prompt.start();

program
    .command('login')
    .description('login in instagram')
    .action(function(){
        prompt.get(['username', 'password'], function (err, result) {
            db.batch()
                .put('username', result.username)
                .put('password', result.password)
                .write(function () { console.log(chalk.bgBlue(chalk.black('processing ...')))})
            Promise.all([
                db.get('username'),
                db.get('password')
            ])
            .then((arr)=>{
                checkUsernameAndPassword(arr[0].toString(),arr[1].toString())
            })
          })
    })

program
    .command('message')
    .description('message in direct')
    .action(function(){
        prompt.get(['message', 'id'], function (err, result) {
            db.batch()
                .put('message', result.message)
                .put('id', result.id)
                .write(function () { console.log(chalk.bgGrey(chalk.black('save message and id in db')))})
            Promise.all([
                db.get("username"),
                db.get("password"),
                db.get("id"),
                db.get("message"),
            ]).then((arr)=>{
                processing(arr[0].toString(),arr[1].toString(),arr[2].toString(),arr[3].toString())
            })
          })
    })

program.parse(process.argv);

async function checkUsernameAndPassword(username, password){
    ig.state.generateDevice(username);
    try {
        await ig.simulate.preLoginFlow();
        await ig.account.login(username,password);
        console.log(chalk.bgGrey(chalk.black("username and password is correct and save in db")));
    } catch (error) {
        console.log(chalk.bgRed(chalk.black("username and password is incorrect ")) +error);
        db.batch()
            .del('username')
            .del('password')
    }
}

async function processing(username, password, id, message){
    ig.state.generateDevice(username);
    //login
    try {
        await ig.simulate.preLoginFlow();
        await ig.account.login(username, password);
        console.log(chalk.bgBlue(chalk.black("user logged in")));
    } catch (error) {
        console.log(chalk.bgRed(chalk.black("user did not log in")) +error);
    }
    //send direct
    try {
        const userId = await ig.user.getIdByUsername(id);
        const thread = ig.entity.directThread([userId.toString()]);
        await thread.broadcastText(message);
        console.log(chalk.bgGreen(chalk.black("Message sent")));
    } catch (error) {
        console.log(chalk.bgRed(chalk.black("could not send message")) +error);
    }
};
