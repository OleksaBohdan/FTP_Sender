const path = require('path');
const fs = require('fs');

module.exports = async function deleteFilesFromDownloads(arr) {
  arr.forEach((file) => {
    fs.unlink(path.join(__dirname, `../downloads/${file}`), () => {
      console.log('removed', file);
    });
  });

  return;
};
