/**
 * ==============================================================================
 * PlookPloen QA System Testing - Google Apps Script Webhook
 * ==============================================================================
 * วิธีใช้งาน:
 * 1. เปิด Google Sheets เปล่าใน Google Drive ของคุณ
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) -> "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมด แล้วคัดลอกโค้ดนี้ไปวางแทน
 * 4. กดปุ่ม "บันทึก" (ไอคอนแผ่นดิสก์)
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) มุมขวาบน -> "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภทเป็น "เว็บแอป" (Web app)
 *    - คำอธิบาย: PlookPloen Test Sync
 *    - ดำเนินการในฐานะ: ตัวฉันเอง (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน (Anyone)  <-- สำคัญมาก! ต้องเลือก Anyone
 * 7. กด "ทำให้ใช้งานได้" (Deploy) และคัดลอก URL ของเว็บแอป (Webhook URL)
 * 8. นำ URL นั้นมาวางในช่อง "Google Sheets Webhook URL" ในหน้า System Testing ของเว็บเรา
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // รอคิวเขียนข้อมูลสูงสุด 10 วินาที เพื่อป้องกันการชนกัน

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // ตรวจสอบว่ามีข้อมูลส่งเข้ามาหรือไม่
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ 
        result: 'error', 
        message: 'No post data received' 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);

    // ถ้าเป็นชีตว่างเปล่า ให้สร้าง Header ให้อัตโนมัติพร้อมแต่งสี
    if (sheet.getLastRow() === 0) {
      var headers = [
        "วัน-เวลา (Timestamp)",
        "รหัสการทดสอบ (Test ID)",
        "โมดูล / Scenario",
        "ขั้นตอนการทดสอบ (Action / Step)",
        "ผลลัพธ์ที่คาดหวัง (Expected Result)",
        "ผลลัพธ์จริง (Actual Result)",
        "สถานะ (Status)",
        "เวลาที่ใช้ (ms)",
        "โหมดทดสอบ (Mode)",
        "ผู้ทดสอบ (Tester)",
        "หมายเหตุ (Notes)"
      ];
      sheet.appendRow(headers);
      
      // ตกแต่ง Header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#059669"); // Botanical Green
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var rowsAdded = 0;

    // รองรับทั้งแบบส่งมาเป็น Array (หลายแถวพร้อมกัน) หรือ Object แถวเดี่ยว
    if (Array.isArray(data)) {
      data.forEach(function(item) {
        appendSingleRow(sheet, item);
        rowsAdded++;
      });
    } else {
      appendSingleRow(sheet, data);
      rowsAdded = 1;
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      result: 'success', 
      rowsAdded: rowsAdded,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ค้นหาแถวที่ว่างแถวแรกจริงๆ โดยเช็คจากคอลัมน์ A (เริ่มจากแถว 2 หลัง Header)
function getFirstTrulyEmptyRow(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 2;
  
  var colA = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (var i = 1; i < colA.length; i++) { // เริ่มที่ index 1 = แถวที่ 2
    var val = colA[i][0];
    if (val === "" || val === null || val === undefined || val.toString().trim() === "") {
      return i + 1; // 1-indexed
    }
  }
  return lastRow + 1;
}

function appendSingleRow(sheet, item) {
  var timestamp = item.timestamp || Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");
  var testId = item.testId || item.id || "-";
  var moduleOrScenario = item.scenario || item.module || "-";
  var step = item.step || item.action || item.name || "-";
  var expected = item.expected || "-";
  var actual = item.actual || "-";
  var status = (item.status || "PASS").toUpperCase();
  var duration = item.duration || 0;
  var mode = item.mode || "Auto";
  var tester = item.tester || "Automated Runner";
  var notes = item.notes || item.detail || "";

  var rowData = [
    timestamp,
    testId,
    moduleOrScenario,
    step,
    expected,
    actual,
    status,
    duration,
    mode,
    tester,
    notes
  ];

  // หาแถวว่างแถวแรกจริงๆ เพื่อป้องกันปัญหาเว้นช่องโหว่เมื่อผู้ใช้กด Delete ล้างเซลล์
  var targetRow = getFirstTrulyEmptyRow(sheet);
  sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

  // ไฮไลต์สีสถานะ PASS (เขียวอ่อน) / FAIL (แดงอ่อน)
  var statusCell = sheet.getRange(targetRow, 7);
  if (status === "PASS") {
    statusCell.setBackground("#d1fae5");
    statusCell.setFontColor("#065f46");
    statusCell.setFontWeight("bold");
  } else if (status === "FAIL") {
    statusCell.setBackground("#fee2e2");
    statusCell.setFontColor("#991b1b");
    statusCell.setFontWeight("bold");
  }
}

// รองรับการทดสอบ Ping ผ่านเบราว์เซอร์ด้วย GET
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'online', 
    service: 'PlookPloen QA Webhook Service',
    time: new Date().toISOString() 
  })).setMimeType(ContentService.MimeType.JSON);
}
