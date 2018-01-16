interface IDistribution {}

abstract class Distribution implements IDistribution {
    pdf?(x:number): number
    abstract sample(n?: number): number | Float64Array
}

class Normal extends Distribution {
    readonly μ: f64
    readonly σ2: f64

    get σ() {
        return this.σ2 instanceof NA ? na : sqrt(this.σ2)
    }

    constructor(μ:f64=na, σ2:f64=na) {
        super()

        this.μ = μ
        this.σ2 = σ2
    }

    pdf(x: number) {
        const {μ, σ2} = this
        if (μ instanceof NA || σ2 instanceof NA)
            throw new Error("distribution contains unknown parameters")

        return 1 / sqrt(2 * π * σ2) * exp((x - μ) ** 2 / -2 / σ2)
    }

    sample(n: number) {
        const {μ, σ} = this
        if (μ instanceof NA || σ instanceof NA)
            throw new Error("distribution contains unknown parameters")

        if (n) {
            const res = new vec(n)
            for (let i = 0; i < n / 2; i++)
                [res[2*i], res[2*i+1]] = Normal._gaussian_pair(μ, σ)
            if (n % 2)
                res[res.length-1] = Normal._gaussian_pair(μ, σ)[0]
            return res
        } else {
            return Normal._gaussian_pair(μ, σ)[0]
        }
    }
}

namespace Normal {
    export const _gaussian_pair = (μ: number, σ: number): [number, number] => {
        const u1 = sqrt(-2 * log(random())) * σ
        const u2 = 2 * π * random()
        return [u1 * cos(u2) + μ, u1 * sin(u2) + μ]
    }
}

class Uniform extends Distribution {
    readonly lb: number
    readonly ub: number

    get len() {
        return this.ub - this.lb
    }

    constructor(lb: number, ub: number) {
        super()

        this.lb = lb
        this.ub = ub
    }

    pdf(x: number) {
        return 1 / this.len
    }

    sample(n: number) {
        const {lb, len} = this
        return n ? new vec(n).map(x => lb + random() * len) : lb + random() * len
    }
}

class Empirical extends Distribution {
    readonly data: Float64Array
    readonly weights: Float64Array

    constructor(data: Float64Array, weights?: Float64Array) {
        super()
        this.data = data
        this.weights = weights ? Empirical.normalize(weights) : new vec(data.length).fill(1/data.length)
    }

    sample(n?: number) {
        // TODO: pre calculate an accumulate array and performing binary search

        if (n) {
            return new vec(n).map(x => this.sample())
        }

        let r = random()

        for (let i = 0; i < this.data.length; i++) {
            if (r < this.weights[i]) {
                return this.data[i]
            } else {
                r -= this.weights[i]
            }
        }
    }
}

namespace Empirical {
    export const normalize = (x) => {
        const sum = x.reduce((x, y) => x + y)
        return x.map(x => x / sum)
    }
}

Xstat.distributions = { Normal, Uniform, Empirical }
