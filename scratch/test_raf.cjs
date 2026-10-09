const { spawn } = require('child_process');

const PORT = 9234;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--no-sandbox',
    '--window-size=1600,900',
    '--hide-scrollbars',
    '--mute-audio',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:' + PORT + '/json');
  const targets = await res.json();
  const target = targets.find(t => t.type === 'page') || targets[0];

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'http://localhost:8080/src/game/dist/index.html?destination=moon' } }));
  };

  ws.onmessage = async (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id === 1) {
      await new Promise(r => setTimeout(r, 2000));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.evaluate', params: { expression: "document.getElementById('design-button')?.click();" } }));
    }
    if (data.id === 2) {
      await new Promise(r => setTimeout(r, 1000));
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: {
          expression: `new Promise((resolve) => {
            let frames = 0;
            function count() {
              frames++;
              if (frames >= 5) resolve(frames);
              else requestAnimationFrame(count);
            }
            requestAnimationFrame(count);
            setTimeout(() => resolve('TIMEOUT: frames=' + frames), 1500);
          })`,
          returnByValue: true,
          awaitPromise: true
        }
      }));
    }
    if (data.id === 3) {
      console.log('Frame count result:', data.result?.result?.value);
      chromeProcess.kill();
      process.exit(0);
    }
  };
}
run();
