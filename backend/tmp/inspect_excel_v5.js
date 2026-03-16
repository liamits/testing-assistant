import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

async function inspectTemplate() {
  const templatePath = path.resolve('../frontend/document/testcasse.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const worksheet = workbook.getWorksheet(1);

  console.log('--- HEADERS (Row 1) ---');
  for (let i = 1; i <= 15; i++) {
    const cell = worksheet.getRow(1).getCell(i);
    console.log(`Col ${String.fromCharCode(64 + i)} (${i}): ${cell.value?.toString().replace(/\n/g, ' ')}`);
  }

  console.log('\n--- DATA (Row 2) ---');
  for (let i = 1; i <= 15; i++) {
    const cell = worksheet.getRow(2).getCell(i);
    console.log(`Col ${String.fromCharCode(64 + i)} (${i}): ${cell.value || '(empty)'}`);
  }

  // Check if there's a dropdown in Column F
  const cellF2 = worksheet.getCell('F2');
  console.log('\n--- CELL F2 VALIDATION ---');
  console.log('Data Validation:', JSON.stringify(cellF2.dataValidation, null, 2));
}

inspectTemplate().catch(console.error);
