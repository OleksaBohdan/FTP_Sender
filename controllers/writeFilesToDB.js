const path = require('path');
const fs = require('fs');

module.exports = async function writeFilesToDB(arr) {
  const str = '\n' + arr.join('\n');
  fs.appendFile(path.join(__dirname, '../data/namesList.txt'), str, () => {
    return;
  });
};
