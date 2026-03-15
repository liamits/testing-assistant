import ExcelJS from 'exceljs';
import path from 'path';

async function inspect() {
  const workbook = new ExcelJS.Workbook();
  const filePath = "d:\\Project\\testing-assistant\\frontend\\document\\Testcases.xlsx";
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.getWorksheet(1);
  console.log(`Sheet: ${worksheet.name}`);
  
  const row1 = worksheet.getRow(1);
  console.log('--- Row 1 ---');
  row1.eachCell((cell, colNumber) => {
    console.log(`Col ${colNumber}: ${JSON.stringify(cell.value)}`);
  });

  const row2 = worksheet.getRow(2);
  console.log('--- Row 2 ---');
  row2.eachCell((cell, colNumber) => {
    console.log(`Col ${colNumber}: ${JSON.stringify(cell.value)}`);
  });
}

inspect().catch(console.error);
