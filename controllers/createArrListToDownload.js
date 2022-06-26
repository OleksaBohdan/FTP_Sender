module.exports = function createArrListToDownload(dbList, ftpList) {
  let listToDownload = [];

  for (let i = 0; i < ftpList.length; i++) {
    if (!dbList.includes(ftpList[i])) {
      listToDownload.push(ftpList[i]);
    }
  }

  return listToDownload;
};
