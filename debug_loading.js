const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9250;

const chrome = spawn(CHROME_PATH, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1920,1080'
]);

setTimeout(async () => {
  try {
    const tabs = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${PORT}/json/list`, r => {
        let body = '';
        r.on('data', c => body += c);
        r.on('end', () => res(JSON.parse(body)));
      }).on('error', rej);
    });

    const tab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension')) || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    ws.onopen = async () => {
      let id = 1;
      const send = (method, params = {}) => new Promise((resolve, reject) => {
        const curId = id++;
        const handler = e => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });

      await send('Page.enable');
      await send('Runtime.enable');

      ws.addEventListener('message', e => {
        const msg = JSON.parse(e.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.log('[EXCEPTION]', msg.params.exceptionDetails);
        }
      });

      console.log('Navigating to http://localhost:8080/src/game/dist/index.html?destination=mars...');
      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html?destination=mars' });
      await new Promise(r => setTimeout(r, 6000));

      const loadingState = await send('Runtime.evaluate', {
        expression: `(() => {
          const loading = document.getElementById('loading');
          return {
            hidden: loading ? loading.hidden : null,
            classList: loading ? Array.from(loading.classList) : [],
            display: loading ? getComputedStyle(loading).display : null,
            opacity: loading ? getComputedStyle(loading).opacity : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Loading state after 6s:', loadingState.result.value);

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1000);
