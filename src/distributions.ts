interface IDistribution {}

abstract class Distribution implements IDistribution {
}

class Normal extends Distribution {
    μ: f64
    σ2: f64

    constructor(μ:f64=na, σ2:f64=na) {
        super()

        this.μ = μ
        this.σ2 = σ2
    }
}

namespace Normal {
    export const _gaussian_pair = (μ: number, σ: number): [number, number] => {
        const u1 = sqrt(-2 * log(random())) * σ + μ
        const u2 = 2 * π * random() + μ
        return [u1 * cos(u2), u1 * sin(u2)]
    }
}

Xstat.Normal = Normal
