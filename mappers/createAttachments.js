const path = require('path');

module.exports = function createAttachments(filesArr) {
  const attachments = filesArr.map((file) => {
    return { path: path.join(__dirname, `../downloads/${file}`) };
  });

  return attachments;
};
