const Xstat = require('../xstat')

describe('nob', () => {
    test('hello', () => {
        expect(new Xstat.distributions.Normal(null, 1)).toBeInstanceOf(Xstat.distributions.Normal)
    })

    test('a random test', () => {
        const { distributions: { Normal }, bootstrap } = Xstat
        const A = new Normal(0, 2), B = new Normal(0.01, null)
        const sample = A.sample(200)
        const [θl, θu] = bootstrap({ data: sample, distribution: B, α: 0.02, param: "variance", nresample: 2000 })
        expect(θl < 2).toBeTruthy()
        expect(θu > 2).toBeTruthy()
    })
})
