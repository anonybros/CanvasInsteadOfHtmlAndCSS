String.prototype.insert = function (what, index) {
    return index > 0
        ? this.replace(new RegExp('.{' + index + '}'), '$&' + what)
        : what + this;
};

    Object.create = function (obj) {
        function tmp() { }
        tmp.prototype = obj;
        return obj;
    };

function Renderable(context) {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.context = context;

    this.DrawBox = function (x, y, width, height) {
        context.strokeRect(x, y, width, height);
    }

    this.DrawBoxFill = function (x, y, width, height)
    {
        context.fillRect(x, y, width, height);
    }

    this.DrawCheckMark = function (x, y, x2, y2, x3, y3)
    {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.stroke();
        context.closePath();
    }

    this.WithinThisBox = function (x, y) {
        if (x >= this.x && x <= this.x + this.width) {
            if (y >= this.y && y <= this.y + this.height) {
                return true;
            }
            return false;
        }
    }

    this.MeasureText = function (text) {
        return context.measureText(text).width;
    }

    this.DrawText = function (text, x, y) {
        context.fillText(text, x, y);
    }

    this.DrawTextClipped = function (text, x, y) {
        context.save();
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.clip();
        context.fillText(text, x, y);
        context.restore();
    }

    this.ClearWithinThisBox = function () {
        context.clearRect(this.x, this.y, this.width, this.height);
    }

    this.HandleClick = function (x, y) { };
    this.Clear = function () { };
    this.HandleKeyDown = function (key) { };
    this.Render = function () { };
}

var CheckBox = Object.create(Renderable);
CheckBox.checked = false;
CheckBox.radius = 0;
CheckBox.Render = function () {
    this.Clear();
    this.drawBox(this.x, this.y, this.radius * 2, this.radius * 2);
    if (this.checked) {
        this.DrawCheckMark(
            this.x + (this.radius * 0.05), this.y + this.radius - (this.radius * 0.05),
            this.x + this.radius, this.y + this.radius + (this.radius * 0.9),
            this.x + this.radius * 2 - (this.radius * 0.05), this.y + (this.radius * 0.05)
        );
    }
};
CheckBox.HandleClick = function (x, y) {
    if (this.WithinThisBox(x, y)) {
        this.checked = !this.checked;
    }
};

function StampCheckbox(context, x, y, radius, checked) {
    var c = new CheckBox(context);
    c.x = x;
    c.y = y;
    c.checked = checked;
    c.radius = radius;
    return c;
}

var Cursor = Object.create(Renderable);
Cursor.height = 0;
Cursor.Render = function () {
    var width = 1;
    this.Clear();
    this.DrawBox(this.x, this.y, width, this.height);
};

function StampCursor(context, x, y, height) {
    var c = new Cursor(context);
    c.x = x;
    c.y = y;
    c.height = height;
    return c;
}

var TextBox = Object.create(Renderable);
TextBox.text = "";
TextBox.adjustment = 0;
TextBox.AcceptInput = false;
TextBox.CursorPosition = 0;
TextBox.MoveCursorLeft = function () {
    if (this.CursorPosition != 0) {
        this.CursorPosition -= 1;
    }
}
TextBox.MoveCursorRight = function () {
    if (this.CursorPosition <= this.text.length) {
        this.CursorPosition += 1;
    }
}
TextBox.Render = function () {
    //console.log(this.CursorPosition)
    //console.log(this.text.length);
    this.Clear();
    this.DrawBox(this.x, this.y, this.width, this.height);
    this.context.font = (this.height - (this.height * 0.25)) + 'px serif';

    var t = this.text.substring(0, this.CursorPosition);
    //console.log(t);
    var width = this.MeasureText(t);

    var c = new Cursor();

    //console.log(width);
    var c = StampCursor(
        this.context,
        (this.x + (this.width * 0.025)) + width - this.adjustment,
        this.y + (this.height * 0.05),
        this.height - (this.height * 0.1)
    )

    if (this.AcceptInput && CursorDisplay) {
        //console.log("displaying at " + c.x + " " + c.y)
        c.Render();
    }
    else {
        //console.log("not displaying")
        c.Clear();
    }

    if (this.text) {
        this.DrawTextClipped(this.text, (this.x + (this.width * 0.025)) - this.adjustment, this.y + this.height - (this.height * 0.25));
    }
};

TextBox.HandleKeyDown = function (key) {
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
            this.text = this.text.insert(key, this.CursorPosition);
        }
        this.MoveCursorRight();
    }

    if (context.measureText(this.text.substring(0, this.CursorPosition)).width - this.adjustment >= this.width + this.x - (this.width * 0.025)) {
        this.adjustment += context.measureText(this.text[this.text.length - 1]).width;
    }

    if (context.measureText(this.text.substring(0, this.CursorPosition)).width - this.adjustment <= this.x + (this.width * 0.025)) {
        this.adjustment -= context.measureText(this.text[this.text.length - 1]).width;
        if (this.adjustment < 0) {
            this.adjustment = 0;
        }
    }
}

TextBox.HandleClick = function (x, y) {
    if (this.WithinThisBox(x, y)) {
        this.AcceptInput = true;
    }
    else {
        this.AcceptInput = false;
    }
};

function StampTextBox(context, x, y, width, height, text) {
    var t = new TextBox(context);
    t.x = x;
    t.y = y;
    t.width = width;
    t.height = height;
    t.text = text;
    return t;
}

var Button = Object.create(Renderable);
Button.onclick = null;
Button.text = "";
Button.Render = function () {
    this.Clear();
    this.context.save();
    this.context.fillStyle = "#cccccc";
    this.DrawBoxFill(this.x, this.y, this.width, this.height);
    this.context.restore();
    if (this.text) {
        this.DrawTextClipped(this.text, (this.x + (this.width * 0.025)), this.y + this.height - (this.height * 0.25));
    }
};

Button.HandleClick = function (x, y) {
    if (this.WithinThisBox(x, y)) {
        if (this.onclick) {
            this.onclick();
        }
    }
};

function StampButton(context, x, y, width, height, text, click)
{
    var t = new Button(context);
    t.x = x;
    t.y = y;
    t.width = width;
    t.height = height;
    t.text = text;
    t.onclick = click;
    return t;
}

var Text = Object.create(Renderable);
Text.text = "";

Text.Render = function () {
    this.Clear();
    if (this.text) {
        this.DrawTextClipped(this.text, (this.x + (this.width * 0.025)), this.y + this.height - (this.height * 0.25));
    }
};

function StampText(context, x, y, width, height, text)
{
    var t = new Text(context);
    t.x = x;
    t.y = y;
    t.width = width;
    t.height = height;
    t.text = text;
    return t;
}

function GridLayoutManager(context, canvas, NumberOfColumns, NumberOfRows) {
    this.NumberOfColumns = NumberOfColumns;
    this.NumberOfRows = NumberOfRows;
    var Height = canvas.height;
    var Width = canvas.width;
    var HeightOfAColumn = Height / NumberOfRows;
    var WidthOfAColumn = Width / NumberOfColumns;

    var Values = new Array(this.NumberOfColumns * this.NumberOfRows);

    function PositionAndSizeFromGrid(Column, Row, object) {
        var x = WidthOfAColumn * Column;
        var y = HeightOfAColumn * Row;

        object.x = x;
        object.y = y;
        object.radius = HeightOfAColumn / 2;
        object.height = HeightOfAColumn;
        object.width = WidthOfAColumn;
    }

    this.AddToGrid = function (item, Column, Row) {
        PositionAndSizeFromGrid(Column, Row, item)
        Values[Row * this.NumberOfColumns + Column] = item;
    }

    function ForEach(action, array) {
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element != null) {
                action(element);
            }
        }
    }

    this.Render = function (context) {
        ForEach(function (o) {
            o.Render(context);
        }, Values)
    };

    this.HandleClick = function (x, y) {
        ForEach(function (o) {
            if (o.HandleClick) {
                o.HandleClick(x, y);
            }
            o.Render(context);
        }, Values)
    }

    this.HandleKeyDown = function (key) {
        ForEach(function (o) {
            if (o.HandleKeyDown) {
                o.HandleKeyDown(key);
            }
            o.Render(context);
        }, Values)
    }
}


var canvas;
var context;
var CursorDisplay = true;


// need to add padding 
// style button like a button
// create columns and rows of any size
// avoid duplicates of drawing /handling functions - so much duplicated codes

$(function () {
    $canvas = $('#main');
    canvas = $canvas[0];
    context = canvas.getContext('2d');

    var CurrentPage = null;

    var main = new GridLayoutManager(context, canvas, 5, 5);
    var page2 = new GridLayoutManager(context, canvas, 1, 1);

    var t = StampText(context, 0, 0, 0, 0, "Page2")

    page2.AddToGrid(t, 0, 0);

    $(document).keydown(function (e) {
        e.preventDefault();
        CurrentPage.HandleKeyDown(e.key);
    });

    $canvas.click(function (e) {
        CurrentPage.HandleClick(e.pageX, e.pageY);
    });

    setInterval(function () {
        CursorDisplay = !CursorDisplay;
    }, 500);

    var b = StampButton(context, 0,0,0,0,"2", function () {
        CurrentPage = page2;
        main.Clear(context);
        page2.Render(context);
    });

    main.AddToGrid(StampTextBox(context, 0,0,0,0,"0,0"), 0, 0)
    main.AddToGrid(StampCheckbox(context, 0,0,0,false), 1, 1)
    main.AddToGrid(StampTextBox(context, 0,0,0,0,"2,0"), 2, 0)
    main.AddToGrid(b, 0, 2)
    main.AddToGrid(StampCheckbox(context, 0,0,0,true), 5, 5)

    main.Render(context);

    CurrentPage = main;
});