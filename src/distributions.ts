abstract class Distribution {
    pdf?(x:number): number
    abstract estimate(sample: Float64Array, v?: string)
    abstract sample(n?: number): number | Float64Array
}

class Normal extends Distribution {
    readonly μ: number
    readonly σ2: number

    get σ() {
        return typeof(this.σ2) == 'number' ? sqrt(this.σ2) : null
    }

    constructor(μ, σ2) {
        super()

        this.μ = μ
        this.σ2 = σ2
    }

    pdf(x: number) {
        const {μ, σ2} = this
        if (typeof(μ) != 'number' || typeof(σ2) != 'number')
            throw new Error("distribution contains unknown parameters")

        return 1 / sqrt(2 * π * σ2) * exp((x - μ) ** 2 / -2 / σ2)
    }

    sample(n: number) {
        const {μ, σ} = this
        if (typeof(μ) != 'number' || typeof(σ) != 'number')
            throw new Error("distribution contains unknown parameters")

        if (n) {
            const res = new Float64Array(n)
            for (let i = 0; i < n / 2; i++)
                [res[2*i], res[2*i+1]] = Normal._gaussian_pair(μ, σ)
            if (n % 2)
                res[res.length-1] = Normal._gaussian_pair(μ, σ)[0]
            return res
        } else {
            return Normal._gaussian_pair(μ, σ)[0]
        }
    }

    estimate(x: Float64Array, v?: string) {
        if (!v) {
            return new Normal(
                typeof(this.μ) != 'number'  ? this.estimate(x, "μ")  : this.μ,
                typeof(this.σ2) != 'number' ? this.estimate(x, "σ2") : this.σ2
            )
        }

        switch (v) {
            case "μ mle":
            case "μ":
            case "mean": {
                if (typeof(this.μ) != 'number') {
                    return sum(x) / x.length
                } else {
                    return this.μ
                }
            }

            case "σ2 mle":
            case "σ2":
            case "variance":
            case "variance mle": {
                if (typeof(this.σ2) != 'number') {
                    const μ = typeof(this.μ) != 'number' ? sum(x) / x.length : this.μ
                    return sum(x.map(x=>(x-μ)**2)) / x.length
                } else {
                    return this.σ2
                }
            }

            case "variance unbiased": {
                if (typeof(this.σ2) != 'number') {
                    if (typeof(this.μ) != 'number') {
                        const x̄ = sum(x) / x.length
                        return sum(x.map(x=>(x-x̄)**2)) / (x.length - 1)
                    } else {
                        return sum(x.map(x=>(x-this.μ)**2)) / x.length
                    }
                } else {
                    return this.σ2
                }
            }

            default:
                throw new Error(`Don't know how to estimate "${v}" in Normal(${this.μ}, ${this.σ2})`)
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
        return n ? new Float64Array(n).map(x => lb + random() * len) : lb + random() * len
    }

    estimate(x: Float64Array, v?: string) {
        if (!v) {
            return this
        }

        switch (v) {
            case "mean": {
                return (this.lb + this.ub) / 2
            }
        }
    }
}

class Empirical extends Distribution {
    readonly data: Float64Array
    readonly weights: Float64Array

    constructor(data: Float64Array, weights?: Float64Array) {
        super()

        if (!data) {
            this.data = this.weights = null
        } else {
            this.data = data
            this.weights = weights ? Empirical.normalize(weights) : new Float64Array(data.length).fill(1/data.length)
        }
    }

    sample(n?: number) {
        // TODO: pre calculate an accumulate array and performing binary search

        if (!this.data)
            throw new Error("distribution contains unknown parameters")

        if (n) {
            return new Float64Array(n).map(x => this.sample())
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

    estimate(x: Float64Array, v?: string) {
        if (!v) {
            if (!this.data) {
                return new Empirical(x)
            } else {
                return this
            }
        }

        switch (v) {
            case "mean": {
                if (!this.data) {
                    return sum(x) / x.length
                } else {
                    return Empirical.get_mean(this)
                }
            }

            case "variance mle":
            case "variance": {
                if (!this.data) {
                    const x̄ = sum(x) / x.length
                    return sum(x.map(x=>(x-x̄)**2)) / x.length
                } else {
                    return Empirical.get_variance(this)
                }
            }

            case "variance unbiased": {
                if (!this.data) {
                    const x̄ = sum(x) / x.length
                    return sum(x.map(x=>(x-x̄)**2)) / (x.length - 1)
                } else {
                    return Empirical.get_variance(this)
                }
            }

            default:
                throw new Error(`Don't know how to estimate "${v}" in Empirical(${this.data})`)
        }
    }
}

namespace Empirical {
    export const normalize = (x) => {
        const sum = x.reduce((x, y) => x + y)
        return x.map(x => x / sum)
    }

    export const get_mean = (x: Empirical) => {
        let m = 0
        for (let i = 0; i < x.data.length; i++) {
            m += x.data[i] * x.weights[i]
        }
        return m
    }

    export const get_variance = (x: Empirical) => {
        const x̄ = get_mean(x)
        let v = 0
        for (let i = 0; i < x.data.length; i++) {
            v += (x.data[i] - x̄) ** 2 * x.weights[i]
        }
        return v
    }
}

Xstat.distributions = { Normal, Uniform, Empirical }
