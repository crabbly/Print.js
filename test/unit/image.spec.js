import Image from '../../src/js/image.ts'

describe('Image', () => {
  it('has a method named print', () => {
    expect(typeof Image.print).toBe('function')
  })
})
