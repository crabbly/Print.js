import Pdf from '../../src/js/pdf'; // Path should be correct as pdf.js was renamed to pdf.ts

describe('Pdf', () => {
  it('has a method named print', () => {
    expect(typeof Pdf.print).toBe('function');
  });
});
