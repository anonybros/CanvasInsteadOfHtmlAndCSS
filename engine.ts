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
    HandleClick(x: number, y: number, xStart: number, yStart: number, height: number, width: number, context: RenderContext): void
    HandleKeyDown(key: string): void
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

    HandleKeyDown(key: string) {
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

        if (this.AcceptInput && CursorDisplay) {
            //console.log("displaying at " + c.x + " " + c.y)
            this.context.DrawBox(
                (this.x + (this.width * 0.025)) + width - this.adjustment,
                this.y + (this.height * 0.05),
                1,
                this.height - (this.height * 0.1)
            )
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
    controls: Control[];
    pages: Page[];
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
            this.CurrentPage.Clear(this.context);
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
        this.Render();
    }

    HandleClick(x: number, y: number) {
        if (this.CurrentPage) {
            this.CurrentPage.HandleClick(x, y);
        }
        this.Render();
    }

    HandleKeyDown(key: string) {
        if (this.CurrentPage) {
            this.CurrentPage.HandleKeyDown(key);
        }
        this.Render();
    }

    Render() {
        if (this.CurrentPage) {
            this.CurrentPage.Render(this.context);
        }
    }

    Clear() {
        if (this.CurrentPage) {
            this.CurrentPage.Clear(this.context);
        }
    }
}

class Page {

    name: string;
    layout: [Layout];
    BreakPoints: [number];
    CurrentLayout?: Layout;

    constructor(name: string, layout: [Layout], BreakPoints: [number]) {
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

    HandleResize(width: number, height: number, context : RenderContext) {
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
            this.CurrentLayout.Render(context)
        }
    }

    Render(context: RenderContext) {
        if (this.CurrentLayout) {
            this.CurrentLayout.Render(context)
        }
    }

    Clear(context: RenderContext) {
        if (this.CurrentLayout) {
            this.CurrentLayout.Clear(context, , )
        }
    }
}

class Layout {
    rows: Array<RowDefinition>;
    columns: Array<ColumnDefinition>;
    cells: Array<Cell>;
    width: number = 0;
    height: number = 0;

    constructor(rows: Array<RowDefinition>, columns: Array<ColumnDefinition>, cells: Array<Cell>, ControlPositions: [ControlPosition]) {
        this.rows = rows;
        this.columns = columns;
        this.cells = cells;
    }

    CalculatePositions(width: number, height: number) {
        this.width = width;
        this.height = height;

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

        this.cells.forEach((Cell) => {
            var gridPosition = Cell.gridPosition;
            var _Width = PrecomputedColumnWidths[gridPosition.column];
            var _Height = PrecomputedRowHeights[gridPosition.row];
            var padding = Cell.padding;
            var CellPosition = Cell.controlPosition;
            CellPosition.x = _Width + (padding.left * width);
            CellPosition.y = _Height + (padding.top * height);
            CellPosition.width = PrecomputedColumnWidths[gridPosition.column + 1] - CellPosition.x - (padding.right * width);
            CellPosition.height = PrecomputedRowHeights[gridPosition.row + 1] - CellPosition.y - (padding.bottom * height);
        });
    }

    Render(context: RenderContext) {
        this.Clear(context, this.width, this.height);
        this.cells.forEach((cell) => {
            var position = cell.controlPosition;
            var control = cell.control;
            control.Render(position.x, position.y, position.height, position.width, context);
        });
    }

    Clear(context: RenderContext, width: number, height: number) {
        context.ClearWithinBox(0, 0, width, height);
    }

    HandleClick(x: number, y: number) {
        this.cells.forEach((cell) => {
            var position = cell.controlPosition;
            var control = cell.control;
            control.HandleClick(x, y, position.x, position.y, position.height, position.width, context);
        });
    }

    HandleKeyDown(key: string) {
        this.cells.forEach((cell) => {
                    cell.control.HandleKeyDown(key);
        });
    }
}

class Cell {
    control: Control;
    padding: Padding;
    gridPosition: GridPosition;
    controlPosition: ControlPosition;
    constructor(control: Control, padding: Padding, gridPosition: GridPosition, controlPosition: ControlPosition) {
        this.control = control;
        this.padding = padding;
        this.gridPosition = gridPosition;
        this.controlPosition = controlPosition;
    }
}

class GridPosition {
    row: number;
    column: number;
    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
    }
}

class ControlPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number) {
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

window.onload = () => {
    canvas = <HTMLCanvasElement>document.getElementById('main');
    context = <CanvasRenderingContext2D>canvas.getContext('2d');

    var controls : Control[] = [];
    var pages : Page[] = [];

    var engine = new Engine(controls, pages, context);

    document.onkeydown = (e) => {
        e.preventDefault();
        engine.HandleKeyDown(e.key);
    }

    canvas.onclick = (e) => {
        engine.HandleClick(e.pageX, e.pageY);
    }

    window.addEventListener('resize', function (event) {
        engine.HandleResize();
    });

    engine.HandleResize();
}