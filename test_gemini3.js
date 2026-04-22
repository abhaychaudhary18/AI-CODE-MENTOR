fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDsA-YeAzypj44FGRHLQk66je8HE6od-ZA', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
}).then(r => r.text()).then(console.log).catch(console.error);
