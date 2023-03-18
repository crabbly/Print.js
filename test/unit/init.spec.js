import Init from '../../src/js/init.ts'

describe('Init Module', () => {
  it('has a function named init', () => {
    expect(typeof Init.init).toBe('function')
  })
})
