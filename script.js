const currentYear = new Date().getFullYear().toString();
const columns = ["Name", "Score", "Time"];

function selectOrCreateSheet(sheetName, url = null) {
    let app;
    if (url) {
        app = SpreadsheetApp.openByUrl(url);
    } else {
        app = SpreadsheetApp.getActiveSpreadsheet();
    }
    let sheet = app.getSheetByName(sheetName);
    if (!sheet) {
        sheet = app.insertSheet(sheetName);
        sheet.appendRow(columns);
    } else if (sheet.getLastColumn() < 1) {
        sheet.appendRow(columns);
    }
    return sheet;
}

function getColumn(sheetName, column, url = null) {
    let sheet = selectOrCreateSheet(sheetName, url);
    const lastColumn = sheet.getLastColumn();
    if (lastColumn < 1) {
        throw new Error(`Sheet "${sheetName}" is empty or has no columns`);
    }
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    const lowerHeaders = headers.map(header => header.toString().toLowerCase());
    const lowerColumn = column.toLowerCase();
    const columnIndex = lowerHeaders.indexOf(lowerColumn);

    if (sheet.getLastRow() <= 1) {
        return [];
    }
    const columnValues = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1).getValues();
    const flattenedValues = columnValues.map(row => row[0]);
    return flattenedValues;
}

function getMembershipData() {
    const jsonData = {};
    columns.forEach(column => {
        jsonData[column] = getColumn(currentYear, column);
    });

    const dataLength = jsonData[columns[0]].length;
    if (dataLength === 0) {
        return [];
    }

    const result = [];
    for (let i = 0; i < dataLength; i++) {
        let rowData = {};
        columns.forEach(column => {
            rowData[column] = jsonData[column][i];
        });
        result.push(rowData);
    }

    return result;
}


function appendJsonToSheet(sheetName, jsonData) {
    let sheet = selectOrCreateSheet(sheetName);
    const headers = Object.keys(jsonData[0]);

    jsonData.forEach(rowData => {
        const row = headers.map(header => rowData[header]);
        sheet.appendRow(row);
    });
}

function main() {
    const membershipData = getMembershipData();
    Logger.log(JSON.stringify(membershipData, null, 2));
    appendJsonToSheet(currentYear, membershipData);
}

function getScoresSorted() {
    const membershipData = getMembershipData();
    return membershipData.sort((a, b) => b.Score - a.Score);
}

function appendRow(name, score, time) {
    const sheet = selectOrCreateSheet(currentYear);
    sheet.appendRow([name, score, time]);
}

function doGet() {
    const scores = getScoresSorted();
    return ContentService.createTextOutput(JSON.stringify(scores)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    appendRow(data.Name, data.Score, data.Time);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
}