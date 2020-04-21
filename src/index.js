#!/usr/bin/env node
const chalk = require("chalk")
const program = require("commander")
const inquirer = require("inquirer") 
const {defaultAction, getKommuneData} = require("./utils")

program
.version("0.1.0")
.arguments('[kommune]]')
.description("k eller kommune vil spesifisere kommune du søker etter")
.action(function(kommune, args){
    if(kommune){
        return getKommuneData(kommune)
    }else{
        defaultAction()
    }
})
program.parse(process.argv);