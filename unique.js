var fs = require('fs');
var _ = require('lodash');

var fileText = fs.readFileSync('output.txt', 'utf8');

var textList = fileText.split('\n');
console.log(textList[0].replace(/\s$/g, '') + '$')
for(var i = 0; i < textList.length; i++ ){
  textList[i] = textList[i].replace(/\s$/, '');
}
console.log(textList.length);

var result = _.uniq(textList);

fs.writeFileSync('final.txt', result.join('\n'));