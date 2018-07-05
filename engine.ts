class RenderContext {
    context: CanvasRenderingContext2D
    // these a the html5 spec defaults
    FillStyle: string = "#000";
    Font: string = "10px sans-serif";

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    DrawBox(x: number, y: number, width: number, height: number) {
        this.context.strokeRect(x, y, width, height);
    }

    DrawBoxFill(x: number, y: number, width: number, height: number) {
        this.context.fillRect(x, y, width, height);
    }

    DrawCheckMark(x: number, y: number, x2: number, y2: number, x3: number, y3: number) {
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x3, y3);
        this.context.stroke();
        this.context.closePath();
    }

    WithinBox(x: number, y: number, boxX: number, boxY: number, width: number, height: number) {
        if (x >= boxX && x <= boxX + width) {
            if (y >= boxY && y <= boxY + height) {
                return true;
            }
            return false;
        }
    }

    MeasureText(text: string) {
        return this.context.measureText(text).width;
    }

    DrawText(text: string, x: number, y: number) {
        this.context.fillText(text, x, y);
    }

    DrawTextClipped(text: string, x: number, y: number, width: number, height: number) {
        this.context.save();
        this.context.beginPath();
        this.context.rect(x, y, width, height);
        this.context.clip();
        this.context.fillText(text, x, y);
        this.context.restore();
    }

    ClearWithinBox(x: number, y: number, width: number, height: number) {
        this.context.clearRect(x, y, width, height);
    }

    SetFont(font: string) {
        this.context.font = font;
    }

    ResetFont() {
        this.context.font = this.Font;
    }

    SetFillStyle(style: string) {
        this.context.fillStyle = style;
    }

    ResetFillStyle() {
        this.context.fillStyle = this.FillStyle;
    }
}

interface Renderable {
    Render(): void;
    Clear(): void;
    HandleClick(x: number, y: number): void;
    HandleKeyDown(x: string): void;
    x: number;
    y: number;
    height: number;
    width: number;
}

class CheckBox implements Renderable {
    private context: RenderContext;
    x: number;
    y: number;
    width: number;
    height: number;
    checked: boolean;

    constructor(context: RenderContext, x: number = 0, y: number = 0, width: number = 0, height: number = 0, checked: boolean = false) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.checked = checked;
    }

    Render() {
        this.Clear();
        this.context.DrawBox(this.x, this.y, this.width, this.height);
        if (this.checked) {
            this.context.DrawCheckMark(
                this.x + (this.width / 2 * 0.05), this.y + this.height / 2 - (this.height / 2 * 0.05),
                this.x + this.width / 2, this.y + this.height / 2 + (this.height / 2 * 0.9),
                this.x + this.width - (this.width / 2 * 0.05), this.y + (this.height / 2 * 0.05)
            );
        }
    }

    Clear() {
        this.context.ClearWithinBox(this.x, this.y, this.width, this.height);
    }

    HandleClick(x: number, y: number) {
        if (this.context.WithinBox(x, y, this.x, this.y, this.width, this.height)) {
            this.checked = !this.checked;
        }
    }

    HandleKeyDown(x: string) {
    }
}


class Cursor implements Renderable {
    private context: RenderContext;
    x: number;
    y: number;
    height: number;
    width: number;

    constructor(context: RenderContext, x: number, y: number, height: number) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = 1;
        this.height = height;
    }

    Render() {
        this.Clear();
        this.context.DrawBox(this.x, this.y, this.width, this.height);
    }

    Clear() {
        this.context.ClearWithinBox(this.x, this.y, this.width, this.height);
    }

    HandleClick(x: number, y: number) {
    }

    HandleKeyDown(x: string) {
    }
}

class TextBox implements Renderable {
    private context: RenderContext;
    x: number;
    y: number;
    height: number;
    width: number;
    text: string;
    adjustment: number;
    AcceptInput: boolean;
    CursorPosition: number;

    constructor(context: RenderContext, x: number, y: number, width: number, height: number, text: string) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.adjustment = 0;
        this.AcceptInput = false;
        this.CursorPosition = 0;
    }

    Render() {
        this.Clear();
        this.context.DrawBox(this.x, this.y, this.width, this.height);
        this.context.SetFont((this.height - (this.height * 0.25)) + 'px serif');

        var t = this.text.substring(0, this.CursorPosition);
        //console.log(t);
        var width = this.context.MeasureText(t);

        var c = new Cursor(
            this.context,
            (this.x + (this.width * 0.025)) + width - this.adjustment,
            this.y + (this.height * 0.05),
            this.height - (this.height * 0.1)
        );

        if (this.AcceptInput && CursorDisplay) {
            //console.log("displaying at " + c.x + " " + c.y)
            c.Render();
        }
        else {
            //console.log("not displaying")
            c.Clear();
        }

        if (this.text) {
            this.context.DrawTextClipped(this.text, this.x, this.y, (this.x + (this.width * 0.025)) - this.adjustment, this.y + this.height - (this.height * 0.25));
        }
    }

    Clear() {
        this.context.ClearWithinBox(this.x, this.y, this.width, this.height);
    }

    HandleClick(x: number, y: number) {
        if (this.context.WithinBox(x, y, this.x, this.y, this.width, this.height)) {
            this.AcceptInput = true;
        }
        else {
            this.AcceptInput = false;
        }
    }

    HandleKeyDown(key: string) {
        if (!this.AcceptInput) {
            return;
        }

        if (key == "Backspace") {
            this.text = this.text.substring(0, this.CursorPosition - 1) + this.text.substring(this.CursorPosition, this.text.length);
            this.MoveCursorLeft();
        }
        else if (key == "ArrowDown") {
            //pass
        }
        else if (key == "Delete") {
            this.text = this.text.substring(0, this.CursorPosition) + this.text.substring(this.CursorPosition + 1, this.text.length);
        }
        else if (key == "ArrowUp") {
            //pass
        }
        else if (key == "ArrowRight") {
            this.MoveCursorRight();
        }
        else if (key == "ArrowLeft") {
            this.MoveCursorLeft();
        }
        else if (key == "Shift") {
            //pass
        }
        else if (key == "Enter") {
            //pass
        }
        else {
            if (this.text == "") {
                this.text = key;
            }
            else {
                var insert = function (str: string, what: string, index: number) {
                    return index > 0
                        ? str.replace(new RegExp('.{' + index + '}'), '$&' + what)
                        : what + str;
                }
                this.text = insert(this.text, key, this.CursorPosition)
            }
            this.MoveCursorRight();
        }

        if (this.context.MeasureText(this.text.substring(0, this.CursorPosition)) - this.adjustment >= this.width + this.x - (this.width * 0.025)) {
            this.adjustment += this.context.MeasureText(this.text[this.text.length - 1]);
        }

        if (this.context.MeasureText(this.text.substring(0, this.CursorPosition)) - this.adjustment <= this.x + (this.width * 0.025)) {
            this.adjustment -= this.context.MeasureText(this.text[this.text.length - 1]);
            if (this.adjustment < 0) {
                this.adjustment = 0;
            }
        }

    }

    private MoveCursorLeft() {
        if (this.CursorPosition != 0) {
            this.CursorPosition -= 1;
        }
    }

    private MoveCursorRight() {
        if (this.CursorPosition <= this.text.length) {
            this.CursorPosition += 1;
        }
    }
}

class Button implements Renderable {
    private context: RenderContext;
    x: number;
    y: number;
    height: number;
    width: number;
    text: string;
    onclick: () => void

    constructor(context: RenderContext, x: number, y: number, height: number, onclick: () => void, text: string) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = 1;
        this.height = height;
        this.onclick = onclick;
        this.text = text;
    }

    Render() {
        this.context.SetFillStyle("#cccccc");
        this.context.DrawBoxFill(this.x, this.y, this.width, this.height);
        this.context.ResetFillStyle();
        if (this.text) {
            this.context.DrawTextClipped(this.text, this.x, this.y, (this.x + (this.width * 0.025)), this.y + this.height - (this.height * 0.25));
        }
    }

    Clear() {
        this.context.ClearWithinBox(this.x, this.y, this.width, this.height);
    }

    HandleClick(x: number, y: number) {
        if (this.context.WithinBox(x, y, this.x, this.y, this.x + this.width, this.y + this.height)) {
            this.onclick();
        }
    }

    HandleKeyDown(x: string) {
    }
}

class TextLiteral implements Renderable {
    private context: RenderContext;
    x: number;
    y: number;
    height: number;
    width: number;
    text_: string;

    constructor(context: RenderContext, x: number, y: number, height: number, text_: string) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = 1;
        this.height = height;
        this.text_ = text_;
    }

    Render() {
        this.Clear();
        if (this.text_) {
            this.context.DrawTextClipped(this.text_, this.x, this.y, (this.x + (this.width * 0.025)), this.y + this.height - (this.height * 0.25));
        }
    }

    Clear() {
        this.context.ClearWithinBox(this.x, this.y, this.width, this.height);
    }

    HandleClick(x: number, y: number) {
    }

    HandleKeyDown(x: string) {
    }
}


class Padding {
    top: number;
    left: number;
    right: number;
    bottom: number;
    constructor(top: number, left: number, right: number, bottom: number) {
        this.top = top / 1000;
        this.left = left / 1000;
        this.right = right / 1000;
        this.bottom = bottom / 1000;
    }
}

class Definition {
    size: number;
    constructor(size: number) {
        this.size = size / 1000;
    }
}

class ColumnDefinition extends Definition {
}

class RowDefinition extends Definition {
}

class Cell {
    item?: Renderable;
    padding?: Padding;
    constructor(item?: Renderable, padding?: Padding) {
        this.item = item;
        this.padding = padding;
    }
}

class GridLayoutManager implements Renderable {
    private context: RenderContext;
    x: number;
    y: number;
    height: number;
    width: number;
    rows: Array<RowDefinition>;
    columns: Array<ColumnDefinition>;
    cells: Array<Array<Cell>>;

    constructor(context: RenderContext, x: number, y: number, width: number, height: number, rows: Array<RowDefinition>, columns: Array<ColumnDefinition>, cells: Array<Array<Cell>>) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rows = rows;
        this.columns = columns;
        this.cells = cells;

        var PrecomputedRowHeights = new Array<number>();
        PrecomputedRowHeights.push(0);
        var PrecomputedColumnWidths = new Array<number>();
        PrecomputedColumnWidths.push(0);

        rows.forEach(element => {
            PrecomputedRowHeights.push(element.size + PrecomputedRowHeights[PrecomputedRowHeights.length-1]);
        });

        columns.forEach(element => {
            PrecomputedColumnWidths.push(element.size + PrecomputedColumnWidths[PrecomputedColumnWidths.length-1]);
        });

        PrecomputedRowHeights.pop();
        PrecomputedColumnWidths.pop();

        PrecomputedRowHeights = PrecomputedRowHeights.map((i) => i * height);
        PrecomputedColumnWidths = PrecomputedColumnWidths.map((i) => i * width);

        if (this.cells.length * this.cells[0].length != rows.length * columns.length) {
            throw new Error("invalid combination of definitions and cells");
        }

        cells.forEach((Row, RowNumber) => {
            Row.forEach((Cell, ColumnNumber) => {
                if(Cell.item)
                {
                    if(Cell.padding)
                    {
                        var _Width = PrecomputedColumnWidths[ColumnNumber];
                        var _Height = PrecomputedRowHeights[RowNumber];
                        var padding = Cell.padding;
                        Cell.item.x = _Width + padding.left;
                        Cell.item.y = _Height + padding.top;
                        Cell.item.width = PrecomputedColumnWidths[ColumnNumber + 1] - PrecomputedColumnWidths[ColumnNumber]  - padding.right;
                        Cell.item.height = PrecomputedRowHeights[RowNumber + 1] - PrecomputedRowHeights[RowNumber] - padding.bottom;
                        /*
                        console.log("cell")
                        console.log(PrecomputedColumnWidths)
                        console.log(PrecomputedRowHeights)
                        console.log("ColumnNumber " + ColumnNumber)
                        console.log("RowNumber " + RowNumber)
                        console.log("x " + Cell.item.x)
                        console.log("y " + Cell.item.y)
                        console.log("width " + Cell.item.width)
                        console.log("height " + Cell.item.height)
                        */
                    }
                }
            });
        });
    }

    Render() {
        this.Clear();
        this.cells.forEach((row) => {
            row.forEach(cell => {
                if(cell.item)
                {
                    cell.item.Render();
                    //console.log("rendering");
                }
            });
        });
    }

    Clear() {
        this.context.ClearWithinBox(this.x, this.y, this.width, this.height);
    }

    HandleClick(x: number, y: number) {
        this.cells.forEach((row) => {
            row.forEach(cell => {
                if(cell.item)
                {
                    cell.item.HandleClick(x, y);
                }
            });
        });
    }

    HandleKeyDown(key: string) {
        this.cells.forEach((row) => {
            row.forEach(cell => {
                if(cell.item)
                {
                    cell.item.HandleKeyDown(key);
                }
            });
        });
    }
}

var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;
var CursorDisplay = true;

// style button like a button
// resizing and responsive break points
// padding doesn't work
// last cell is not displayed

window.onload = () => {
    canvas = <HTMLCanvasElement>document.getElementById('main');
    context = <CanvasRenderingContext2D>canvas.getContext('2d');

    var renderingContext = new RenderContext(context);

    var rows = new Array<RowDefinition>(
        new ColumnDefinition(500),
        new ColumnDefinition(125),
        new ColumnDefinition(125),
        new ColumnDefinition(250)
    );

    var columns = new Array<ColumnDefinition>(
        new ColumnDefinition(125),
        new ColumnDefinition(125),
        new ColumnDefinition(250),
        new ColumnDefinition(500)
    );

    var cells = new Array<Array<Cell>>(
        new Array(new Cell(), new Cell(new CheckBox(renderingContext), new Padding(0,0,0,0)), new Cell(), new Cell()),
        new Array(new Cell(new CheckBox(renderingContext), new Padding(0,0,0,0)), new Cell(new CheckBox(renderingContext), new Padding(5,50,15,5)), new Cell(new CheckBox(renderingContext), new Padding(0,0,0,0)), new Cell(new CheckBox(renderingContext), new Padding(0,0,0,0))),
        new Array(new Cell(), new Cell(new CheckBox(renderingContext), new Padding(0,0,0,0)), new Cell(), new Cell()),
        new Array(new Cell(), new Cell(), new Cell(), new Cell(new CheckBox(renderingContext), new Padding(0,0,0,0)))
    );


    var main = new GridLayoutManager(renderingContext, 0, 0, canvas.width, canvas.height, rows, columns, cells);
    main.Render();

    var CurrentPage = main;

    document.onkeydown = (e) => {
        e.preventDefault();
        CurrentPage.HandleKeyDown(e.key);
        CurrentPage.Render();
    }

    canvas.onclick = (e) => {
        CurrentPage.HandleClick(e.pageX, e.pageY);
        CurrentPage.Render();
    }


    /*
    
        var main = new GridLayoutManager(context, canvas, 5, 5);
        var page2 = new GridLayoutManager(context, canvas, 1, 1);
    
        var t = StampText(context, 0, 0, 0, 0, "Page2")
    
        page2.AddToGrid(t, 0, 0);
    
    
        setInterval(function () {
            CursorDisplay = !CursorDisplay;
        }, 500);
    
        var b = StampButton(context, 0, 0, 0, 0, "2", function () {
            CurrentPage = page2;
            main.Clear(context);
            page2.Render(context);
        });
    
        main.AddToGrid(StampTextBox(context, 0, 0, 0, 0, "0,0"), 0, 0)
        main.AddToGrid(StampCheckbox(context, 0, 0, 0, false), 1, 1)
        main.AddToGrid(StampTextBox(context, 0, 0, 0, 0, "2,0"), 2, 0)
        main.AddToGrid(b, 0, 2)
        main.AddToGrid(StampCheckbox(context, 0, 0, 0, true), 5, 5)
    
        main.Render(context);
    
        CurrentPage = main;
        */
}