import { repositoryBase } from '../../vite.config';

describe('repository foundation', () => {
  it('uses the approved GitHub Pages base path', () => {
    expect(repositoryBase).toBe('/ai-air-traffic-management/');
  });
});
