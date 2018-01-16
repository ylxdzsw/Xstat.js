const { E: e, PI: π, abs, sin, cos, tan, exp, floor, ceil, round, trunc, log, max, min, sqrt, sign, random } = Math

// derived from https://github.com/substack/gamma.js, which is released under the MIT license
// z > 0
function Γ(z: number): number {
    if (z < 0.5) {
        return π / (sin(π * z) * Γ(1 - z))
    } else {
        z -= 1
        let x = Γ.p[0]
        for (var i = 1; i < Γ.g + 2; i++)
            x += Γ.p[i] / (z + i)

        const t = z + Γ.g + 0.5

        return sqrt(2 * π)
            * t ** (z + 0.5)
            * exp(-t)
            * x
    }
}

namespace Γ {
    export const g = 7
    export const p = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ]
}

// derived from https://github.com/josdejong/mathjs/blob/master/lib/function/special/erf.js, which is under the Apache 2.0 License
function erf(x: number): number {
    const y = abs(x)

    return y >= 2 ** 53 ? sign(x) :
           y <= 0.46875 ? sign(x) * erf.erf1(y) :
           y <= 4.0     ? sign(x) * (1 - erf.erfc2(y)) :
                          sign(x) * (1 - erf.erfc3(y))
}

namespace erf {
    const SQRPI = 5.6418958354775628695e-1

    const P = [[
        3.16112374387056560e00, 1.13864154151050156e02,
        3.77485237685302021e02, 3.20937758913846947e03,
        1.85777706184603153e-1
    ], [
        5.64188496988670089e-1, 8.88314979438837594e00,
        6.61191906371416295e01, 2.98635138197400131e02,
        8.81952221241769090e02, 1.71204761263407058e03,
        2.05107837782607147e03, 1.23033935479799725e03,
        2.15311535474403846e-8
    ], [
        3.05326634961232344e-1, 3.60344899949804439e-1,
        1.25781726111229246e-1, 1.60837851487422766e-2,
        6.58749161529837803e-4, 1.63153871373020978e-2
    ]]

    const Q = [[
        2.36012909523441209e01, 2.44024637934444173e02,
        1.28261652607737228e03, 2.84423683343917062e03
    ], [
        1.57449261107098347e01, 1.17693950891312499e02,
        5.37181101862009858e02, 1.62138957456669019e03,
        3.29079923573345963e03, 4.36261909014324716e03,
        3.43936767414372164e03, 1.23033935480374942e03
    ], [
        2.56852019228982242e00, 1.87295284992346047e00,
        5.27905102951428412e-1, 6.05183413124413191e-2,
        2.33520497626869185e-3
    ]]

    export const erf1 = (y: number): number => {
        var ysq = y * y;
        var xnum = P[0][4]*ysq;
        var xden = ysq;
        var i;

        for (i = 0; i < 3; i += 1) {
          xnum = (xnum + P[0][i]) * ysq;
          xden = (xden + Q[0][i]) * ysq;
        }
        return y * (xnum + P[0][3]) / (xden + Q[0][3]);
    }

    export const erfc2 = (y: number): number => {
        var xnum = P[1][8] * y;
        var xden = y;
        var i;

        for (i = 0; i < 7; i += 1) {
          xnum = (xnum + P[1][i]) * y;
          xden = (xden + Q[1][i]) * y;
        }
        var result = (xnum + P[1][7]) / (xden + Q[1][7]);
        var ysq = trunc(y * 16) / 16;
        var del = (y - ysq) * (y + ysq);
        return Math.exp(-ysq*ysq) * Math.exp(-del) * result;
    }

    export const erfc3 = (y: number): number => {
        var ysq = 1 / (y * y);
        var xnum = P[2][5] * ysq;
        var xden = ysq;
        var i;

        for (i = 0; i < 4; i += 1) {
          xnum = (xnum + P[2][i]) * ysq;
          xden = (xden + Q[2][i]) * ysq;
        }
        var result = ysq * (xnum + P[2][4]) / (xden + Q[2][4]);
        result = (SQRPI - result) / y;
        ysq = trunc(y * 16) / 16;
        var del = (y - ysq) * (y + ysq);
        return Math.exp(-ysq*ysq) * Math.exp(-del) * result;
    }
}

// n int, m int, n >= m
const combination = (n: number, m: number): number => {
    m = max(m, n-m)

    let res = 1
    for (let i = 1; i <= n - m; i++) {
        res *= (m + i) / i
    }

    return res
}

Xstat.Γ = Γ
Xstat.erf = erf
Xstat.combination = combination
