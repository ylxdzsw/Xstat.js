namespace sampling {

    // trival
    const inverse = (o: {
        f_rev: (x: number) => number,
        n?: number
    }): number | Float64Array => {
        return o.n ? o.f_rev(Math.random()) : new Float64Array(o.n || 1).map(x => o.f_rev(Math.random()))
    }
}
