Xstat
=====

Advanced statistic package for modern* browsers and nodejs.

*full ES8 supports required.

```javascript
const {Normal, bootstrap, na} = window.Xstat // or require('./build/Xstat')

// generate sample from distribution
const sample = Xstat.sample(new Normal(0, 1), 100)

// interval estimation using bootstrap with priori distribution
const CI = bootstrap({
    distribution: new Normal(0.01, na),
    data: sample,
    α: 0.05,
    // (equivalent) confidence_level: 0.95,
    nresample: 500,
    param: 'σ2' // or 'var' which works for any distribution
})

// interval estimation using bootstrap without priori distribution
const CI2 = bootstrap({
    // (default) distribution: new Empirical(sample),
    data: sample,
    α: 0.01,
    nresample: 500,
    param: 'mean'
})
```
