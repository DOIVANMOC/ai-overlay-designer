async function test() {
  const res = await fetch('http://localhost:3000/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'local' })
  });
  const data = await res.json();
  console.log("PUT /api/settings response:", JSON.stringify(data, null, 2));

  // Test /api/analyze on sample
  const analyzeRes = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: '/samples/sample_mecha_chatbox.png'
    })
  });
  const analyzeData = await analyzeRes.json();
  console.log("POST /api/analyze response:", JSON.stringify(analyzeData, null, 2));

  // Test /api/process on sample
  const processRes = await fetch('http://localhost:3000/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: '/samples/sample_mecha_chatbox.png',
      title: 'Mecha Gold Test Overlay',
      options: {
        glowIntensity: 40,
        glowColor: '#ffd700',
        shadowIntensity: 40,
        neonBoost: 15,
        metallicBoost: 20,
        edgeFeather: 2,
        resolution: 'original'
      }
    })
  });
  const processData = await processRes.json();
  console.log("POST /api/process response:", JSON.stringify(processData, null, 2));
}

test().catch(console.error);

