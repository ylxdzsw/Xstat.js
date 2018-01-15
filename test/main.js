const Xstat = require('../build/xstat')

describe('nob', () => {
    test('hello', () => {
        const {NA, na} = Xstat
        expect(na).toBeInstanceOf(NA)
    })
})
