function makeChains(arr) {
  // this function .....
  let markovChains = {};

  for (let i = 0; i < arr.length; i +=1) {
    const word = arr[i];
    const next = arr[i + 1] || null;

    if (!markovChains[word]) {
      markovChains[word] = [];
    } 

    if (next !== null) {
      markovChains[word].push(next);
    }
  }
  
  return markovChains;
}

module.exports = {
  makeChains
};