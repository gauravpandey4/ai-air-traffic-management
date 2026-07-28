import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const repositoryBase = '/ai-air-traffic-management/';
const distDirectory = resolve('dist');
const initialJavaScriptBudgetBytes = 350 * 1024;

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Production build verification failed: ${message}`);
  }
}

async function requireFile(relativePath: string): Promise<void> {
  const file = await stat(resolve(distDirectory, relativePath));
  invariant(file.isFile(), `missing ${relativePath}`);
}

function localReferences(html: string): string[] {
  return [...html.matchAll(/\b(?:href|src)="([^"]+)"/gu)]
    .map((match) => match[1])
    .filter((reference): reference is string => reference !== undefined)
    .filter(
      (reference) =>
        !reference.startsWith('http:') &&
        !reference.startsWith('https:') &&
        !reference.startsWith('data:') &&
        !reference.startsWith('#'),
    );
}

async function verifyProductionBuild(): Promise<void> {
  await Promise.all([
    requireFile('index.html'),
    requireFile('manifest.webmanifest'),
    requireFile('sw.js'),
    requireFile('data/aircraft-snapshot.json'),
  ]);

  const indexHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
  const references = localReferences(indexHtml);
  invariant(references.length > 0, 'index.html has no local asset references');
  invariant(!indexHtml.includes('registerSW.js'), 'an automatic second worker registration exists');

  for (const reference of references) {
    const url = new URL(reference, 'https://example.invalid');
    invariant(
      url.pathname.startsWith(repositoryBase),
      `${reference} is outside the repository base ${repositoryBase}`,
    );
    const relativePath = decodeURIComponent(url.pathname.slice(repositoryBase.length));
    invariant(relativePath.length > 0, `${reference} does not resolve to a file`);
    invariant(!relativePath.includes('..'), `${reference} escapes the production directory`);
    await requireFile(relativePath);
  }

  const manifestText = await readFile(resolve(distDirectory, 'manifest.webmanifest'), 'utf8');
  const manifest = JSON.parse(manifestText) as {
    icons?: { src?: string }[];
    scope?: string;
    start_url?: string;
  };
  invariant(manifest.start_url === repositoryBase, 'manifest start_url does not match Pages base');
  invariant(manifest.scope === repositoryBase, 'manifest scope does not match Pages base');
  invariant((manifest.icons?.length ?? 0) >= 2, 'manifest is missing install icons');
  for (const icon of manifest.icons ?? []) {
    invariant(typeof icon.src === 'string' && icon.src.length > 0, 'manifest icon has no source');
    const iconUrl = new URL(icon.src, `https://example.invalid${repositoryBase}`);
    invariant(iconUrl.pathname.startsWith(repositoryBase), `${icon.src} is outside the Pages base`);
    await requireFile(iconUrl.pathname.slice(repositoryBase.length));
  }

  const serviceWorker = await readFile(resolve(distDirectory, 'sw.js'), 'utf8');
  invariant(serviceWorker.includes(repositoryBase), 'service worker omits the repository base');
  invariant(
    !serviceWorker.includes('data/aircraft-snapshot.json'),
    'dynamic aircraft snapshot was added to the offline precache',
  );
  invariant(!serviceWorker.includes('registerSW.js'), 'worker precaches an unused register script');

  const initialScripts = references
    .filter((reference) => reference.endsWith('.js'))
    .map((reference) => new URL(reference, 'https://example.invalid').pathname)
    .map((pathname) => resolve(distDirectory, pathname.slice(repositoryBase.length)));
  invariant(initialScripts.length > 0, 'index.html has no initial JavaScript entry');
  const initialScriptContents = await Promise.all(initialScripts.map((script) => readFile(script)));
  const compressedInitialBytes = initialScriptContents.reduce(
    (total, script) => total + gzipSync(script).byteLength,
    0,
  );
  invariant(
    compressedInitialBytes <= initialJavaScriptBudgetBytes,
    `initial JavaScript is ${String(compressedInitialBytes)} compressed bytes; budget is ${String(initialJavaScriptBudgetBytes)}`,
  );

  console.log(
    `Production build verified at ${repositoryBase}; ${String(references.length)} local references exist, the dynamic snapshot is excluded from precache, and initial JavaScript is ${String(compressedInitialBytes)} compressed bytes.`,
  );
}

await verifyProductionBuild();
