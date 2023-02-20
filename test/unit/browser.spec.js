import Browser from '../../src/js/browser'

describe('Browser', () => {
  it('has a function named isFirefox that returns a boolean value', () => {
    expect(typeof Browser.isFirefox).toBe('function')
    expect(typeof Browser.isFirefox()).toBe('boolean')
  })
  it('has a function named getFirefoxMajorVersion', () => {
    expect(typeof Browser.getFirefoxMajorVersion).toBe('function')
  })
  it('has a function getFirefoxMajorVersion which returns major version from the userAgent string', () => {
    const userAgents = [
      'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/110.0',
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/29.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    ]
    const majorVersions = userAgents.map(userAgent => Browser.getFirefoxMajorVersion(userAgent))
    expect(majorVersions).toEqual([110, 29, undefined])
  })

  it('has a function named isIE that returns a boolean value', () => {
    expect(typeof Browser.isIE).toBe('function')
    expect(typeof Browser.isIE()).toBe('boolean')
  })

  it('has a function named isEdge that returns a boolean value', () => {
    expect(typeof Browser.isEdge).toBe('function')
    expect(typeof Browser.isEdge()).toBe('boolean')
  })

  it('has a function named isChrome that returns a boolean value', () => {
    expect(typeof Browser.isChrome).toBe('function')
    expect(typeof Browser.isChrome()).toBe('boolean')
  })

  describe('isChrome()', () => {
    it('returns true for Google Chrome', () => {
      const stubbedWindow = { chrome: {} }
      expect(Browser.isChrome(stubbedWindow)).toBeTruthy()
    })

    it('returns false for non Google Chrome', () => {
      const stubbedWindow = {}
      expect(Browser.isChrome(stubbedWindow)).toBeFalsy()
    })
  })

  it('has a function named isSafari that returns a boolean value', () => {
    expect(typeof Browser.isSafari).toBe('function')
    expect(typeof Browser.isSafari()).toBe('boolean')
  })
})
