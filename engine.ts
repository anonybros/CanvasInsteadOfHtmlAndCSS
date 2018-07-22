class RenderContext {
    // these are the html5 spec defaults
    FillStyle: string = "#000";
    Font: string = "10px sans-serif";

    DrawBox(x: number, y: number, width: number, height: number) {
        context.strokeRect(x, y, width, height);
    }

    DrawBoxFill(x: number, y: number, width: number, height: number) {
        context.fillRect(x, y, width, height);
    }

    DrawCheckMark(x: number, y: number, x2: number, y2: number, x3: number, y3: number) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.stroke();
        context.closePath();
    }

    MeasureText(text: string) {
        return context.measureText(text).width;
    }

    DrawText(text: string, x: number, y: number) {
        context.fillText(text, x, y);
    }

    DrawTextClipped(text: string, x: number, y: number, width: number, height: number) {
        context.save();
        context.beginPath();
        context.rect(x, y, width, height);
        context.clip();
        context.fillText(text, x, y);
        context.restore();
    }

    ClearWithinBox(x: number, y: number, width: number, height: number) {
        context.clearRect(x, y, width, height);
    }

    SetFont(font: string) {
        context.font = font;
    }

    ResetFont() {
        context.font = this.Font;
    }

    SetFillStyle(style: string) {
        context.fillStyle = style;
    }

    ResetFillStyle() {
        context.fillStyle = this.FillStyle;
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

class GridPosition {
    row: number = 0;
    column: number = 0;
}

class CellLocationWithPadding {
    CellLocation: GridPosition = new GridPosition();
    padding: Padding = new Padding();
}

class ControlPosition {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    WithinBox(x: number, y: number) {
        if (x >= this.x && x <= this.x + this.width) {
            if (y >= this.y && y <= this.y + this.height) {
                return true;
            }
            return false;
        }
    }
}

function CalculatePositions(rows: RowDefinition[], columns: ColumnDefinition[], cells: CellLocationWithPadding[], width: number, height: number) {
    var PrecomputedRowHeights = new Array<number>();
    PrecomputedRowHeights.push(0);
    var PrecomputedColumnWidths = new Array<number>();
    PrecomputedColumnWidths.push(0);

    rows.forEach(element => {
        PrecomputedRowHeights.push(element.size + PrecomputedRowHeights[PrecomputedRowHeights.length - 1]);
    });

    columns.forEach(element => {
        PrecomputedColumnWidths.push(element.size + PrecomputedColumnWidths[PrecomputedColumnWidths.length - 1]);
    });

    PrecomputedRowHeights = PrecomputedRowHeights.map((i) => i * height);
    PrecomputedColumnWidths = PrecomputedColumnWidths.map((i) => i * width);

    var positions = new Array<ControlPosition>();

    cells.forEach((Cell) => {
        var gridPosition = Cell.CellLocation;
        var _Width = PrecomputedColumnWidths[gridPosition.column];
        var _Height = PrecomputedRowHeights[gridPosition.row];
        var padding = Cell.padding;
        var CellPosition = new ControlPosition();
        CellPosition.x = _Width + (padding.left * width);
        CellPosition.y = _Height + (padding.top * height);
        CellPosition.width = PrecomputedColumnWidths[gridPosition.column + 1] - CellPosition.x - (padding.right * width);
        CellPosition.height = PrecomputedRowHeights[gridPosition.row + 1] - CellPosition.y - (padding.bottom * height);
        positions.push(CellPosition);
    });
    return positions;
}

interface Data {
    Clicked(): void;
    KeyPressed(key: string): void;
    Render(position: ControlPosition): void;
    Clear(position: ControlPosition): void;
}

class Page {
    name: string = "";
    controls: Data[] = [];
    layout: Layout[] = [];
    BreakPoints: number[] = [];
}

class Layout {
    rows: RowDefinition[] = [];
    columns: ColumnDefinition[] = [];
    cells: CellLocationWithPadding[] = [];
}

function DetermineLayout(page: Page, width: number): Layout {
    for (let index = 0; index < page.BreakPoints.length; index++) {
        const element = page.BreakPoints[index];
        var next;
        if (index + 1 > page.BreakPoints.length) {
            next = Number.MAX_VALUE;
        }
        else {
            next = page.BreakPoints[index + 1];
        }

        if (width > element && width < next) {
            return page.layout[index];
        }
    }
    return page.layout[0];
}

var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;
var CursorDisplay = true;

// style button like a button

class Engine {
    private current: Data[] = [];
    pages: Page[] = [];
    CurrentPage: Page = new Page();
    private positions: ControlPosition[] = [];

    ChangePage(name: string) {
        this.Clear();

        var NewHeight = window.innerHeight;
        var NewWidth = window.innerWidth;

        this.CurrentPage = this.pages.filter(item => item.name === name)[0];
        this.current = this.CurrentPage.controls;

        var layout = DetermineLayout(this.CurrentPage, NewWidth);
        var positions = CalculatePositions(layout.rows, layout.columns, layout.cells, NewWidth, NewHeight);
        this.positions = positions;
    }

    HandleKeyDown(key: string) {
        this.current.forEach(element => {
            element.KeyPressed(key);
        });
    }

    HandleClick(x: number, y: number) {
        this.positions.forEach((element, index) => {
            this.current[index].Clicked();
        });
    }

    private Clear() {
        this.positions.forEach((element, index) => {
            this.current[index].Clear(element);
        });
    }

    private Render() {
        this.positions.forEach((element, index) => {
                this.current[index].Render(element);
        });
    }

    HandleResize() {
        var NewHeight = window.innerHeight;
        var NewWidth = window.innerWidth;

        canvas.height = NewHeight;
        canvas.width = NewWidth;

        var layout = DetermineLayout(this.CurrentPage, NewWidth);
        this.positions = CalculatePositions(layout.rows, layout.columns, layout.cells, NewWidth, NewHeight);
        this.Render();
    }
}

var rContext = new RenderContext()

window.onload = () => {

    canvas = <HTMLCanvasElement>document.getElementById('main');
    context = <CanvasRenderingContext2D>canvas.getContext('2d');

    var pages = GeneratePages();

    var engine = new Engine();
    engine.pages = pages;
    engine.CurrentPage = pages[0];

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