import Html from '../../src/js/html.ts'

describe('Html', () => {
  it('has a method named print', () => {
    expect(typeof Html.print).toBe('function')
  })
})
