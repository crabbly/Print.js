import Pdf from '../../src/js/pdf'

describe('Pdf', () => {
  it('has a method named print', () => {
    expect(typeof Pdf.print).toBe('function')
  })
})
