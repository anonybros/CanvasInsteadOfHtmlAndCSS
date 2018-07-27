var fs = require('fs'),
    path = require('path'),
    filePathOut = path.join(__dirname, 'pages.ts'),
    filePathIn = path.join(__dirname, 'pages.florg');

const template = `
function GeneratePages(): Page[] {
    
} 
`

var count = 0;

function GenId() {
    return "a" + count++;
}


fs.readFile(filePathIn, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        console.log(data);
        var str = data;


        var lines = data.split("\n");
        lines.forEach(line => {

        });


        fs.writeFile(filePathOut, str);





    } else {
        console.log(err);
    }
});






















