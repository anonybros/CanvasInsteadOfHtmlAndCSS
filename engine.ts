class RenderContext {
    context: CanvasRenderingContext2D
    // these are the html5 spec defaults
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

interface Control {
    Render(x: number, y: number, height: number, width: number, context: RenderContext): void;
    Clear(x: number, y: number, height: number, width: number, context: RenderContext): void;
    HandleClick(x: number, y: number, xStart: number, yStart: number, height: number, width: number, context: RenderContext) : void
    HandleKeyDown(key: string,  x: number, y: number, height: number, width: number, context: RenderContext) : void
}

class CheckBox implements Control {
    checked: boolean;

    constructor(checked: boolean = false) {
        this.checked = checked;
    }

    Render(x: number, y: number, height: number, width: number, context: RenderContext) {
        this.Clear(x, y, height, width, context);
        context.DrawBox(x, y, width, height);
        if (this.checked) {
            context.DrawCheckMark(
                x + (width / 2 * 0.05), y + height / 2 - (height / 2 * 0.05),
                x + width / 2, y + height / 2 + (height / 2 * 0.9),
                x + width - (width / 2 * 0.05), y + (height / 2 * 0.05)
            );
        }
    }

    Clear(x: number, y: number, height: number, width: number, context: RenderContext) {
        context.ClearWithinBox(x, y, width, height);
    }

    HandleClick(x: number, y: number, xStart: number, yStart: number, height: number, width: number, context: RenderContext) {
        if (context.WithinBox(x, y, xStart, yStart, width, height)) {
            this.checked = !this.checked;
        }
    }

    HandleKeyDown(key: string, x: number, y: number, height: number, width: number, context: RenderContext) {
    }
}

class TextBox implements Control {
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

class Button implements Control {
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

class TextLiteral implements Control {
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

const OutOf = 1000;

class Padding {
    top: number;
    left: number;
    right: number;
    bottom: number;
    constructor(top?: number, left?: number, right?: number, bottom?: number) {
        this.top = top || 0 / OutOf;
        this.left = left || 0 / OutOf;
        this.right = right || 0 / OutOf;
        this.bottom = bottom || 0 / OutOf;
    }
}

class Definition {
    size: number;
    constructor(size: number) {
        this.size = size / OutOf;
    }
}

class ColumnDefinition extends Definition {
}

class RowDefinition extends Definition {
}

class Engine {
    context: RenderContext;
    controls: [Control];
    pages: [Page];
    CurrentPage?: Page;
    //width
    //height
    constructor(controls: [Control], pages: [Page], context: CanvasRenderingContext2D) {
        this.controls = controls;
        this.pages = pages;
        this.context = new RenderContext(context);
    }

    ChangePage(name: string) {
        if (this.CurrentPage) {
            this.CurrentPage.Clear();
        }
        this.CurrentPage = this.pages.filter(item => item.name === name)[0];
    }

    HandleResize() {
        var NewHeight = window.innerHeight;
        var NewWidth = window.innerWidth;

        canvas.height = NewHeight;
        canvas.width = NewWidth;
        if (this.CurrentPage) {
            this.CurrentPage.HandleResize(NewWidth, NewWidth);
        }
    }

    HandleClick(x: number, y: number) {
        if (this.CurrentPage) {
            this.CurrentPage.HandleClick(x, y);
        }
    }

    HandleKeyDown(key: string) {
        if (this.CurrentPage) {
            this.CurrentPage.HandleKeyDown(key);
        }
    }

    Render() {
        if (this.CurrentPage) {
            this.CurrentPage.Render();
        }
    }

    Clear() {
        if (this.CurrentPage) {
            this.CurrentPage.Clear();
        }
    }
}

class Page {

    name: string;
    layout: [Layout];
    BreakPoints: [number];
    CurrentLayout?: Layout;

    constructor(name: string, layout: [Layout], BreakPoints: [number])
    {
        this.name = name;
        this.layout = layout;
        this.BreakPoints = BreakPoints;
    }

    HandleClick(x: number, y: number) {
        if (this.CurrentLayout) {
            this.CurrentLayout.HandleClick(x, y);
        }
    }

    HandleKeyDown(key: string) {
        if (this.CurrentLayout) {
            this.CurrentLayout.HandleKeyDown(key);
        }
    }

    HandleResize(width: number, height: number) {

        for (let index = 0; index < this.BreakPoints.length; index++) {
            const element = this.BreakPoints[index];
            var next;
            if (index + 1 > this.BreakPoints.length) {
                next = Number.MAX_VALUE;
            }
            else {
                next = this.BreakPoints[index + 1];
            }

            if (width > element && width < next) {
                this.CurrentLayout = this.layout[index];
                break;
            }
        }

        if (this.CurrentLayout) {
            this.CurrentLayout.CalculatePositions(width, height)
            this.CurrentLayout.Render()
        }
    }

    Render() {
        if (this.CurrentLayout) {
            this.CurrentLayout.Render()
        }
    }

    Clear() {
        if (this.CurrentLayout) {
            this.CurrentLayout.Clear()
        }
    }
}

class Layout {
    rows: Array<RowDefinition>;
    columns: Array<ColumnDefinition>;
    cells: Array<Cell>;
    ControlPositions: [ControlPosition]
    
    constructor(rows: Array<RowDefinition>, columns: Array<ColumnDefinition>, cells: Array<Cell>, ControlPositions: [ControlPosition])
    {
        this.rows = rows;
        this.columns = columns;
        this.cells = cells;
        this.ControlPositions = ControlPositions;
    }

    CalculatePositions(width: number, height: number) {
        var PrecomputedRowHeights = new Array<number>();
        PrecomputedRowHeights.push(0);
        var PrecomputedColumnWidths = new Array<number>();
        PrecomputedColumnWidths.push(0);

        this.rows.forEach(element => {
            PrecomputedRowHeights.push(element.size + PrecomputedRowHeights[PrecomputedRowHeights.length - 1]);
        });

        this.columns.forEach(element => {
            PrecomputedColumnWidths.push(element.size + PrecomputedColumnWidths[PrecomputedColumnWidths.length - 1]);
        });

        PrecomputedRowHeights = PrecomputedRowHeights.map((i) => i * height);
        PrecomputedColumnWidths = PrecomputedColumnWidths.map((i) => i * width);

        if (this.cells.length * this.cells[0].length != this.rows.length * this.columns.length) {
            throw new Error("invalid combination of definitions and cells");
        }

        this.cells.forEach((Row, RowNumber) => {
            Row.forEach((Cell, ColumnNumber) => {
                if (Cell.item) {
                    if (Cell.padding) {
                        var _Width = PrecomputedColumnWidths[ColumnNumber];
                        var _Height = PrecomputedRowHeights[RowNumber];
                        var padding = Cell.padding;
                        Cell.item.x = _Width + (padding.left * this.width);
                        Cell.item.y = _Height + (padding.top * this.height);
                        Cell.item.width = PrecomputedColumnWidths[ColumnNumber + 1] - Cell.item.x - (padding.right * this.width);
                        Cell.item.height = PrecomputedRowHeights[RowNumber + 1] - Cell.item.y - (padding.bottom * this.height);
                        /*
                        if (ColumnNumber == 1 && RowNumber == 1) {
                            console.log("Pay attention to this one");
                        }
                        console.log("cell")
                        console.log(PrecomputedColumnWidths)
                        console.log(PrecomputedRowHeights)
                        console.log("ColumnNumber " + ColumnNumber)
                        console.log("RowNumber " + RowNumber)
                        console.log("x " + Cell.item.x)
                        console.log("y " + Cell.item.y)
                        console.log("width " + Cell.item.width)
                        console.log("height " + Cell.item.height)
                        console.log("padding.right " + padding.right * this.width)
                        console.log("padding.bottom " + padding.bottom * this.height)
                        console.log("padding.left " + padding.left * this.width)
                        console.log("padding.top " + padding.top * this.height)
                        */
                    }
                }
            });
        });
    }

    Render() {
        this.Clear();
        this.cells.forEach((row, RowNumber) => {
            row.forEach((cell, ColumnNumber) => {
                if (cell.item) {
                    cell.item.Render();
                }
            });
        });
    }

    Clear() {
        this.context.ClearWithinBox(0, 0, this.width, this.height);
    }

    HandleClick(x: number, y: number) {
        this.cells.forEach((row) => {
            row.forEach(cell => {
                if (cell.item) {
                    cell.item.HandleClick(x, y);
                }
            });
        });
    }

    HandleKeyDown(key: string) {
        this.cells.forEach((row) => {
            row.forEach(cell => {
                if (cell.item) {
                    cell.item.HandleKeyDown(key);
                }
            });
        });
    }
}

class Cell {
    control: Control;
    padding: Padding;
    position: GridPosition;
    constructor(control: Control, padding: Padding, position: GridPosition)
    {
        this.control = control;
        this.padding = padding;
        this.position = position;
    }
}

class GridPosition {
    row: number;
    column: number;
    constructor(row: number, column: number)
    {
        this.row = row;
        this.column = column;
    }
}

class ControlPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;
var CursorDisplay = true;

// style button like a button
// responsive break points

window.onload = () => {
    canvas = <HTMLCanvasElement>document.getElementById('main');
    context = <CanvasRenderingContext2D>canvas.getContext('2d');

    var renderingContext = new RenderContext(context);

    var rows = new Array<RowDefinition>(
        new ColumnDefinition(500),
        new ColumnDefinition(250),
        new ColumnDefinition(125),
        new ColumnDefinition(125)
    );

    var columns = new Array<ColumnDefinition>(
        new ColumnDefinition(250),
        new ColumnDefinition(250),
        new ColumnDefinition(250),
        new ColumnDefinition(250)
    );

    function StampCell(object?: Renderable, top?: number, left?: number, right?: number, bottom?: number) {
        return new Cell(new Padding(top, left, right, bottom), object);
    }

    function CreateArrayWithValues(length: number) {
        var start = 0;
        var result = [];
        while (start < length) {
            result.push(start);
            start++;
        }
        return result;
    }

    var cells = CreateArrayWithValues(rows.length).map(element => {
        return CreateArrayWithValues(columns.length).map(element => {
            return StampCell();
        });
    });

    //console.log(cells);
    /*
        var cells = new Array<Array<Cell>>(
            new Array(StampCell(), new Cell(new CheckBox(renderingContext), new Padding(0, 0, 0, 0)), new Cell(), new Cell()),
            new Array(new Cell(new Padding()), new Padding(0, 0, 0, 0)), new Cell(new CheckBox(renderingContext), new Padding(50, 50, 50, 50)), new Cell(new CheckBox(renderingContext), new Padding(0, 0, 0, 0)), new Cell(new CheckBox(renderingContext), new Padding(0, 0, 0, 0))),
            new Array(new Cell(), new Cell(new CheckBox(renderingContext), new Padding(0, 0, 0, 0)), new Cell(), new Cell()),
            new Array(new Cell(), new Cell(), new Cell(), new Cell(new CheckBox(renderingContext), new Padding(0, 0, 0, 0)))
        );
    */
    var main = new GridLayoutManager(renderingContext, canvas.width, canvas.height, new rows, columns, cells);

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

    function HandleResize() {
        var NewHeight = window.innerHeight;
        var NewWidth = window.innerWidth;

        canvas.height = NewHeight;
        canvas.width = NewWidth;
        CurrentPage.height = NewHeight;
        CurrentPage.width = NewWidth;
        CurrentPage.CalculatePositions();
        CurrentPage.Render();
    }

    window.addEventListener('resize', function (event) {
        HandleResize();
    });

    HandleResize();
}