/**
 * variable names
 * helper functions to break out complex logic
 * function names
 * 
 */

const rp = require('request-promise');
const $ = require('cheerio');
const base = 'https://outpost-daria-reborn.info';
const fs = require('fs');
const { makeChains } = require('./makeChains');

// get the characters that are desired
// const characters = ['Daria', 'Jane', 'Quinn', 'Jake', 'Helen', 'Mr. DeMartino', "Mr. O'Neill", 'Tom', 'Ms. Li'];
const characters = ['Jane'];
// const characters = process.argv.slice(2);

// global object to store all the words from all the characters
let theObj = {};

async function doThings() {
  let eps = await getTranscriptURLs();
  getEps(eps);
}

doThings();

/**
 * top level function, fetches urls from base url and sends array to getEps(urls),
 * awaits completion of getEps(), and then makes a markovChain for each character,
 * serializes it, and writes the chain to a new .json file.
 */
async function getTranscriptURLs() {
  if (characters.length) {
    let epUrls = [];
    let resp = await rp(`${base}/episode_guide.html`);
    let selected = $('tr > td > font > a', resp);
    
    for (let i = 0; i < selected.length; i += 1) {
      let curLink = selected[i];
      if(curLink.children[0].data === 'Transcript') {
        epUrls.push(curLink.attribs.href);
      }
    }
    return epUrls;
  }
  return null;  
}

/**
 * takes in an array of episode urls and calls the getLines() function for each episode
 * needs to make each request in order for markov chain
 */
async function getEps(arr) {
  // arr.forEach(ep => await)
  console.log(arr[0]);
  
  let res = await rp(`${base}/${arr[6]}`);
  let selected = $('tr > td > font > p', res).children();
  console.log(selected);
  
  // getLines(selected);
  // console.log(selected);
  // for (let i = 0; i < arr.length; i += 1) {
  //   let curEp = arr[i];
  //   await getLines(`${base}/${curEp}`);
  // }
}

function getLines(data) {
  console.log('************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************');

  for (let i = 0; i < 10; i += 1) {
    let curLine = data[i];
    let thing = $('i',  curLine);
    console.log('\n************************************************');
    console.log(thing);
    console.log('************************************************');
  }
  
}