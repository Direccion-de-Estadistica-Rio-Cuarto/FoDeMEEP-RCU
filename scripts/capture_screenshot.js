import { spawn } from 'node:child_process';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=390,844',
  '--disable-gpu',
  'http://localhost:5173/'
]);

await new Promise(r => setTimeout(r, 2500));

try {
  const listRes = await fetch('http://localhost:9222/json/list');
  const tabs = await listRes.json();
  const targetTab = tabs.find(t => t.url.includes('localhost:5173'));
  
  if (targetTab) {
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    
    await new Promise(resolve => {
      ws.onopen = () => {
        // Send screenshot command
        ws.send(JSON.stringify({
          id: 1,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      };
      
      ws.onmessage = (event) => {
        const res = JSON.parse(event.data);
        if (res.result && res.result.data) {
          const buf = Buffer.from(res.result.data, 'base64');
          fs.writeFileSync('c:/Users/munno/.gemini/antigravity/brain/abe5d377-cc32-4669-bff3-ea447076afd5/screenshot_iphone_render.png', buf);
          console.log('Saved screenshot! Bytes:', buf.length);
        }
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
