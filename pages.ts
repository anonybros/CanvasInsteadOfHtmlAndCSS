function GeneratePages(): Page[] {
    var page = new Page();
    page.BreakPoints = [0, 1500, 3000]
    page.controls = [new TextLiteral("This is a test")];
    page.name = "main page";

    var cell = new CellLocationWithPadding();
    //TODO: fix error in console
    //TODO: determine how Page.controls are lined up with Layout.cells
    var gridpos = new GridPosition();
    gridpos.column = 1;
    gridpos.row = 1;
    cell.CellLocation = gridpos;

    var padding = new Padding();
    padding.bottom = 15;
    padding.top = 10;
    padding.left = 25;
    padding.right = 5;
    cell.padding = padding;

    var f0to1500 = new Layout();
    f0to1500.rows = [new RowDefinition(333), new RowDefinition(333), new RowDefinition(333)]
    f0to1500.columns = [new ColumnDefinition(333), new ColumnDefinition(333), new ColumnDefinition(333)]

    f0to1500.cells = [cell]

    var f1500to3000 = new Layout();
    f1500to3000.rows = [new RowDefinition(250), new RowDefinition(250), new RowDefinition(250), new RowDefinition(250)]
    f1500to3000.columns = [new ColumnDefinition(333), new ColumnDefinition(333), new ColumnDefinition(333)]

    f1500to3000.cells = [cell]


    var f3000on = new Layout();
    f3000on.rows = [new RowDefinition(200), new RowDefinition(200), new RowDefinition(200), new RowDefinition(200), new RowDefinition(200)]
    f3000on.columns = [new ColumnDefinition(333), new ColumnDefinition(333), new ColumnDefinition(333)]

    f3000on.cells = [cell]


    page.layout = [f0to1500, f1500to3000, f3000on];

    return [page];
} 