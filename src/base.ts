declare const Xstat

class NA implements IDistribution {}

const na = new NA

type f64 = number | NA

type vec = Float64Array | NA
const vec = Float64Array

class Sample {
    data: vec
    dist: IDistribution
}

Xstat.NA = NA
Xstat.na = na
Xstat.Sample = Sample
