import { spawn } from 'node:child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  'http://localhost:5173/'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const listRes = await fetch('http://localhost:9222/json/list');
  const tabs = await listRes.json();
  const targetTab = tabs.find(t => t.url.includes('localhost:5173'));
  
  if (targetTab) {
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    
    await new Promise(resolve => {
      ws.onopen = () => {
        const msg = {
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (async () => {
                let loadResult;
                try {
                  loadResult = await document.fonts.load('16px "Google Sans Flex"');
                } catch(e) {
                  loadResult = e.message;
                }
                const checkAfter = document.fonts.check('16px "Google Sans Flex"');
                const checkWithWeight = document.fonts.check('400 16px "Google Sans Flex"');
                const checkBold = document.fonts.check('700 16px "Google Sans Flex"');
                return {
                  loadResultLength: loadResult ? loadResult.length : 0,
                  loadResultList: Array.isArray(loadResult) ? loadResult.map(f => ({ family: f.family, status: f.status, weight: f.weight })) : loadResult,
                  checkAfter,
                  checkWithWeight,
                  checkBold
                };
              })()
            `,
            awaitPromise: true,
            returnByValue: true
          }
        };
        ws.send(JSON.stringify(msg));
      };
      
      ws.onmessage = (event) => {
        const res = JSON.parse(event.data);
        console.log('Result from load test:', JSON.stringify(res, null, 2));
        resolve();
      };
    });
    
    ws.close();
  }
} catch (err) {
  console.error('Error:', err);
} finally {
  proc.kill();
}
