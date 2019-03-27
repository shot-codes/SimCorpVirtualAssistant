
export function setResponse(val) {
    $("#response").text($("#response").text() + val + "\r\n");
    $("#response").scrollTop($("#response")[0].scrollHeight);
}

function addRow() {
    $("#table").append("<tr>\n" +
        "<th scope=\"row\">1</th>\n" +
        "<td>AAPL</td>\n" +
        "<td>NASDAQ</td>\n" +
        "<td>174.32</td>\n" +
        "<td>174.91</td>\n" +
        "<td>172.92</td>\n" +
        "<td>816.45B</td>\n" +
        "<td>1.69 %</td>\n" +
        "</tr>");
}

function removeRow() {
    $("#table tr:last").remove();
}

function toggleTable() {
    $("#table").toggle();
}

function flipTable() {
    $("tbody").each(function(elem,index){
        var arr = $.makeArray($("tr",this).detach());
        arr.reverse();
        $(this).append(arr);
    });
}

function searchTable(string) {
    $('#table').DataTable().search(string).draw();
}

function clearSearch() {
    $('#table').DataTable().search("").draw();
}

export function action(data) {

    let intent = data.result.action;

    if (data.result.actionIncomplete) return;

    // TODO: Make robust
    let stockAttribute =  data.result.parameters["StockAttribute"];
    let searchString = data.result.parameters["any"];


    switch (intent) {
        case "input.addRow":
            addRow();
            break;
        case "input.deleteRow":
            removeRow();
            break;
        case "input.toggleTable":
            toggleTable();
            break;
        case "reverseTable":
            flipTable();
            break;
        case "searchTable":
            searchTable(searchString);
            break;
        case "clearSearch":
            clearSearch();
            break;
        case "sortBy":
            switch (stockAttribute) {
                case "title":
                    $("#stockTitle").click();
                    break;
                case "market":
                    $("#market").click();
                    break;
                case "price":
                    $("#currentPrice").click();
                    break;
                case "opening price":
                    $("#open").click();
                    break;
                case "daily high":
                    $("#dailyHigh").click();
                    break;
                case "daily low":
                    $("#dailyLow").click();
                    break;
                case "percent change":
                    $("#percentChange").click();
                    break;
            }

            break;
    }
}




