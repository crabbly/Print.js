import Image from '../../src/js/image'; // Path should be correct as image.js was renamed to image.ts

describe('Image', () => {
  it('has a method named print', () => {
    expect(typeof Image.print).toBe('function');
  });
});
