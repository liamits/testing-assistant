import ExcelJS from 'exceljs';
import path from 'path';

async function inspect() {
  const workbook = new ExcelJS.Workbook();
  const filePath = "d:\\Project\\testing-assistant\\frontend\\document\\Testcases.xlsx";
  await workbook.xlsx.readFile(filePath);
  
  workbook.eachSheet((worksheet, sheetId) => {
    console.log(`Sheet: ${worksheet.name}`);
    const row = worksheet.getRow(1);
    console.log(`Headers: ${row.values.join(' | ')}`);
  });
}

inspect().catch(console.error);
