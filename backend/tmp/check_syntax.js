import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
  const content = readFileSync(resolve('src/modules/testcases/testcase.controller.js'), 'utf8');
  new Function(content);
  console.log("Syntax check passed!");
} catch (e) {
  console.error("Syntax Error detected:", e);
}
