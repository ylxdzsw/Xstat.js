// return [lowerbound, upperbound]
function bootstrap(o: {
    data: Float64Array,
    distribution?: Distribution,
    α?: number,
    param: string,
    nresample?: number
}): [number, number] {
    const { data, distribution = new Empirical(), α = 0.05, param, nresample = 1000 } = o
    const d̂ = distribution.estimate(data) as Distribution

    const θs = []
    for (let i = 0; i < nresample; i++) {
        θs.push(distribution.estimate(d̂.sample(data.length) as Float64Array, param))
    }

    const i = ceil(nresample * α / 2)
    θs.sort()

    return [θs[i-1], θs[θs.length-i]]
}

Xstat.bootstrap = bootstrap
