
var keycode = $.ui.keyCode = {
    BACKSPACE: 8,
    COMMA: 188,
    DELETE: 46,
    DOWN: 9, // Swapped DOWN from 40 to 9 (TAB) TO REPLACE BEHAVIOUR
    END: 35,
    ENTER: 13,
    ESCAPE: 27,
    HOME: 36,
    LEFT: 37,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PERIOD: 190,
    RIGHT: 39,
    SPACE: 32,
    TAB: 9,
    UP: 38
};

$( function() {

    // --------------------------------------------- autocomplete logic --------------------------------------------- //
    var availableTags;
    var star = ["*"];
    var columnTags = ["Symbol", "Type", "Price", "QC", "Total_QTY", "Total_Price", "Maturity_Date", "Dirty_Value_QC", "Dirty_Value_PC", "Dirty_Value_RC"];
    var numTags = ["Price", "QC", "Total_QTY", "Total_Price", "Dirty_Value_QC", "Dirty_Value_PC", "Dirty_Value_RC"];
    var sqlKeywords = ["SELECT", "FROM", "WHERE", "ORDER BY"];
    var modes = ["help", "tableQuery", "graphQuery"];

    function split( val ) {
        return val.split( / \s*/ );
    }

    function extractLast( term ) {
        return split( term ).pop();
    }

    function getFirstWord (str) {
        return str.split(" ")[0]
    }

    // this auxiliary function detects which part of the query (table or graph) the user is currently at. The detection
    // is based on the SQL keywords ["SELECT", "FROM", "WHERE", "ORDER BY"] and the available tags can be updated
    // accordingly.
    function detectQueryPart(inputString) {
        let part = 0;

        if (inputString.indexOf(sqlKeywords[0]) !== -1) {
            part = 1;
        }

        if (inputString.indexOf(sqlKeywords[1]) !== -1) {
            part = 2;
        }

        if (inputString.indexOf(sqlKeywords[2]) !== -1) {
            part = 3;
        }

        if (inputString.indexOf(sqlKeywords[3]) !== -1) {
            part = 4;
        }

        return part;
    }

    // this function updates the available autocomplete tags depending on the the value of the input field
    // it detects what type of command the superuser wants to execute and calls a corresponding auxiliary function
    // if the type cannot be detected, it returns the three possible modes ["help", "tableQuery", "graphQuery"]
    function updateTags(inputString) {
        let firstWord = getFirstWord(inputString);
        if (firstWord === modes[0]) {return updateTagsHelp(inputString);}
        else if (firstWord === modes[1]) {return updateTagsTQ(inputString);}
        else if (firstWord === modes[2]) {return updateTagsGQ(inputString);}
        else {return modes;}
    }

    // this auxiliary function creates a substring of the current query part. If the value of the input field is
    // "tableQuery SELECT Symbol, Price FROM DB_Data WHERE Price > 1000" this function will return "WHERE Price > 1000"
    // This substring will be used to evaluate which tags to provide.
    function createSubstring(inputString, queryPart) {
        var substring;

        switch (queryPart) {
            case 0:     break;
            case 1:     substring = inputString.substr(inputString.indexOf(sqlKeywords[0]), inputString.length);
                break;
            case 2:     substring = inputString.substr(inputString.indexOf(sqlKeywords[1]), inputString.length);
                break;
            case 3:     substring = inputString.substr(inputString.indexOf(sqlKeywords[2]), inputString.length);
                break;
            case 4:     substring = inputString.substr(inputString.indexOf(sqlKeywords[3]), inputString.length);
                break;
        }

        return substring;
    }

    // This boolean function checks if the user has already specified any column names in the current query part
    function columnsChosen(inputString, queryPart) {
        var substring =createSubstring(inputString, queryPart);
        var out = false;

        columnTags.forEach(function (tag) {
            if (substring.indexOf(tag) !== -1) {
                out = true;
            }
        });

        return out;
    }

    // This boolean function checks if the user chose all columns (*)
    function allChosen(inputString, queryPart) {
        var substring =createSubstring(inputString, queryPart);
        return substring.indexOf(star[0]) !== -1;
    }

    // This function filters all column tags that are already present in the current query part so that they do not
    // appear in the autocomplete tags
    function filterColumnTags(inputString, queryPart) {
        var substring = createSubstring(inputString, queryPart);
        var out = [];

        columnTags.forEach(function(tag){
            if (substring.indexOf(tag) === -1) {
                out.push(tag);
            }
        });

        return out;
    }

    // potential refined help could be provided by adding help tags to specify the question or problem, f.x. document
    // search etc.
    function updateTagsHelp(inputString) {
        return ["me please"];
    }

    // this function handles the autocomplete tags for table queries
    function updateTagsTQ(inputString) {
        var queryPart = detectQueryPart(inputString);
        switch (queryPart) {
            case 0:     return [sqlKeywords[0]];
            case 1:     if (allChosen(inputString, queryPart)) {
                            return ["FROM DB_Data"];
                        }
                        else if (!columnsChosen(inputString, queryPart)) {
                            return star.concat(columnTags);
                        } else {
                            return ["FROM DB_Data"].concat(filterColumnTags(inputString, queryPart));
                        }
            case 2:     return [sqlKeywords[2], sqlKeywords[3]];
            case 3:     return columnTags;
            case 4:     return columnTags;
        }
    }

    function updateTagsGQ(inputString) {
        var queryPart = detectQueryPart(inputString);
        switch (queryPart) {
            case 0:     return ["SELECT Symbol,"];
            case 1:     return numTags;
            case 2:     return columnTags;
            case 3:     return columnTags;
            case 4:     return columnTags;
        }
    }

    // -------------------------------------------- autocomplete jquery --------------------------------------------- //

    $( "#superuserInput" )
    // don't navigate away from the field on tab when selecting an item
        .on( "keydown", function( event ) {

            const input = $("#superuserInput");
            const output = $("#superuserResults");

            availableTags = updateTags(input.val());

            // Handles whether enter selects suggestion or submits
            if (event.keyCode === $.ui.keyCode.ENTER &&
                (!$('.ui-menu').is(':visible') || !$(this).autocomplete("instance").menu.active)
                && input.val() !== "") {

                const command = input.val();

                output.append("\n" + command + ":");

                $.ajax({
                    url: "http://localhost:8080/api/superuser/"+command
                })
                    .done(function( data ) {
                        output.append("\n");
                        output.append(data.toString());
                        const objDiv = document.getElementById("superuserResults");
                        objDiv.scrollTop = objDiv.scrollHeight;
                    });
                input.val("");
            }

            // Prevent tab default behaviour when focused on input field
            if ( event.keyCode === $.ui.keyCode.TAB) {
                event.preventDefault();
            }
        })

        // taken from jquery api documentation
        .autocomplete({
            //autofocus: true,
            minLength: 0,
            source: function( request, response ) {
                // delegate back to autocomplete, but extract the last term
                response( $.ui.autocomplete.filter(
                    availableTags, extractLast( request.term ) ) );
            },
            position: { my: "left bottom", at: "left top", collision: "flip" },
            focus: function() {
                // prevent value inserted on focus
                return false;
            },
            select: function( event, ui ) {
                var terms = split( this.value );
                // remove the current input
                terms.pop();
                // add the selected item
                terms.push( ui.item.value );
                // add placeholder to get the comma-and-space at the end
                terms.push( "" );
                this.value = terms.join( " " );
                return false;
            }
        });
} );

//TODO fetch column tags from db - same as in main.js
//TODO auto select first element in autocompletion menu (eliminates double TAB clicks)
//TODO error handler for incorrect queries (TO BE IMPLEMENTED FOR QUERIES MADE THROUGH CLIENT.HTML AS WELL)
//     - relevant if the user decides to manually send a query through the text field
//TODO automatically insert "SELECT SYMBOL," when the user wants to make a graph query without showing it in the menu
//TODO add commas after column tags without showing them in the menu
//TODO make case insensitive?
//TODO look into categorising the dropdown menu where applicable: http://jqueryui.com/autocomplete/#categories
