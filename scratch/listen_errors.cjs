const { spawn } = require('child_process');

const PORT = 9230;
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
    ws.send(JSON.stringify({ id: 1, method: 'Log.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.navigate', params: { url: 'http://localhost:8080/src/game/dist/index.html?destination=moon' } }));
  };

  const logs = [];
  ws.onmessage = async (msg) => {
    const data = JSON.parse(msg.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      logs.push(data.params.type + ': ' + data.params.args.map(a => a.value || a.description).join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      logs.push('EXCEPTION: ' + JSON.stringify(data.params.exceptionDetails));
    }
    if (data.id === 3) {
      await new Promise(r => setTimeout(r, 2000));
      ws.send(JSON.stringify({ id: 4, method: 'Runtime.evaluate', params: { expression: "document.getElementById('design-button')?.click();" } }));
    }
    if (data.id === 4) {
      await new Promise(r => setTimeout(r, 2500));
      console.log('--- CONSOLE LOGS & EXCEPTIONS ---');
      console.log(logs.join('\n'));
      chromeProcess.kill();
      process.exit(0);
    }
  };
}
run();
