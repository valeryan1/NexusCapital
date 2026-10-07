import fs from 'fs';

// read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) env[match[1]] = match[2];
}

const apiKey = env['GEMINI_API_KEY'];

async function listModels() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  const data = await response.json();
  if (data.models) {
    console.log("Available models:");
    console.log(data.models.map(m => m.name).join(', '));
  } else {
    console.log("Error:", data);
  }
}

listModels().catch(console.error);
