fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDsA-YeAzypj44FGRHLQk66je8HE6od-ZA', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
}).then(r => r.json()).then(d => { if(d.error) console.error(d.error); else console.log('Successfully generated text with 2.5 flash!'); }).catch(console.error);
