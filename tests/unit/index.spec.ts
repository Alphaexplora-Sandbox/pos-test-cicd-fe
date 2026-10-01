import { SERVICE_NAME } from '../../src/index';

describe('pos-test-cicd-frontend', () => {
  it('should export SERVICE_NAME', () => {
    expect(SERVICE_NAME).toBe('pos-test-cicd-frontend');
  });
});