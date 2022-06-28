const fs = require('fs');
const PromiseFtp = require('promise-ftp');
const sendMail = require('./libs/sendMail');
const createNamesList = require('./mappers/createNamesList');
const createAttachments = require('./mappers/createAttachments');
const createArrFromDB = require('./controllers/createArrFromDB');
const createPdfArr = require('./controllers/createPdfArr');
const writeFilesToDB = require('./controllers/writeFilesToDB');
const createArrListToDownload = require('./controllers/createArrListToDownload');
const deleteFilesFromDownloads = require('./controllers/deleteFilesFromDownloads');
const config = require('./config');

const FTPServer = config.ftpServer;
const folderPATH = config.folder;

function makeFileNamesList(FTP, folderFilesPath) {
  return new Promise(function (resolve, reject) {
    const ftp = new PromiseFtp();

    ftp
      .connect({ host: FTP.ServerName, port: FTP.ServerPort, user: FTP.Username, password: FTP.Password })
      .then(function (msg) {
        return;
      })
      .then(function () {
        return ftp.list(folderFilesPath);
      })
      .then(function (list) {
        return list.map(createNamesList);
      })
      .then(function (list) {
        const pdfList = createPdfArr(list);
        const dbList = createArrFromDB();
        const downloadList = createArrListToDownload(dbList, pdfList);
        return downloadList;
      })
      .then(function (downloadList) {
        ftp.end();
        resolve(downloadList);
        return downloadList;
      });
  });
}

function downloadNewFiles(fileNamesArr, FTP, folderFilesPath, cb) {
  return new Promise(function (resolve, reject) {
    const ftp = new PromiseFtp();
    ftp
      .connect({ host: FTP.ServerName, port: FTP.ServerPort, user: FTP.Username, password: FTP.Password })
      .then(function (msg) {
        console.log('Connection succesful:', msg);
        // Download file
        function downloadFile(filename) {
          return new Promise((resolve, reject) => {
            if (filename === 'stop') {
              ftp.end();
              console.log('ALL DATATA DOWNLOADED SUCCESSFULLY. CONNECTION STOP ');
              cb();
              return resolve();
            }

            ftp.get(`${folderFilesPath}/${filename}`).then((stream) => {
              let file = fs.createWriteStream(`./downloads/${filename}`);
              stream.pipe(file);
              stream.on('finish', () => {
                console.log(`File ${filename} downloaded successfully.`);
                stream.end();
                resolve();
              });
              stream.on('error', (err) => {
                console.log('ERROR', err);
                reject();
              });
            });
          });
        }

        async function download() {
          for (let i = 0; i < fileNamesArr.length; i++) {
            let filename = fileNamesArr[i];
            await downloadFile(filename);
          }
        }

        try {
          download();
        } catch (e) {
          console.log('ERROR');
          throw e;
        }
      })
      .then(function () {
        console.log('Files downloaded');

        resolve();
      });
  });
}

module.exports = async function main() {
  let fileNamesArr = await makeFileNamesList(FTPServer, folderPATH);
  fileNamesArr.push('stop');

  if (fileNamesArr.length == 1) {
    console.log('Arr is empty. Sleep...');
    setTimeout(() => {
      main();
    }, 30000);
  } else {
    console.log('Arr is not empty. Done...');
    await downloadNewFiles(fileNamesArr, FTPServer, folderPATH, () => {
      fileNamesArr.pop();
      const attachments = createAttachments(fileNamesArr);
      sendMail(attachments, fileNamesArr)
        .then((msg) => {
          if (msg.response.includes('250')) {
            console.log(`OK Data sent successfully from ${msg.envelope.from} to ${msg.envelope.to}`);
            writeFilesToDB(fileNamesArr);
            deleteFilesFromDownloads(fileNamesArr);
            setTimeout(() => {
              main();
            }, 30000);
          }
        })
        .catch((err) => {
          console.log('ERROR', err);
          if (err.errno === -2) {
            console.log('File not found');
          }
          setTimeout(() => {
            main();
          }, 30000);
        });
    });
  }
};