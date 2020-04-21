const axios = require("axios")
const chalk = require("chalk")
const inquirer = require("inquirer") 

async function getKommuneData(kommuneInput){
    const coronaData = await getCoronaData()
    const kommune = await coronaData.data.cases.filter((kommune)=> kommune.name.toLowerCase() === kommuneInput.toLowerCase())[0]
    // console.log(kommune)
    // const kommune = coronaData.data.cases.name.toLowerCase() === kommuneInput.toLowerCase()
    if(kommune){

    const {confirmed, dead, recovered, name, confirmedPer1kCapita} = kommune
    return console.log(
        `

    ######################################################
    #       Totalt smittet i ${name}: ${confirmed}
    #       Døde: ${chalk.red(`${dead}☠`)}
    #       Tilfrisket: ${chalk.red(`${recovered}☠`)}
    #       Antall smittet per 1000 kapita: ${chalk.yellow(`${confirmedPer1kCapita}`)}
    ######################################################
        `)
    }else{

        console.log(chalk.yellow("**************************************************************"))
        console.log(chalk.red(`Kunne ikke finne en kommune med navn ${kommuneInput}`, "           *"))
        console.log(chalk.green("Ikke fortvil prøv med et annet kommunenavn","                  *"))
        console.log(chalk.yellow("**************************************************************"))
    }



}

async function getFylkesData  (coronaData){
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "fylke",
            message: "Hvilket Fylker ønsker du oversikt over?",
            choices: [
               "Agder" ,
               "Innlandet",
               "Møre og Romsdal",
               "Nordland",
               "Oslo",
               "Rogaland",
               "Vestfold og Telemark",
               "Troms og Finnmark",
               "Trøndelag",
               "Veslandet",
               "Viken",
            ]
        }
    ])
    fylkeString(answers.fylke, coronaData)
}




function getTotalData(coronaData){
    // console.log(coronaData.data.cases)
    const {confirmed, dead } = coronaData.data.totals
    const {newToday, newYesterday, diff, deathsToday, deathsYesterday} = coronaData.data.totals.changes

    return console.log(
        `
    ############################################
    #       Totalt smittet i Norge: ${confirmed}       # 
    #       Døde: ${chalk.red(`${dead}☠`)}                         #
    #       ${chalk.bold.red(`${chalk.underline("Endringer i dag")}`)}                    # 
    #       Nye smittetilfeller: ${chalk.red(`${newToday}`)}            #
    #       Nye smittetilfeller: ${chalk.yellow(`${newYesterday}`)}            #
    #       Differanse: ${chalk.yellow(`${diff}`)}                      #
    #       Døde i dag: ${chalk.red(`${deathsToday}`)}                      #
    #       Døde i går: ${chalk.blue(`${deathsYesterday}`)}                     #
    ############################################
        `

    )

}

const fylkeString = (fylke, coronaData) => { 
    const fylkesArray = coronaData.data.cases.filter((kommune) => kommune.parent === fylke )
    const fylkesObject = fylkesArray.reduce((acc, fylke)=>{
        if(acc.highestDes.confirmed < fylke.confirmed) {
            console.log("thiii")
            acc.highestDes.name = fylke.name
            acc.highestDes.confirmed = fylke.confirmed
        } 
        acc.confirmed += fylke.confirmed
        acc.dead += fylke.dead
        acc.recovered += fylke.recovered
        return acc
    },{
        highestDes: {
            name: 0,
            confirmed: 0,
            recovered: 0
        },
        confirmed: 0,
        dead: 0,
        recovered: 0,
    })


    const {confirmed, dead, recovered} = fylkesObject
    return console.log(
        `
    ######################################################
    #       Totalt smittet i ${fylke}: ${confirmed}
    #       Døde: ${chalk.red(`${dead}☠`)}
    #       Tilfrisket: ${chalk.red(`${recovered}☠`)}
    #       Kommune med mest smitte: ${chalk.yellow(`${fylkesObject.highestDes.name}☠`)}
    #       Antall smittet i ${fylkesObject.highestDes.name}: ${chalk.yellow(`${fylkesObject.highestDes.confirmed}☠`)}
    ######################################################
        `

    )


}


const getCoronaData = async () => {
try{
    const data = await axios.get("https://redutv-api.vg.no/corona/v1/sheets/norway-table-overview/?region=municipality")
    const jsonData = data
    // console.log(jsonData.data)
    return jsonData
}catch(err) {
    console.log(err)
}
}

const defaultAction = async () => {
    const coronaData = await getCoronaData()
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "total",
            message: "Hvordan oversikt ønsker du?",
            choices: [
               "Total oversikt i Norge" ,
               "Fylkesoversikt"
            ]
        }
    ])


    switch(answers.total){
        case "Total oversikt i Norge": 
        getTotalData(coronaData)
        break 
        case "Fylkesoversikt":
        getFylkesData(coronaData)
        default:
        break
    }

    
}

module.exports = {
    getKommuneData,
    getFylkesData,
    getTotalData,
    getCoronaData,
    defaultAction
}
    
