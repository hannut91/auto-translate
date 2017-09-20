var fs = require('fs');
var cheerio = require('cheerio');
var Rx = require('rxjs/Rx');

var re = /([가-힣]+[\s\n~!@#$%^&*,\-_+=?/><]*)+[가-힣]+|[가-힣]+/g;
// var re = /([가-힣]+[\s\n~!@#$%^&*,\-_+=?/><]*)+[가-힣]+|[가-힣]+/g;
// var re = /([가-힣]+[\s~!@#$%^&*,\-_+=?/><\(\)\'0-9\.]*)+[가-힣]+|[가-힣\s~!@#$%^&*,\-_+=?/><\(\)\'0-9\.]+/g;
// var re = /(?=[가-힣\s\n~\(\)])/g;
var htmlFileRegex = /\.html$/;

exports.autoTranslate = function (filePath, jsonFile) {
  var keyList = Object.keys(jsonFile);

  if(keyList.length < 1){
    console.log('translate object is not exist');
    return ;
  }

  var htmlFilePaths = [];

  if (fs.statSync(filePath).isDirectory()) {
    readDir(filePath);
  } else if(fs.statSync(filePath).isFile()){
    if (htmlFileRegex.test(filePath)) {
      htmlFilePaths.push(filePath);
    }
  }

  function readDir(filePath) {
    if (fs.statSync(filePath).isDirectory()) {
      var fileList = fs.readdirSync(filePath);
      for (var i = 0; i < fileList.length; i++) {
        readDir(filePath + '/' + fileList[i]);
      }
    } else {
      if (htmlFileRegex.test(filePath)) {
        htmlFilePaths.push(filePath);
      }
      return;
    }
  }

  if(htmlFilePaths.length < 1){
    console.log('html file is not exist in path');
    return;
  }

  var remainList = [];

  for (var i = 0; i < htmlFilePaths.length; i++) {
    var fileData = fs.readFileSync(htmlFilePaths[i]);
    var $ = cheerio.load(fileData, {
      decodeEntities: false,
      ignoreWhitespace: false
    });

    $.root().find('*').contents().each(function (i, elem) {
      var finded = false;
      var placeholder = $(elem).attr('placeholder');
      if (placeholder) {
        for (var i = 0; i < keyList.length; i++) {
          if (placeholder == jsonFile[keyList[i]][0]) {
            $(elem).attr('placeholder', "{{ '" + keyList[i] + "' | translate }}");
            finded = true;
            break;
          }
        }
        if (finded == false) {
          remainList.push(placeholder);
        }
      }

      finded = false;
      if (elem.nodeType == 3) {
        var krText = $(elem).text().match(re);
        if (krText) {
          for (var i = 0; i < krText.length; i++) {
            krText[i] = krText[i].replace(/\s{2,}/g, ' ');
            krText[i] = krText[i].replace(/\n/g, '');
            for (var j = 0; j < keyList.length; j++) {
              if (krText[i] == jsonFile[keyList[j]][0]) {
                var reTest = new RegExp("(?!<-- )" + krText[i] + "(?! -->)");
                var replaceText = $(elem).text().replace(reTest, "{{ '" + keyList[j] + "' | translate}}<!-- " + jsonFile[keyList[j]][0] + " -->");
                elem.data = replaceText;
                finded = true;
                break;
              }
            }
            if (finded == false) {
              remainList.push(krText[i]);
            }
          }

        }
      }
    });

    fs.writeFileSync(htmlFilePaths[i], $.root().html());
  }
  Rx.Observable.from(remainList)
    .distinct(function (param) {
      return param;
    })
    .reduce(function (pre, next) {
      return pre + '\n' + next
    })
    .subscribe(function (data) {
      fs.writeFileSync('remainList.json', data);
      console.log('Successfully translated');
      console.log('Successfully saved at remainList.json');
    });
};

exports.makeTranslateList = function (filePath) {
  var htmlFilePaths = [];

  if (fs.statSync(filePath).isDirectory()) {
    readDir(filePath);
  } else if(fs.statSync(filePath).isFile()){
    if (htmlFileRegex.test(filePath)) {
      if(checkExceptHTML(filePath)){
        htmlFilePaths.push(filePath);
      }
    }
  }

  function readDir(filePath) {
    if (fs.statSync(filePath).isDirectory()) {
      var fileList = fs.readdirSync(filePath);
      for (var i = 0; i < fileList.length; i++) {
        readDir(filePath + '/' + fileList[i]);
      }
    } else {
      if (htmlFileRegex.test(filePath)) {
        if(checkExceptHTML(filePath)){
          htmlFilePaths.push(filePath);
        }
      }
      return;
    }
  }

  if(htmlFilePaths.length < 1){
    console.log('html file is not exist in path');
    return;
  }

  var transList = [];
  var fileName = '';
  for (var i = 0; i < htmlFilePaths.length; i++) {
    var fileData = fs.readFileSync(htmlFilePaths[i]);
    fileName = htmlFilePaths[i].slice(htmlFilePaths[i].lastIndexOf('/') + 1)
    var $ = cheerio.load(fileData, {
      decodeEntities: false,
      ignoreWhitespace: false
    });

    $.root().find('*').contents().each(function (i, elem) {
      var placeholder = $(elem).attr('placeholder');
      if (placeholder) {
        transList.push(placeholder);
      }

      if (elem.nodeType == 3) {
        // var krText = $(elem).text().match(re);
        var krText = $(elem).text();
        if (krText) {
          krText = krText.replace(/\s{2,}/g, ' ');
          krText = krText.replace(/\n/g, '');
          transList.push(fileName);
          transList.push(krText);
          // for (var i = 0; i < krText.length; i++) {
          //   krText[i] = krText[i].replace(/\s{2,}/g, ' ');
          //   krText[i] = krText[i].replace(/\n/g, '');
          //   transList.push(krText[i]);
          // }
        }
      }
    });
  }

  Rx.Observable.from(transList)
    .distinct(function (param) {
      return param;
    })
    .reduce(function (pre, next) {
      return pre + '\n' + next
    })
    .subscribe(function (data) {
      fs.writeFileSync('output.json', data);
    }, function(err) {
      console.error(err);
    }, function() {
      console.log('Successfully saved at output.json');
    });
};


function checkExceptHTML(filePath) {

  var exceptList = ['usage-policy.component.html', 'privacy-policy.component.html'];
  var index = exceptList.findIndex(function(except){
    if(filePath.match(except)){
      return true;
    } else {
      return false;
    }
  })
  if(index > -1) {
    return false;
  }
  else {
    return true
  };
}