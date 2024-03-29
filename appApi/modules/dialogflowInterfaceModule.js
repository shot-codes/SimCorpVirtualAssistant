const najax = require('najax');
const dialogflow = require('dialogflow').v2beta1;
const uuid = require('uuid');

const accessToken = "fe3ac7ce30b340d1b6802eb18de04809";
const baseUrl = "https://api.api.ai/v1/";


var config = {
    projectId: 'firstbot-d1b5b',
    keyFilename: 'appApi/firstbot-d1b5b-e44bae98475c.json',
};
const projectId = 'firstbot-d1b5b';
// A unique identifier for the given session
const sessionId = uuid.v4();
const languageCode = 'en';

// Create a new session
const sessionClient = new dialogflow.SessionsClient(config);
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function postToDialogflow(query) {

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: query,
                languageCode: languageCode,
            },
        },
    };

    // Send request and log result
    const response = (await sessionClient.detectIntent(request))[0];

    let queryResultConfidence = response.queryResult.intentDetectionConfidence

    let primaryQueryResult = response.queryResult;
    let alternativeQueryResult = response.alternativeQueryResults[0];
    const queryResult = (queryResultConfidence > 0.6 || alternativeQueryResult == null || alternativeQueryResult.intent == null) ? primaryQueryResult : alternativeQueryResult;
    let allRequiredParamsPresent = queryResult.allRequiredParamsPresent;

    if (queryResult.intent) {
        console.log(`  Intent: ${queryResult.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
        return {success: false}
    }
    return {
        success: true,
        query: query,
        answer: queryResult.fulfillmentText,
        action: queryResult.action,
        allRequiredParamsPresent : allRequiredParamsPresent,
        parameters: queryResult.allRequiredParamsPresent ? queryResult.parameters.fields : undefined,
        intentName: queryResult.intent.displayName,
        isKnowledgeAnswer: !queryResult.action
    };

}

module.exports.send = postToDialogflow;

