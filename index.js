const axios = require('axios')
const fs = require('fs');

const locData = {}

async function addCities(countryCode, stateCode) {
  let temp = {}
  let citiesData = await axios.get(`https://steamcommunity.com/actions/QueryLocations/${countryCode}/${stateCode}`)

  if (Array.isArray(citiesData.data)) {

    for (const city of citiesData.data) {
      temp[city.cityid] = {
        cityName: city.cityname
      }
    }
  }

  return temp
}

async function addStates(countryCode) {
  let statesData = await axios.get(`https://steamcommunity.com/actions/QueryLocations/${countryCode}`)

  if (Array.isArray(statesData.data)) {
    locData[countryCode].states = {}

    let cities = {}

    for (const state of statesData.data) {

      try {
        cities = await addCities(countryCode, state.statecode)
      } catch (error) {
        console.log(`No cities for /${countryCode}/${state.statecode}`);
      }

      locData[countryCode].states[state.statecode] = {
        stateName: state.statename,
        cities: cities
      }
    }
  }
}

async function getLocations() {
  try {
    let countryData = await axios.get('https://steamcommunity.com/actions/QueryLocations/')

    if (Array.isArray(countryData.data)) {
      for (const country of countryData.data) {
        console.log(`Adding ${country.countrycode}`);
        locData[country.countrycode] = {}
        locData[country.countrycode].countryName = country.countryname

        if (country.hasstates) {
          await addStates(country.countrycode)
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

getLocations().then(() => {
  fs.writeFile("steam_countries_data.json", JSON.stringify(locData), 'utf-8', function (err) {
    if (err) {
      console.log(err);
    }
  });
})