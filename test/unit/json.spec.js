import Json from '../../src/js/json.ts'

describe('Json', () => {
  it('has a method named print', () => {
    expect(typeof Json.print).toBe('function')
  })
})
