import Init from '../../src/js/init'; // Path should be correct as init.js was renamed to init.ts

describe('Init Module', () => {
  it('has a function named init', () => {
    expect(typeof Init.init).toBe('function');
  });
});
