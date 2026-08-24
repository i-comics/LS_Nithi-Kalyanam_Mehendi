/**
 * i__comics Digital Wedding Photobooth — Google Apps Script backend
 * Deploy: Extensions > Apps Script > paste this file > Deploy > New deployment
 *         > Type: Web app > Execute as: Me > Who has access: Anyone
 * Copy the deployed /exec URL into DRIVE_UPLOAD_ENDPOINT in src/App.jsx
 */

var FOLDER_ID = '1f2JbKJivjlm01d89xu8A6DIrlOPIpJa3'; // target Drive folder ID

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var base64 = data.image.replace(/^data:image\/\w+;base64,/, '');
    var bytes = Utilities.base64Decode(base64);

    var couple = (data.coupleNames || 'Wedding').replace(/[^a-zA-Z0-9]/g, '_');
    var event = (data.eventName || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
    var stamp = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd_HHmmss');
    var fileName = couple + '_' + event + '_' + stamp + '.png';

    var blob = Utilities.newBlob(bytes, 'image/png', fileName);
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      fileId: file.getId(),
      fileUrl: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'i__comics Photobooth upload endpoint is live.'
  })).setMimeType(ContentService.MimeType.JSON);
}
