module.exports = function createPdfArr(arr) {
  let arrPdf = [];

  arr.forEach((element) => {
    if (typeof element === 'string' && element.includes('.pdf')) {
      arrPdf.push(element);
    }
  });

  return Array.from(new Set(arrPdf));
};
