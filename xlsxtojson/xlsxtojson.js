var excel = require('node-xlsx');
var fs = require('fs');

exports.xlsxtojson = function (xlsxFilePath, langLength) {
  var xlsxJson = {};
  var i;

  var excelData = excel.parse(xlsxFilePath);

  for (i = 1; i < excelData[0].data.length; i++) {
    if (!excelData[0].data[i][0]) {
      break;
    }

    var translates = [];

    for (var j = 1; j <= langLength; j++) {
      translates.push(excelData[0].data[i][j] ? excelData[0].data[i][j] : 'undefined');
    }

    xlsxJson[excelData[0].data[i][0]] = translates;
  }

  var jsonString = JSON.stringify(xlsxJson);

  jsonString = jsonString.replace(/],/g, '],\n');

  fs.writeFile("translatejson.json", jsonString, function (err) {
    if (err) {
      return console.log(err);
    }
    else {
      console.log('Successfully saved at translatejson.json');
    }
  });
};
