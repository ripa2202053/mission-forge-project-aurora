const { spawn } = require('child_process');

const PORT = 9231;
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
      await new Promise(r => setTimeout(r, 2000));
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const canvas = document.querySelector('.hangar-canvas canvas');
            const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
            const pixels = new Uint8Array(4);
            if (gl) {
              gl.readPixels(canvas.width / 2, canvas.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            }
            return {
              centerPixelRGBA: Array.from(pixels),
              canvasW: canvas?.width,
              canvasH: canvas?.height,
              previewCanvasW: document.querySelector('.part-previews canvas')?.width,
              previewCanvasH: document.querySelector('.part-previews canvas')?.height
            };
          })()`,
          returnByValue: true
        }
      }));
    }
    if (data.id === 3) {
      console.log('Result:', data.result?.result?.value);
      chromeProcess.kill();
      process.exit(0);
    }
  };
}
run();
