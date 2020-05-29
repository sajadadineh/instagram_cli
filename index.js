#!/usr/bin/env node
'use strict';

const { IgApiClient } = require("instagram-private-api");
const { program } = require('commander');
const chalk = require('chalk')
const levelup = require('levelup');
const leveldown = require('leveldown');
const prompt = require('prompt'),
      optimist = require('optimist')

const ig = new IgApiClient();
var db = levelup(leveldown('./mydb'));

prompt.override = optimist.argv
prompt.start();

const chalk_red = (str)=> chalk.bgRed(chalk.white(str));
const chalk_blue = (str)=> chalk.bgBlue(chalk.black(str));
const chalk_green = (str)=> chalk.bgGreen(chalk.black(str));
const chalk_db = (str)=> chalk.bgGrey(chalk.white(str));


program
    .command('get')
    .description('get data in db')
    .action(function(){
        db.createReadStream({ reverse:true})
            .on('data', function (data) {
                console.log(chalk_blue(data.key.toString()) ,'=', chalk_green( data.value.toString()))
            })
            .on('error', function (err) {
                console.log(err)
            })
    })

program
    .command('login')
    .description('login in instagram')
    .action(function(){
        prompt.get(['username', 'password'], function (err, result) {
            db.batch()
                .put('username', result.username)
                .put('password', result.password)
                .write(function () { console.log(chalk_blue('processing ...'))})
            Promise.all([
                db.get('username'),
                db.get('password')
            ])
            .then(arr => arr.map(element => element.toString())) // fix by iman ghvs
            .then((arr)=>{
                checkUsernameAndPassword(arr[0],arr[1])
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
                .write(function () { console.log(chalk_db('save message and id in db'))})
            Promise.all([
                db.get("username"),
                db.get("password"),
                db.get("id"),
                db.get("message"),
            ])
            .then(arr => arr.map(element => element.toString()))
            .then((arr)=>{
                processing(arr[0],arr[1],arr[2],arr[3])
            })
          })
    })

program.parse(process.argv);

async function checkUsernameAndPassword(username, password){
    ig.state.generateDevice(username);
    try {
        await ig.simulate.preLoginFlow();
        await ig.account.login(username,password);
        console.log(chalk_db("username and password is correct and save in db"));
    } catch (error) {
        console.log(chalk_red("username and password is incorrect ") +error);
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
        console.log(chalk_blue("user logged in"));
    } catch (error) {
        console.log(chalk_red("user did not log in") +error);
    }
    //send direct
    try {
        const userId = await ig.user.getIdByUsername(id);
        const thread = ig.entity.directThread([userId.toString()]);
        await thread.broadcastText(message);
        console.log(chalk_green("Message sent"));
    } catch (error) {
        console.log(chalk_red("could not send message") +error);
    }
};
