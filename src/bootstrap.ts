// return [lowerbound, upperbound]
function bootstrap(o: {
    data: Float64Array,
    distribution?: Distribution,
    α?: number,
    param: string,
    nresample?: number
}): [number, number] {
    const { data, distribution = new Empirical(o.data), α = 0.05, param, nresample = 1000 } = o
    const d̂ = distribution.estimate(o.data) as Distribution

    const θs = []
    for (let i = 0; i < o.nresample; i++) {
        θs.push(distribution.estimate(d̂.sample(data.length) as Float64Array, param))
    }

    const i = ceil(o.nresample * α / 2)
    θs.sort()

    return [θs[i-1], θs[θs.length-i]]
}

Xstat.bootstrap = bootstrap
