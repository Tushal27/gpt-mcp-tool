/* A dependency-free static file server.
 *
 * Replaces `python3 -m http.server`, which is not a thing you can rely on
 * across Windows / macOS / Linux. Node is already required to run the tests,
 * so this keeps the toolchain to one runtime.
 *
 * CLI:  node test/static-server.mjs [port] [rootDir]
 * API:  const srv = await startServer({ port, root }); srv.close();
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.sql':  'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon'
};

export function startServer({ port = 8137, root = process.cwd() } = {}) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      // Strip the leading slash, then normalise, so "../" cannot escape root.
      const rel = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, '');
      if (rel.split(sep).includes('..')) { res.writeHead(403).end('Forbidden'); return; }

      let file = join(root, rel || 'index.html');
      let info = await stat(file).catch(() => null);
      if (info?.isDirectory()) { file = join(file, 'index.html'); info = await stat(file).catch(() => null); }
      if (!info?.isFile()) { res.writeHead(404).end('Not found'); return; }

      res.writeHead(200, {
        'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': 'no-store'
      });
      createReadStream(file).pipe(res);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

// Run directly rather than imported?
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.argv[2]) || 8137;
  const root = process.argv[3] || process.cwd();
  await startServer({ port, root });
  console.log(`Serving ${root} at http://localhost:${port}  (Ctrl+C to stop)`);
}
