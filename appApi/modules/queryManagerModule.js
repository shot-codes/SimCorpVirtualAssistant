
const columnPositions = ["Symbol", "QC", "Type", "Price", "Total_QTY", "Total_Price", "Maturity_Date", "Dirty_Value_QC", "Dirty_Value_PC", "Dirty_Value_RC"];
const allColumns = "Symbol, QC, Type, Price, Total_QTY, Total_Price, Maturity_Date, Dirty_Value_QC, Dirty_Value_PC, Dirty_Value_RC";
let modColumns = columnPositions.slice();

const baseQueryObject = {
    columns: allColumns,
    filter: [],
    sort: "",
    order : "",
    group: "",
    search: ""
};

// --------- aux function ---------

function parseColumnsToSqlSyntax(queryObject) {
    // parse string from modColumns into SQL syntax
    let sqlString = "";

    modColumns.forEach(function (column) {
        sqlString += column + ", ";
    });

    sqlString = sqlString.substr(0, sqlString.length - 2);

    queryObject.columns = sqlString;
    return queryObject;
}

// --------- Table operations ---------

function hideColumnsInTable(queryObject, columnNames) {

    // modify column names to be shown (remove selected columns from modColumns
    columnNames.forEach(function (column) {
        if (modColumns.indexOf(column) > -1) {
            modColumns.splice(modColumns.indexOf(column), 1);
        }
    });

    return parseColumnsToSqlSyntax(queryObject);
}

function showColumnsInTable(queryObject, columnNames) {
    let standardPos = -1;       // this variable will hold the standard position of the column
    let insertIndex = -1;       // this variable will hold the insertion position of the column

    // iterate over all columns contained in the argument list
    columnNames.forEach(function (column) {

        // only add columns that are not contained in the current table.
        if (modColumns.indexOf(column) === -1) {
            standardPos = columnPositions.indexOf(column);  // get the standard position of the current column
            insertIndex = -1;                               // set insertion index to -1

            // iterate over all columns currently shown in the table. When a column is encountered that is usually
            // positioned to the right of the current column in question, save that index.
            for (let i = 0; i < modColumns.length; i++) {
                if (columnPositions.indexOf(modColumns[i]) >= standardPos && insertIndex === -1) {
                    insertIndex = i;
                }
            }

            // insert the column as the last column if the index has not been updated
            if (insertIndex === -1) {
                modColumns.push(column);
            }
            // insert the column at the insertion index
            else {
                modColumns.splice(insertIndex, 0, column);
            }
        }
    });

    return parseColumnsToSqlSyntax(queryObject)
}

function showAllColumnsInTable(queryObject) {
    queryObject.columns = allColumns;
    return queryObject;
}

function filterTable(queryObject, stockAttribute, threshold, higherLower) {
    let isHigher = 'false';

    if (higherLower === "higher than") {
        isHigher = 'true';
    }
    queryObject.filter = [[stockAttribute, threshold, isHigher]];
    return queryObject;
}

function groupTable(queryObject, columnName) {
    queryObject.group = columnName;
    return queryObject;
}

function ungroupTable(queryObject) {
    queryObject.group = "";
    return queryObject;
}

function searchTable(queryObject, searchString) {
    queryObject.search = "Symbol = '" + searchString + "' OR Type = '" + searchString + "' OR QC = '" + searchString + "'";
    return queryObject;
}

function clearSearch(queryObject) {
    queryObject.search = "";
    return queryObject;
}

function sortTable(queryObject, stockAttribute) {
    queryObject.sort = stockAttribute;
    return queryObject;
}

//Move to backend
function reverseTable(queryObject) {
    if (queryObject.order === "DESC") {
        queryObject.order = "";
    } else {
        queryObject.order = "DESC";
    }
    return queryObject;
}

function barDiagramQuery(queryObject, param) {
    queryObject.columns = "Symbol, " + param;
    return queryObject;
}
// ----------------------------------

function  queryParser(queryObject) {
    if (!queryObject) return undefined;

    let query = "SELECT " + queryObject.columns + " FROM DB_Data"; // Re-arranging

    // Filter and Search
    let filterLength = queryObject.filter.length;
    let searchLength = queryObject.search.length;
    if (!(filterLength === 0 && searchLength === 0)) { // Check for filter or a search
        query += " WHERE ";

        if (filterLength !== 0) { // Check if there is a filter

            query += queryObject.filter[0][0];

            if (queryObject.filter[0][2]==='true') {
                query += " > ";
            }
            else {
                query += " < ";
            }

            query += queryObject.filter[0][1];

            if (searchLength !== 0) { // Check if there is a filter and search
                query += " AND (" + queryObject.search + ")";
            }
        } else { // There is only a search
            query += queryObject.search;
        }
    }

    // Group and sort
    const sortLength = queryObject.sort.length;
    const groupLength = queryObject.group.length;
    if (!(sortLength === 0 && groupLength === 0)) {
        query += " ORDER BY ";

        if (groupLength !== 0) {
            query += queryObject.group;
            if (sortLength !== 0) query += ", " + queryObject.sort;
        } else {
            query += queryObject.sort;
        }
    }

    // Sorting order
    if (queryObject.order) {
        query += " " + queryObject.order;
    }

    query += ";";
    console.log(query);
    return query;
}

function resolveGraphFromAction(queryObject, params) {
    if (!queryObject.filter) queryObject.filter = [];

    let secondAttribute = params.numAttribute.stringValue;
    let object = barDiagramQuery(queryObject, secondAttribute);
    let query = queryParser(object);
    return query;
}

// Returns the query as object and as string wrapped in object.
function resolveQueryFromAction(intent, topQueryObject, secondTopMostQueryObject, parameters) { //
    //handle edge case where filter is not defined because express is shit\
    if (!topQueryObject.filter) topQueryObject.filter = [];
    if (secondTopMostQueryObject && !secondTopMostQueryObject.filter) secondTopMostQueryObject.filter = [];
    var tableOperationType = "normal";
    var object = undefined;

    switch (intent) {
        case "reset":
            object = baseQueryObject;
            break;
        case "column_hide":
            //TODO: Change so that hideColumns are hiding an array of columns
            let hideColumnNames = [];

            let hideColumnArray = parameters.columnName.listValue.values;

            hideColumnArray.forEach(function (value) {
                hideColumnNames.push(value.stringValue);
            });

            object = hideColumnsInTable(topQueryObject, hideColumnNames)
            break;
        case "column_show_all":
            object = showAllColumnsInTable(topQueryObject);
            break;
        case "column_show":
            let showColumnNames = [];

            let showColumnArray = parameters.columnName.listValue.values;

            showColumnArray.forEach(function (value) {
                showColumnNames.push(value.stringValue);
            });

            object = showColumnsInTable(topQueryObject, showColumnNames);
            break;
        case "filter":
            let higherLower = parameters.higherLower.stringValue;
            let attribute = parameters.numAttribute.stringValue;
            let value = parameters.value.numberValue;
            //TODO: Add error handling if attribute is empty, i.e. trying to filter by unknown attribute

            object = filterTable(topQueryObject, attribute, value, higherLower);
            break;
        case "group":
            let columnName = parameters.stringAttribute.stringValue;
            //TODO: Add error handling if column name is empty, i.e. trying to group by unknown attribute

            object = groupTable(topQueryObject, columnName);
            break;
        case "group_ungroup":
            object = ungroupTable(topQueryObject);
            break;
        case "search":
            //TODO: Add error handling if 'searchString' is empty, i.e. trying to search by unknown attribute
            let searchString = parameters.searchString.stringValue;
            object = searchTable(topQueryObject, searchString);

            break;
        case "search_clear":
            object = clearSearch(topQueryObject);
            break;
        case "sort":
            let sortAtrribute = parameters.sortAttribute.stringValue;
            //TODO: Add error handling if 'sortAtrribute' is empty, i.e. trying to sort by unknown attribute
            object = sortTable(topQueryObject, sortAtrribute);
            break;
        case "sort_reverse":
            object = reverseTable(topQueryObject);
            break;
        case "undo":
            object = secondTopMostQueryObject;
            tableOperationType = "undo";
            break;
    }

    return {
        newTopQueryObject: object,
        query: queryParser(object),
        tableOperationType: tableOperationType
    }
}

module.exports = {
    resolveQueryFromAction,
    resolveGraphFromAction
};