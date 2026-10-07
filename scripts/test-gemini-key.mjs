import fs from 'fs';

// read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) env[match[1]] = match[2];
}

const apiKey = env['GEMINI_API_KEY'];
console.log("Using API Key starting with:", apiKey ? apiKey.substring(0, 5) : "undefined");

const requestBody = {
  contents: [{role: "user", parts: [{text: "Hello"}]}],
};

async function testGemini() {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log("Status:", response.status);
  console.log("Response Text:", await response.text());
}

testGemini().catch(console.error);
