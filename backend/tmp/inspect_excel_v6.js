import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

async function inspectTemplate() {
  const templatePath = path.resolve('../frontend/document/testcasse.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const worksheet = workbook.getWorksheet(1);
  
  let output = `Sheet Name: ${worksheet.name}\n`;
  output += `Row Count: ${worksheet.rowCount}\n\n`;

  output += '--- HEADERS (Row 1) ---\n';
  for (let i = 1; i <= 15; i++) {
    const cell = worksheet.getRow(1).getCell(i);
    output += `Col ${String.fromCharCode(64 + i)} (${i}): ${cell.value?.toString().replace(/\n/g, ' ')}\n`;
  }

  output += '\n--- DATA (Row 2) ---\n';
  for (let i = 1; i <= 15; i++) {
    const cell = worksheet.getRow(2).getCell(i);
    output += `Col ${String.fromCharCode(64 + i)} (${i}): ${cell.value || '(empty)'}\n`;
  }

  output += '\n--- DATA (Row 3) ---\n';
  for (let i = 1; i <= 15; i++) {
    const cell = worksheet.getRow(3).getCell(i);
    output += `Col ${String.fromCharCode(64 + i)} (${i}): ${cell.value || '(empty)'}\n`;
  }

  fs.writeFileSync('tmp/inspect_result.txt', output);
}

inspectTemplate().catch(console.error);
