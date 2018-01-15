interface IDistribution {}

class Normal implements IDistribution {
    μ: f64
    σ2: f64

    constructor(μ:f64=na, σ2:f64=na) {
        this.μ = μ
        this.σ2 = σ2
    }
}

Xstat.Normal = Normal
