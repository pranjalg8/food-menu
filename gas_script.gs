function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName('Database');

    var incoming = JSON.parse(e.postData.contents);
    var rowData = [
       incoming.name || '',
       incoming.category || '',
       incoming.type || '',
       incoming.image || '',
       incoming.recipe || '',
       incoming.ingredients || ''
    ];

    sheet.appendRow(rowData);

    return ContentService.createTextOutput(JSON.stringify({'result': 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  catch (e) {
    return ContentService.createTextOutput(JSON.stringify({'result': 'error', 'error': e}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  finally {
    lock.releaseLock();
  }
}
