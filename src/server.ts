import http from 'node:http';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { PosView } from './components/Header';

export const PORT = Number(process.env.PORT) || 3000;

export function generateHtml(initialPath: string = '/'): string {
  let initialView: PosView = 'terminal';
  if (initialPath.includes('/orders')) initialView = 'orders';
  if (initialPath.includes('/inventory')) initialView = 'inventory';
  if (initialPath.includes('/shifts')) initialView = 'shifts';
  if (initialPath.includes('/customers')) initialView = 'customers';
  if (initialPath.includes('/analytics')) initialView = 'analytics';

  const renderedApp = renderToString(React.createElement(App, { initialView }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NovaPOS - Enterprise Point-of-Sale Cloud</title>
  <meta name="description" content="Next-generation cloud point-of-sale, inventory intelligence, and cashier management terminal.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #0a0e17; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
  </style>
</head>
<body>
  <div id="root">${renderedApp}</div>
  <script>
    // Progressive enhancement & client interactivity
    (function() {
      document.querySelectorAll('[data-testid^="nav-"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var target = btn.getAttribute('data-testid');
          if (target === 'nav-terminal') window.location.href = '/';
          if (target === 'nav-orders') window.location.href = '/orders';
          if (target === 'nav-inventory') window.location.href = '/inventory';
          if (target === 'nav-shifts') window.location.href = '/shifts';
          if (target === 'nav-customers') window.location.href = '/customers';
          if (target === 'nav-analytics') window.location.href = '/analytics';
        });
      });

      var logo = document.querySelector('[data-testid="brand-logo"]');
      if (logo) {
        logo.addEventListener('click', function() { window.location.href = '/'; });
      }
    })();
  </script>
</body>
</html>`;
}

export function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  const url = req.url || '/';

  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'pos-test-cicd-frontend' }));
    return;
  }

  const html = generateHtml(url);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  res.end(html);
}

export function startServer(port: number = PORT): http.Server {
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`NovaPOS Server running at http://localhost:${port}`);
  });
  return server;
}
