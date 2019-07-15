const rp = require('request-promise');
const $ = require('cheerio');
const base = 'https://sites.google.com';
const fs = require('fs');
const { makeChains } = require('./makeChains');

// get the characters that are desired
const characters = ['Daria', 'Jane', 'Quinn', 'Trent', 'Mr. DeMartino', 'Tom'];

// global object to store all the words from all the characters
let theObj = {};
scrapeLinesFromDaria();

/**
 * top level function, fetches urls from base url and sends array to getEps(urls),
 * awaits completion of getEps(), and then makes a markovChain for each character,
 * serializes it, and writes the chain to a new .json file.
 */
async function scrapeLinesFromDaria() {
  if (characters.length) {
    let resp = await rp(`${base}/site/dariatranscripts`);
    let epUrls = [];
    let len = $('.topLevel > div > a', resp).length;

    for (let i = 0; i < len; i += 1) {
      epUrls.push($('.topLevel > div > a', resp)[i].attribs.href);
    }

    await getEps(epUrls);

    for (let character in theObj) {
      let cleanedArr = cleanArr(theObj[character]);
      let markovChain = makeChains(cleanedArr);
      let data = JSON.stringify(markovChain, null, 2);
      fs.writeFileSync(`${character}.json`, data, function(err) {
        if (err) throw err;
      });
    }
  
    return epUrls;
  }
}


/**
 * this function takes in an array and returns a copy of that array without
 * blank strings and new line characters
 */
function cleanArr(arr) {
  return arr.map(word => word.split('')
    .filter(c => !c.match(/\n$/) && !c.match(/\(/) && !c.match(/\)/) && !c.match(/\//))
    .join(''))
    .filter(Boolean);
}

/**
 * takes in an array of episode urls and calls the getLines() function for each episode
 * needs to make each request in order for markov chain
 */
async function getEps(arr) {
  for (let i = 0; i < arr.length; i += 1) {
    let curEp = arr[i];
    await getLines(`${base}${curEp}`);
  }
}

/**
 * this function takes a url and makes a GET request to that url
 * and iterates through all of the matching 'font' tags
 *  
 */
async function getLines(url) {
  let resp = await rp(url);
  
  function __storeData(key, string) {
    if (!theObj[key]) {
      theObj[key] = string.split(' ');
    } else {
      theObj[key] = theObj[key].concat(string.split(' '));
    }
  }

  let tarLen = $('font', resp).length;

  for (let i = 0; i < tarLen; i += 1) {
    // get the data from the first child, where the line is kept
    let kids = $('font', resp)[i].children;
    
    let kidsLen = kids.length;
    
    if (kids[0].type === 'text' && kidsLen > 1) {
      let textSplit = kids[0].data.split(' - ');
      // get character name key
      let key = textSplit[0];
      if (characters.includes(key)) {
        __storeData(key, textSplit[1]);
      }
      // iterate through children array find all text nodes
      for (let k = 1; k < kidsLen; k += 1) {
        if (kids[k].type === 'text') {
          if (characters.includes(key)) {
            __storeData(key, kids[k].data);
          }
        }
      }
    } else if (kids[0].type === 'text' && kidsLen === 1) {
      let textSplit = kids[0].data.split(' - ');
      // get character name key
      let key = textSplit[0];
      if (characters.includes(key)) {
        __storeData(key, textSplit[1]);
      }
    }
  }
  console.log(`finished writing ${url.slice(url.lastIndexOf('/'))}`);
  return 'done';
}


