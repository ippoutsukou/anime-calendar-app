import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Enable JSON and URL-encoded parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Syoboi Calendar API Proxy
  app.get('/api/syoboi', async (req, res) => {
    try {
      const query = new URLSearchParams(req.query as Record<string, string>).toString();
      const targetUrl = `https://cal.syoboi.jp/db.php?${query}`;

      const fetchRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SyoboiAnimeNav/1.0',
          Accept: 'text/xml, application/xml, */*',
        },
      });

      const xml = await fetchRes.text();
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=180');
      res.send(xml);
    } catch (err: any) {
      console.error('Syoboi API proxy error:', err);
      res.status(500).json({ error: 'Failed to fetch from Syoboi Calendar', message: err.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (!isProd) {
    // In dev mode, use Vite's connect instance as middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
