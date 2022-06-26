const nodemailer = require('nodemailer');
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const SMTPTransport = require('nodemailer-smtp-transport');
const config = require('../config');

const transportEngine = new SMTPTransport({
  host: config.sender.host,
  port: config.sender.port,
  secure: true,
  auth: {
    user: config.sender.user,
    pass: config.sender.pass,
  },
});

const transport = nodemailer.createTransport(transportEngine);

transport.use('compile', htmlToText());

module.exports = async function sendMail(attachments, fileName, options) {
  const html = `<h1>${fileName} </h1>`;

  const message = {
    html: html,
    from: config.sender.user,
    to: {
      address: 'bohdan.oleksa@gmail.com',
    },
    subject: 'New PDF files',
    attachments: attachments,
  };

  return transport.sendMail(message);
};
