const ejsEngine = require('./renderEngineModule');
const database = require('./databaseModule');
const visualizationDataProcessor = require('./dataVisualisationModule');



function commandHelp() {
    return "Here is a list of available commands:\n" +
        "\t- help\n" +
        "\t- queryTable\n" +
        "\t- queryGraph\n" +
        "\t- searchDocs";
}

async function queryDatabaseAndRenderResult(isGraphQuery, query) { //TODO: remove async
    let data = await database.requestQuery(query);
    if (data === "invalid query") {
        return "<p> Invalid query syntax. Try something else.</p>";
    } else {
        let result;
        if (data.length > 0) {
            if (isGraphQuery) {
                data = visualizationDataProcessor.formatData(data);
                result = ejsEngine.render('graphTemplate', data);
            } else {
                result = ejsEngine.render('tableTemplate', data);
            }
            return result;
        } else {
            return "<p> Your query did not yield any results. Please update your search and filter parameters.</p>";
        }
    }
}

function commandSearchDocs() {
    return "Link to document search in appApi/modules/superuserModule.ejs";
}


async function handleSuperuserCommand(command, res) {

    // Splitting input into command and arguments
    const commandArgumentArray = command.split(/ (.*)/);
    var commandCode, commandArgument;
    if (commandArgumentArray.length > 1) {
        commandCode = commandArgumentArray[0];
        commandArgument = commandArgumentArray[1];
    } else {
        commandCode = commandArgumentArray[0];
    }

    switch (commandCode) {
        case "help":
            return commandHelp();
        case "tableQuery":
            return await queryDatabaseAndRenderResult(false, commandArgument);
        case "graphQuery":
            return await queryDatabaseAndRenderResult(true, commandArgument);
        case "searchDocs":
            return commandSearchDocs();
        default:
            return "Invalid Command"
    }
}

exports.handler = handleSuperuserCommand;