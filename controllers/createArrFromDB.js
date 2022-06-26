const fs = require('fs');
const path = require('path');

module.exports = function createArrFromDB() {
  const str = fs.readFileSync(path.join(__dirname, '../data/namesList.txt'), { encoding: 'utf8' });
  const arrFromStr = str.split('\n');
  return arrFromStr;
};
