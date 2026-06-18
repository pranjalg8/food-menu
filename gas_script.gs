/**
 * Unified Backend for Indian Food Menu & Mess Manager
 * Handles:
 * 1. doPost: Adding new dishes from add.html
 * 2. doGet: Rotation, Swaps, and Menu Logging for mess-manager.html (via JSONP)
 */

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
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({'result': 'error', 'error': e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  let result = { ok: false };

  try {
    if (action === 'state') result = handleState(e.parameter.week, e.parameter.start);
    else if (action === 'swap') result = handleSwap(e.parameter.week, e.parameter.manager, e.parameter.origM, e.parameter.note, e.parameter.days, e.parameter.start);
    else if (action === 'log') result = handleLog(e.parameter);
    
    result.ok = true;
  } catch (err) {
    result.error = err.toString();
  }

  const output = callback ? `${callback}(${JSON.stringify(result)})` : JSON.stringify(result);
  return ContentService.createTextOutput(output).setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

const ROSTER = ["Rajneesh", "Pranjal", "Amit", "Anubhav"];

function handleState(wk, start) {
  const sheet = getOrCreateSheet('MessRotation');
  const data = sheet.getDataRange().getValues();
  let weekEntries = data.filter(r => r[0] === wk);
  
  const counts = {};
  ROSTER.forEach(p => counts[p] = 0);

  for (let i = 1; i < data.length; i++) {
    let person = data[i][1];
    let days = parseFloat(data[i][5]);
    if (isNaN(days)) days = 7;
    if (ROSTER.includes(person)) counts[person] += days;
  }

  let manager;
  if (weekEntries.length > 0) {
    manager = weekEntries[weekEntries.length - 1][1];
  } else {
    // Pick person with lowest count (days), tie-break by ROSTER order
    manager = ROSTER.map(p => ({name: p, count: counts[p]}))
                   .sort((a,b) => a.count - b.count)[0].name;
    sheet.appendRow([wk, manager, 'Auto', start, new Date(), 7]);
    counts[manager] += 7;
  }

  return { manager, counts, roster: ROSTER, recent: getRecentDishes() };
}

function handleSwap(wk, newM, origM, note, days, start) {
  const sheet = getOrCreateSheet('MessRotation');
  const data = sheet.getDataRange().getValues();
  
  let d = parseFloat(days);
  if (isNaN(d) || d < 1) d = 7;

  // Find the original assignment
  let origRowIdx = data.findIndex(r => r[0] === wk && r[1] === origM);
  
  if (origRowIdx > -1) {
    let origDays = parseFloat(data[origRowIdx][5]);
    if (isNaN(origDays)) origDays = 7;
    let newOrigDays = Math.max(0, origDays - d);
    sheet.getRange(origRowIdx + 1, 6).setValue(newOrigDays);
    sheet.appendRow([wk, newM, 'Cover: ' + note, start, new Date(), d]);
  } else {
    sheet.appendRow([wk, newM, 'Swap: ' + note, start, new Date(), d]);
  }
  
  // Recalculate counts
  const newData = sheet.getDataRange().getValues();
  const counts = {};
  ROSTER.forEach(p => counts[p] = 0);
  for (let i = 1; i < newData.length; i++) {
    let person = newData[i][1];
    let ds = parseFloat(newData[i][5]);
    if (isNaN(ds)) ds = 7;
    if (ROSTER.includes(person)) counts[person] += ds;
  }
  
  return { manager: newM, counts, roster: ROSTER };
}

function handleLog(p) {
  const sheet = getOrCreateSheet('MessLog');
  sheet.appendRow([
    p.date, p.manager, p.bf, p.lunch, p.dinner, p.side, p.fruit,
    p.b_qty, p.l_qty, p.d_qty, new Date()
  ]);
  return { success: true };
}

function getRecentDishes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MessLog');
  if (!sheet) return [];
  const rows = sheet.getLastRow();
  if (rows < 2) return [];
  const start = Math.max(2, rows - 20); // Last 20 logs
  const data = sheet.getRange(start, 3, (rows - start) + 1, 5).getValues();
  const flat = data.flat().filter(d => d && d !== '—');
  return [...new Set(flat)].slice(-15); // Return unique last 15 items
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'MessRotation') sheet.appendRow(['Week', 'Manager', 'Type', 'StartDate', 'Timestamp']);
    if (name === 'MessLog') sheet.appendRow(['Date', 'Manager', 'Breakfast', 'Lunch', 'Dinner', 'Side', 'Fruit', 'B_Qty', 'L_Qty', 'D_Qty', 'Timestamp']);
  }
  return sheet;
}
