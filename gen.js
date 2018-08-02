var fs = require('fs'),
    path = require('path'),
    filePathOut = path.join(__dirname, 'pages.ts'),
    filePathIn = path.join(__dirname, 'pages.florg');

var count = 0;

function GenId() {
    return "a" + count++;
}

var types = { "text": 0, "checkbox": 1 };

fs.readFile(filePathIn, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        //console.log(data);
        var lines = data.split("\n");

        var result = "";

        var pages = [];

        lines.forEach(line => {
            var l = line.trim();
            if (l.startsWith("page")) {
                var pagename = l.split(" ")[1]
                pages.push({ name: pagename })
            }
            if (l.startsWith("controls")) {

            }
        });

        var pages = [{
            layouts: [{
                rows: [100, 100, 100],
                columns: [250, 250, 250],
                cells: [{
                    column: 1,
                    row: 1,
                    padding: [10, 25, 5, 15]
                }]
            }],
            BreakPoints: [0, 600, 1500],
            controls: [{
                type: types.text,
                text: "test"
            }],
            name: "main"
        }];


        result += "function GeneratePages(): Page[] {";

        var pagesVar = GenId();

        result += "var " + pagesVar + " = [];"

        pages.forEach(page => {
            var pageVar = GenId();
            result += "var " + pageVar + " = new Page();";

            result += pageVar + ".BreakPoints = " + JSON.stringify(page.BreakPoints) + ";";

            result += pageVar + ".name = " + JSON.stringify(page.name) + ";";

            var controlsVar = GenId();
            result += "var " + controlsVar + " = [];";
            page.controls.forEach(control => {
                var controlVar = GenId();
                var type = control.type;
                if (type == types.text) {
                    result += "var " + controlVar + " = new TextLiteral(" + JSON.stringify(control.text) + ");";
                }
                result += controlsVar + ".push(" + controlVar + ");";
            });
            result += pageVar + ".controls = " + controlsVar + ";";

            var layoutsVar = GenId();
            result += "var " + layoutsVar + " = [];";
            page.layouts.forEach(layout => {
                var layoutVar = GenId();
                result += "var " + layoutVar + " = new Layout();";

                var rowsVar = GenId();
                result += "var " + rowsVar + " = [];";
                layout.rows.forEach(row => {
                    var rowVar = GenId();
                    result += "var " + rowVar + " = new RowDefinition(" + row + ");";
                    result += rowsVar + ".push(" + rowVar + ");";
                });
                result += layoutVar + ".rows = " + rowsVar + ";";

                var columnsVar = GenId();
                result += "var " + columnsVar + " = [];";
                layout.columns.forEach(column => {
                    var columnVar = GenId();
                    result += "var " + columnVar + " = new RowDefinition(" + column + ");";
                    result += columnsVar + ".push(" + columnVar + ");";
                });
                result += layoutVar + ".columns = " + columnsVar + ";";

                var cellsVar = GenId();
                result += "var " + cellsVar + " = [];";
                layout.cells.forEach(cell => {
                    var cellVar = GenId();
                    result += "var " + cellVar + " = new CellLocationWithPadding();";
                    var gridposVar = GenId();
                    result += "var " + gridposVar + " = new GridPosition();";
                    result += gridposVar + ".column = " + cell.column + ";";
                    result += gridposVar + ".row = " + cell.row + ";";
                    result += cellVar + ".CellLocation = " + gridposVar + ";";

                    function UP(x) {
                        return cell.padding[x];
                    }

                    result += cellVar + ".padding = new Padding(" + UP(0) + ", " + UP(1) + ", " + UP(2) + ", " + UP(3) + ");"
                    result += cellsVar + ".push(" + cellVar + ");";
                });

                result += layoutVar + ".cells = " + cellsVar + ";";

                result += layoutsVar + ".push(" + layoutVar + ");";

            });
            result += pageVar + ".layout = " + layoutsVar + ";";

            result += pagesVar + ".push(" + pageVar + ");";
        });

        result += "return " + pagesVar + ";";

        result += "}";

        fs.writeFile(filePathOut, result);

    } else {
        console.log(err);
    }
});




