import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const SAVES_DIR = path.resolve(process.cwd(), 'saves');

/**
 * scenesApiPlugin
 *
 * Adds a small REST API to the Vite dev server so the browser can read and
 * write scene JSON files directly inside the project's saves/ folder.
 *
 * Endpoints:
 *   GET    /api/scenes          → [{ name, savedAt }] sorted newest first
 *   POST   /api/scenes          → body: { name, scene } → writes saves/{name}.json
 *   GET    /api/scenes/:name    → full scene JSON
 *   DELETE /api/scenes/:name    → removes saves/{name}.json
 */
function scenesApiPlugin() {
  return {
    name: 'scenes-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/api/scenes')) return next();

        res.setHeader('Content-Type', 'application/json');

        // ── GET /api/scenes ── list all saved scenes ─────────────────────
        if (req.method === 'GET' && req.url === '/api/scenes') {
          try {
            const files = fs.readdirSync(SAVES_DIR).filter((f) => f.endsWith('.json'));
            const scenes = files
              .map((f) => {
                const stat = fs.statSync(path.join(SAVES_DIR, f));
                return { name: f.replace(/\.json$/, ''), savedAt: stat.mtime.toISOString() };
              })
              .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
            res.writeHead(200);
            res.end(JSON.stringify(scenes));
          } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // ── POST /api/scenes ── save a scene ──────────────────────────────
        if (req.method === 'POST' && req.url === '/api/scenes') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { name, scene } = JSON.parse(body);
              // Strip characters that are problematic in filenames across OSes
              const safeName = (name || 'scene')
                .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
                .trim() || 'scene';
              fs.writeFileSync(
                path.join(SAVES_DIR, `${safeName}.json`),
                JSON.stringify(scene, null, 2)
              );
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true, name: safeName }));
            } catch (err) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // ── /api/scenes/:name ── load or delete a specific scene ─────────
        const nameMatch = req.url.match(/^\/api\/scenes\/(.+)$/);
        if (nameMatch) {
          const name = decodeURIComponent(nameMatch[1]);
          const filePath = path.join(SAVES_DIR, `${name}.json`);

          if (req.method === 'GET') {
            try {
              const data = fs.readFileSync(filePath, 'utf-8');
              res.writeHead(200);
              res.end(data);
            } catch {
              res.writeHead(404);
              res.end(JSON.stringify({ error: 'Scene not found' }));
            }
            return;
          }

          if (req.method === 'DELETE') {
            try {
              fs.unlinkSync(filePath);
              res.writeHead(200);
              res.end(JSON.stringify({ ok: true }));
            } catch {
              res.writeHead(404);
              res.end(JSON.stringify({ error: 'Scene not found' }));
            }
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  base: '/robot-layout-demo/',
  plugins: [react(), scenesApiPlugin()],
});
