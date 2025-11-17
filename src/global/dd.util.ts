import { DdException } from '@/common/exceptions/dd.exception';

export function dd(...items: any[]): never {
  const formatted = items.map((item, i) => {
    return `<h2>Dump #${i + 1}</h2>
    <pre>${escapeHtml(JSON.stringify(item, null, 2))}</pre>`;
  }).join("<hr>");

  const html = `
    <html>
      <head>
        <title>dd() Debug Dump</title>
        <style>
          body {
            background: #1e1e1e;
            color: #eee;
            font-family: Consolas, monospace;
            padding: 20px;
          }
          pre {
            background: #2d2d2d;
            padding: 20px;
            border-radius: 6px;
            white-space: pre-wrap;
            overflow: auto;
          }
          hr {
            border: 0;
            border-top: 1px solid #444;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <h1>dd()</h1>
        ${formatted}
      </body>
    </html>
  `;

  throw new DdException(html);
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Attach to global
(globalThis as any).dd = dd;