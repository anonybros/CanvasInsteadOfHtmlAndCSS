
class CheckBox implements Data {
    checked: boolean;

    constructor(checked: boolean = false) {
        this.checked = checked;
    }

    Render(position: ControlPosition) {
        this.Clear(position);
        var x = position.x;
        var y = position.y;
        var width = position.width;
        var height = position.height;

        rContext.DrawBox(x, y, width, height);
        if (this.checked) {
            rContext.DrawCheckMark(
                x + (width / 2 * 0.05), y + height / 2 - (height / 2 * 0.05),
                x + width / 2, y + height / 2 + (height / 2 * 0.9),
                x + width - (width / 2 * 0.05), y + (height / 2 * 0.05)
            );
        }
    }

    Clear(position: ControlPosition) {
        rContext.ClearWithinBox(position.x, position.y, position.width, position.height);
    }

    Clicked() {
        this.checked = !this.checked;
    }

    KeyPressed(key: string) {
    }
}

class TextBox implements Data {
    adjustment: number;
    AcceptInput: boolean;
    CursorPosition: number;
    text: string;

    constructor(text: string) {
        this.text = text;
        this.adjustment = 0;
        this.AcceptInput = false;
        this.CursorPosition = 0;
    }

    Render(position: ControlPosition) {
        this.Clear(position);

        var x = position.x;
        var y = position.y;
        var width = position.width;
        var height = position.height;

        if (rContext.MeasureTextWidth(this.text.substring(0, this.CursorPosition)) - this.adjustment <= x + (width * 0.025)) {
            this.adjustment -= rContext.MeasureTextWidth(this.text[this.text.length - 1]);
            if (this.adjustment < 0) {
                this.adjustment = 0;
            }
        }

        if (rContext.MeasureTextWidth(this.text.substring(0, this.CursorPosition)) - this.adjustment >= width + x - (width * 0.025)) {
            this.adjustment += rContext.MeasureTextWidth(this.text[this.text.length - 1]);
        }

        rContext.DrawBox(x, y, width, height);
        rContext.SetFont((height - (height * 0.25)) + 'px serif');

        var t = this.text.substring(0, this.CursorPosition);
        //console.log(t);
        var width = rContext.MeasureTextWidth(t);

        if (this.AcceptInput && CursorDisplay) {
            //console.log("displaying at " + c.x + " " + c.y)
            rContext.DrawBox(
                (x + (width * 0.025)) + width - this.adjustment,
                y + (height * 0.05),
                1,
                height - (height * 0.1)
            )
        }

        if (this.text) {
            rContext.DrawTextClipped(this.text, x, y, (x + (width * 0.025)) - this.adjustment, y + height - (height * 0.25));
        }
    }

    Clear(position: ControlPosition) {
        rContext.ClearWithinBox(position.x, position.y, position.width, position.height);
    }

    Clicked() {
        this.AcceptInput = !this.AcceptInput;
    }

    KeyPressed(key: string) {
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

class Button implements Data {
    text: string;
    onclick: () => void

    constructor(onclick: () => void, text: string) {
        this.onclick = onclick;
        this.text = text;
    }

    Render(position: ControlPosition) {
        var x = position.x;
        var y = position.y;
        var width = position.width;
        var height = position.height;
        rContext.SetFillStyle("#cccccc");
        rContext.DrawBoxFill(x, y, width, height);
        rContext.ResetFillStyle();
        if (this.text) {
            rContext.DrawTextClipped(this.text, x, y, (x + (width * 0.025)), y + height - (height * 0.25));
        }
    }

    Clear(position: ControlPosition) {
        rContext.ClearWithinBox(position.x, position.y, position.width, position.height);
    }

    Clicked() {
        this.onclick();
    }

    KeyPressed(x: string) {
    }
}

class TextLiteral implements Data {
    text_: string;

    constructor(text_: string) {
        this.text_ = text_;
    }

    Render(position: ControlPosition) {
        this.Clear(position);
        if (this.text_) {
            rContext.DrawTextClipped(this.text_, position.x, position.y, (position.x + (position.width * 0.025)), position.y + position.height - (position.height * 0.25));
        }
    }

    Clear(position: ControlPosition) {
        rContext.ClearWithinBox(position.x, position.y, position.width, position.height);
    }

    Clicked() {
    }

    KeyPressed(x: string) {
    }
}