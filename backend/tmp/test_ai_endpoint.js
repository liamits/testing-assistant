import axios from 'axios';

const testCaseId = '69b66674e872c7ba1b638502'; // From subagent's log
const url = `http://localhost:5000/api/testcases/${testCaseId}/generate-ai`;

async function test() {
  console.log(`Testing AI generation for: ${url}`);
  try {
    const res = await axios.post(url, {}, {
        headers: { 'Authorization': 'Bearer DUMMY_TOKEN' } // authMiddleware is on
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error Status:", err.response?.status);
    console.log("Error Data:", JSON.stringify(err.response?.data, null, 2));
  }
}

test();
