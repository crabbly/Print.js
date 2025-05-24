import Json from '../../src/js/json'; // Path should be correct as json.js was renamed to json.ts

describe('Json', () => {
  it('has a method named print', () => {
    expect(typeof Json.print).toBe('function');
  });
});
