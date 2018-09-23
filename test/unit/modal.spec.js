import Modal from '../../src/js/modal'

describe('Modal', () => {
  it('has a method named show', () => {
    expect(typeof Modal.show).toBe('function')
  })

  it('has a method named close', () => {
    expect(typeof Modal.close).toBe('function')
  })
})
