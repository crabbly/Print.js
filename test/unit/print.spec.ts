import Print from '../../src/js/print'; // Path should be correct as print.js was renamed to print.ts

describe('Print', () => {
  it('has a method named send', () => {
    expect(typeof Print.send).toBe('function');
  });
});
