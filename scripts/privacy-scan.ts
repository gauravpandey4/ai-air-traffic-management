import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const excludedDirectories = new Set([
  '.git',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);
const textExtensions = new Set([
  '',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.yml',
  '.yaml',
]);
const excludedFiles = new Set(['package-lock.json']);
const forbidden = [
  { label: 'macOS user path', pattern: /\/Users\/[^/\s]+/u },
  {
    label: 'GitHub token',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/u,
  },
  { label: 'private key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u },
  { label: 'email address', pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu },
  {
    label: 'unapproved student name',
    pattern: new RegExp(['Gaurav', 'Pandey'].join('[ ]+'), 'iu'),
  },
] as const;

async function collect(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
      continue;
    }

    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(path)));
    } else if (
      entry.isFile() &&
      !excludedFiles.has(entry.name) &&
      textExtensions.has(extname(entry.name))
    ) {
      files.push(path);
    }
  }

  return files;
}

const findings: string[] = [];
for (const file of await collect(root)) {
  if ((await stat(file)).size > 2_000_000) {
    continue;
  }

  const content = await readFile(file, 'utf8');
  for (const check of forbidden) {
    if (check.pattern.test(content)) {
      findings.push(`${relative(root, file)}: ${check.label}`);
    }
  }
}

if (findings.length > 0) {
  console.error(`Privacy scan failed:\n${findings.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Privacy scan passed.');
}
