String.prototype.insert = function (what, index) {
    return index > 0
        ? this.replace(new RegExp('.{' + index + '}'), '$&' + what)
        : what + this;
};

function WithinBox(x, y, xStart, yStart, xEnd, yEnd) {
    if (x >= xStart && x <= xEnd) {
        if (y >= yStart && y <= yEnd) {
            return true;
        }
        return false;
    }
}

function CheckBox() {
    this.x = 0;
    this.y = 0;
    this.checked = false;
    this.radius = 0;

    this.Render = function (context) {
        this.Clear(context);
        context.strokeRect(this.x, this.y, this.radius * 2, this.radius * 2);
        if (this.checked) {
            context.beginPath();
            context.moveTo(this.x + (this.radius * 0.05), this.y + this.radius - (this.radius * 0.05));
            context.lineTo(this.x + this.radius, this.y + this.radius + (this.radius * 0.9));
            context.lineTo(this.x + this.radius * 2 - (this.radius * 0.05), this.y + (this.radius * 0.05));
            context.stroke();
            context.closePath();
        }
    };

    this.Clear = function (context) {
        context.clearRect(this.x, this.y, this.radius * 2, this.radius * 2);
    }

    this.HandleKeyDown = function (key) {
    }

    this.HandleClick = function (x, y) {
        if (WithinBox(x, y, this.x, this.y, this.x + this.radius * 2, this.y + this.radius * 2)) {
            this.checked = !this.checked;
        }
    };
}

function Cursor() {
    this.x = 0;
    this.y = 0;
    this.height = 0;

    var width = 1;

    this.Render = function (context) {
        this.Clear(context);
        context.fillRect(this.x, this.y, width, this.height);
    }

    this.Clear = function (context) {
        context.clearRect(this.x, this.y, width, this.height);
    }
}


function TextBox() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.text = "";
    this.adjustment = 0;
    this.AcceptInput = false;
    this.CursorPosition = 0;

    this.MoveCursorLeft = function () {
        if (this.CursorPosition != 0) {
            this.CursorPosition -= 1;
        }
    }

    this.MoveCursorRight = function () {
        if (this.CursorPosition <= this.text.length) {
            this.CursorPosition += 1;
        }
    }

    this.Render = function (context) {
        //console.log(this.CursorPosition)
        //console.log(this.text.length);
        this.Clear(context);
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.font = (this.height - (this.height * 0.25)) + 'px serif';

        var t = this.text.substring(0, this.CursorPosition);
        //console.log(t);
        var width = context.measureText(t).width;

        var c = new Cursor();

        //console.log(width);
        c.x = (this.x + (this.width * 0.025)) + width - this.adjustment;
        c.y = this.y + (this.height * 0.05);
        c.height = this.height - (this.height * 0.1);

        if (this.AcceptInput && CursorDisplay) {
            //console.log("displaying at " + c.x + " " + c.y)
            c.Render(context);
        }
        else {
            //console.log("not displaying")
            c.Clear(context);
        }

        if (this.text) {
            context.beginPath();
            context.rect(this.x, this.y, this.width, this.height);
            context.clip();
            context.fillText(this.text, (this.x + (this.width * 0.025)) - this.adjustment, this.y + this.height - (this.height * 0.25));
            context.restore();
        }
    };

    this.Clear = function (context) {
        context.clearRect(this.x, this.y, this.width, this.height);
    }

    this.HandleKeyDown = function (key) {
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

        //console.log(this.text);
    }

    this.HandleClick = function (x, y) {
        if (WithinBox(x, y, this.x, this.y, this.x + this.width, this.y + this.height)) {
            this.AcceptInput = true;
        }
        else {
            this.AcceptInput = false;
        }
    };
}

function GridLayoutManager(context, canvas, NumberOfColumns, NumberOfRows) {
    // need to add some form of padding
    
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
            o.HandleClick(x, y);
            o.Render(context);
        }, Values)
    }
    
    this.HandleKeyDown = function (key) {
        ForEach(function (o) {
            o.HandleKeyDown(key);
            o.Render(context);
        }, Values)
    }
}

function Button() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.text = "";
    this.onclick = null;
    this.Render = function (context) {
        this.Clear(context);
        if (this.text) {
            context.beginPath();
            context.rect(this.x, this.y, this.width, this.height);
            context.clip();
            context.fillText(this.text, (this.x + (this.width * 0.025)) - this.adjustment, this.y + this.height - (this.height * 0.25));
            context.restore();
        }
    };

    this.HandleClick = function (x, y) {
        if (WithinBox(x, y, this.x, this.y, this.x + this.width, this.y + this.height)) {
            if (this.onclick) {
                this.onclick();
            }
        }
    };

    this.Clear = function (context) {
        context.clearRect(this.x, this.y, this.width, this.height);
    }
}

var canvas;
var context;
var CursorDisplay = true;

$(function () {
    $canvas = $('#main');
    canvas = $canvas[0];
    context = canvas.getContext('2d');

    var main = new GridLayoutManager(context, canvas, 5, 5);

    $(document).keydown(function (e) {
        e.preventDefault();
        main.HandleKeyDown(e.key);
    });

    $canvas.click(function (e) {
        main.HandleClick(e.pageX, e.pageY);
    });

    setInterval(function () {
        CursorDisplay = !CursorDisplay;
    }, 500);


    main.AddToGrid(new TextBox(), 0, 0)
    main.AddToGrid(new CheckBox(), 1, 1)
    main.AddToGrid(new TextBox(), 2, 0)
    main.AddToGrid(new TextBox(), 0, 2)
    main.AddToGrid(new CheckBox(), 5, 5)

    main.Render(context);
});