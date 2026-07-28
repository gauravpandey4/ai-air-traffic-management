import { readFile } from 'node:fs/promises';

describe('Pages snapshot and release guard', () => {
  it('keeps the scheduled release behind the repository variable and one snapshot command', async () => {
    const workflow = await readFile('.github/workflows/pages.yml', 'utf8');
    expect(workflow).toContain("vars.PAGES_RELEASE_ENABLED == 'true'");
    expect(workflow.match(/npm run snapshot:aircraft/gu)).toHaveLength(1);
    expect(workflow).toContain('cron:');
    expect(workflow).toContain('aircraft-snapshot-${{ github.run_id }}-${{ github.run_attempt }}');
    expect(workflow).toContain('path: .workflow-cache/aircraft-cooldown.json');
    expect(workflow).not.toContain('path: public/data/aircraft-snapshot.json');
    expect(workflow).not.toContain('curl https://opendata.adsb.fi');
  });

  it('keeps provider access out of pull-request CI', async () => {
    const workflow = await readFile('.github/workflows/ci.yml', 'utf8');
    expect(workflow).not.toContain('snapshot:aircraft');
    expect(workflow).not.toContain('opendata.adsb.fi');
  });

  it('keeps the dynamic aircraft snapshot out of the offline precache', async () => {
    const viteConfig = await readFile('vite.config.ts', 'utf8');
    expect(viteConfig).toContain("globIgnores: ['**/data/aircraft-snapshot.json']");
  });
});
