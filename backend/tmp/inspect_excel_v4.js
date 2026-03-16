import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

async function inspectTemplate() {
  const templatePath = path.resolve('../frontend/document/testcasse.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const worksheet = workbook.getWorksheet(1);

  console.log('Sheet Name:', worksheet.name);
  console.log('Row Count:', worksheet.rowCount);

  // Read header row (usually row 1)
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell, colNumber) => {
    headers.push({ col: colNumber, key: cell.address.replace(/[0-9]/g, ''), val: cell.value });
  });
  console.log('Headers (Row 1):', JSON.stringify(headers, null, 2));

  // Read second row to see if it's dummy data
  const row2 = worksheet.getRow(2);
  const row2Data = [];
  row2.eachCell((cell, colNumber) => {
      row2Data.push({ col: colNumber, val: cell.value });
  });
  console.log('Row 2 Data:', JSON.stringify(row2Data, null, 2));
}

inspectTemplate().catch(console.error);
