const fs = require('fs');

module.exports = function createNamesList(obj) {
  const name = obj.name;
  if (name === '.' || name === '..') {
    return;
  } else {
    return name;
  }
};
