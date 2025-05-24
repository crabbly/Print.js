import Html from '../../src/js/html'; // Path should be correct as html.js was renamed to html.ts

describe('Html', () => {
  it('has a method named print', () => {
    expect(typeof Html.print).toBe('function');
  });
});
