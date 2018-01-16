namespace sampling {
    // trival
    export const inversion = (o: {
        f_rev: (x: number) => number,
        n?: number
    }): number | Float64Array => {
        return o.n ? o.f_rev(Math.random()) : new Float64Array(o.n || 1).map(x => o.f_rev(Math.random()))
    }

    // you can omit M if it's somewhat hard to get, but this is only an approximation (rare events happen more frequently than it should), especially for small samples
    export const rejection = (o: {
        pdf: (x: number) => number,
        envelope: Distribution,
        M?: number | ((c: number) => number),
        n?: number
    }): number | Float64Array => {
        const { pdf, envelope: env, M = c => 1.05 * c, n = 1 } = o

        let X
        if (typeof(M) == 'number') {
            X = new vec(n).map(x => {
                while (true) {
                    const y = env.sample() as number
                    if (random() < pdf(y) / M / env.pdf(y))
                        return y
                }
            })
        } else if (typeof(M) == 'function') {
            let res: [number, number][] = []
            let Mc = typeof(M) == 'number' ? M : 1.2

            while (res.length < n) {
                const y = env.sample() as number
                const c = pdf(y) / Mc / env.pdf(y)
                const u = random()

                if (c > 1) { // envelope not fully cover
                    if (typeof(M) == 'function') { // enlarge M and accept it
                        const Δ = M(c)
                        Mc *= Δ
                        res = res.map(([y, u]): [number, number] => [y, u/Δ]).filter(([y, u]) => u > 1)
                    } else {
                        throw new Error("f(Y) / Mg(Y) > 1, try bigger M")
                    }
                }

                if (u < c) {
                    res.push([y, c / u])
                }
            }

            X = new vec(res.map(x=>x[0]))
        }

        return o.n ? X : X[0]
    }

    // currently use resampling with replacement
    export const sampling_importance_resampling = (o: {
        pdf: (x: number) => number,
        proposal: Distribution,
        J: number
        n?: number
    }): number | Float64Array => {
        const {pdf, proposal, n=1, J=10*(n+10)} = o

        const Y = proposal.sample(J) as Float64Array
        const W = Y.map(x => pdf(x) / proposal.pdf(x))

        const X = new Empirical(Y, W).sample(n)
        return o.n ? X : X[0]
    }
}

Xstat.sampling = sampling
