import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'out');

async function listHtmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(absolute);
      return entry.isFile() && entry.name.endsWith('.html') ? [absolute] : [];
    })
  );
  return files.flat();
}

function assetPrefixFor(filePath: string) {
  const relativeDir = path.relative(outDir, path.dirname(filePath));
  if (!relativeDir) return '.';
  const depth = relativeDir.split(path.sep).length;
  return Array.from({ length: depth }, () => '..').join('/');
}

function relativeRouteHref(filePath: string, route: string) {
  const cleanRoute = route.replace(/^\/+/, '').replace(/\/+$/, '');
  const targetDir = cleanRoute ? path.join(outDir, cleanRoute) : outDir;
  const relative = path.relative(path.dirname(filePath), targetDir).replaceAll(path.sep, '/');
  return `${relative || '.'}/`;
}

async function main() {
  await stat(outDir);
  const htmlFiles = await listHtmlFiles(outDir);

  await Promise.all(
    htmlFiles.map(async (filePath) => {
      const prefix = assetPrefixFor(filePath);
      const html = await readFile(filePath, 'utf8');
      const patched = html
        .replaceAll('"/_next/', `"${prefix}/_next/`)
        .replaceAll("'/_next/", `'${prefix}/_next/`)
        .replace(/href="\/(?!_next\/|images\/|data\/|api\/|#)([^"#?]*)"/g, (_match, route: string) => {
          return `href="${relativeRouteHref(filePath, route)}"`;
        });

      if (patched !== html) {
        await writeFile(filePath, patched, 'utf8');
      }
    })
  );

  console.log(`Patched ${htmlFiles.length} exported HTML files to use relative Next.js asset paths.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
