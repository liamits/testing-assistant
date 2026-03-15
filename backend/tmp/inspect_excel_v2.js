import ExcelJS from 'exceljs';
import path from 'path';

async function inspect() {
  const workbook = new ExcelJS.Workbook();
  const filePath = "d:\\Project\\testing-assistant\\frontend\\document\\Testcases.xlsx";
  await workbook.xlsx.readFile(filePath);
  
  workbook.eachSheet((worksheet, sheetId) => {
    console.log(`Sheet: ${worksheet.name}`);
    const row = worksheet.getRow(1);
    const headers = [];
    row.eachCell((cell, colNumber) => {
      headers.push(cell.value);
    });
    console.log(`Headers: ${headers.join(' | ')}`);
    
    const row2 = worksheet.getRow(2);
    const example = [];
    row2.eachCell((cell, colNumber) => {
      example.push(cell.value);
    });
    console.log(`Row 2: ${example.join(' | ')}`);
  });
}

inspect().catch(console.error);
