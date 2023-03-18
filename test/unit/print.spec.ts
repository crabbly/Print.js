import Print from '../../src/js/print.ts'

describe('Print', () => {
  it('has a method named send', () => {
    expect(typeof Print.send).toBe('function')
  })
})
