const fs = require('fs');
const path = require('path');

if (!process.env.NVIDIA_API_KEY) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

const apiKey = process.env.NVIDIA_API_KEY;
const endpoint = "https://integrate.api.nvidia.com/v1/chat/completions";

const candidateModels = [
  "nvidia/nemotron-3-ultra-550b-a55b",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "meta/llama-3.1-70b-instruct"
];

async function testModel(modelName) {
  console.log(`Testing model '${modelName}'...`);
  const startTime = Date.now();
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "user", content: "Hello, confirm working." }
        ],
        max_tokens: 128,
        temperature: 0.2
      })
    });

    const elapsed = Date.now() - startTime;
    console.log(`[${modelName}] Status: ${res.status} in ${elapsed}ms`);
    if (res.ok) {
      const data = await res.json();
      console.log(`[${modelName}] Response:`, data.choices?.[0]?.message?.content?.trim());
      return true;
    } else {
      const err = await res.text();
      console.log(`[${modelName}] Error:`, err.slice(0, 150));
    }
  } catch (e) {
    console.error(`[${modelName}] Exception:`, e.message);
  }
  return false;
}

async function runAll() {
  for (const model of candidateModels) {
    const success = await testModel(model);
    if (success) {
      console.log(`>>> RECOMMENDED WORKING MODEL: ${model}`);
      break;
    }
  }
}

runAll();
