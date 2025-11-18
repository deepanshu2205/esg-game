// Simple script to test parsing logic used by /api/ai simulate
const samples = [
  '{"carbon_delta": -10, "profit_delta": -200, "reputation_delta": 3, "explanation": "Upgrades reduce carbon."}',
  'JSON: {"carbon_delta": -5, "profit_delta": -100, "reputation_delta": 1, "explanation": "Partial improvement."}',
  '```json\n{"carbon_delta": -7, "profit_delta": -150, "reputation_delta": 2, "explanation": "Wrapped in code block."}\n```',
  'Some text\n{\n  "carbon_delta": -12,\n  "profit_delta": -300,\n  "reputation_delta": 4,\n  "explanation": "Multi-line and noisy."\n}\nThanks',
  'No json here, sorry.'
];

function tryParse(text) {
  text = (text || "").trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const sub = text.slice(start, end + 1);
      try {
        return JSON.parse(sub);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

for (const s of samples) {
  console.log('---');
  console.log('Input:', s);
  const parsed = tryParse(s);
  console.log('Parsed:', parsed);
}

console.log('\nTest complete');
