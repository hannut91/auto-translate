var readline = require('readline');
var fs = require('fs');
var xlsxtojson = require('./xlsxtojson/xlsxtojson.js');
var autoTranslate = require('./auto-translate/auto-translate.js');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var jsonFileRegex = /\.json$/;
var xlsxFileRegex = /\.xlsx$/;

rl.question('Please select mode :\n1) Parse xlsx to json 2) Making translate list xlsx 3) Auto translate ', function (answer) {
  switch (answer) {
    case '1':
      rl.question('Insert .xlsx file path: ', function (xlsxFilePath) {
        fs.stat(xlsxFilePath, function (err, stat) {
          if (err) {
            console.log("Please enter xlsx file path");
            rl.close();
            return;
          }

          if (!stat.isFile()) {
            console.log("Please enter xlsx file path");
            rl.close();
            return;
          }

          if (!xlsxFileRegex.test(xlsxFilePath)) {
            console.log("file path is not .xlsx file");
            rl.close();
            return;
          }

          rl.question('Number of languages Including Korean: ', function (langLength) {
            if (isNaN(Number(langLength)) || Number(langLength) < 1) {
              console.log("Please enter langLength");
              rl.close();
              return;
            }

            xlsxtojson.xlsxtojson(xlsxFilePath, langLength);
            rl.close();
          });
        })
      });
      break;
    case '2':
      rl.question('Insert directory path or html file path: ', function (filePath) {
        fs.stat(filePath, function (err, stat) {
          if (err) {
            console.log("Please enter directory path or html file path");
            rl.close();
            return;
          }

          if (!stat.isFile() && !stat.isDirectory()) {
            console.log("Please enter directory path or html file path");
            rl.close();
            return;
          }

          autoTranslate.makeTranslateList(filePath);
          rl.close();
        });
      });
      break;
    case '3':
      rl.question('Insert directory path or html file path: ', function (filePath) {
        fs.stat(filePath, function (err, stat) {
          if (err) {
            console.log("Please enter directory path or html file path");
            rl.close();
            return;
          }

          if (!stat.isFile() && !stat.isDirectory()) {
            console.log("Please enter directory path or html file path");
            rl.close();
            return;
          }

          rl.question('Insert jsonFile path: ', function (jsonFilePath) {
            fs.stat(jsonFilePath, function (err, stat) {
              if (err) {
                console.log("Please enter jsonFile path");
                rl.close();
                return;
              }

              if (!stat.isFile()) {
                console.log("Please enter jsonFile path");
                rl.close();
                return;
              }

              if (!jsonFileRegex.test(jsonFilePath)) {
                console.log("file path is not .json file");
                rl.close();
                return;
              }

              autoTranslate.autoTranslate(filePath, require(jsonFilePath));
              rl.close();
            });
          });
        });
      });
      break;
    default:
      console.log(answer + 'mode is not Exist. Please try again.');
      rl.close();
  }
});





