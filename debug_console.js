const { spawn } = require('child_process');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9227;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await sleep(1500);

  const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  function send(method, params = {}) {
    return new Promise(res => {
      const msgId = id++;
      const onMsg = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === msgId) {
          ws.removeEventListener('message', onMsg);
          res(d.result);
        }
      };
      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.addEventListener('message', (msg) => {
    const data = JSON.parse(msg.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.log('EXCEPTION:', JSON.stringify(data.params.exceptionDetails));
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Navigating to http://localhost:8080/src/game/dist/index.html?destination=earth');
  await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html?destination=earth' });
  await sleep(2500);

  const evalRes = await send('Runtime.evaluate', {
    expression: `({
      hasSetGameDestination: typeof window.setGameDestination,
      planetName: document.getElementById('planet-name')?.textContent,
      search: window.location.search
    })`,
    returnByValue: true
  });
  console.log('Evaluation result:', evalRes.result.value);

  ws.close();
  chrome.kill();
}

run();
