let tgen = {};
tgen.rand = () => {return Math.random().toString(36).substring(2)}
tgen._token = (length) => {
    let t = length > 0 ? (tgen.rand() + tgen._token(length - 1)) : tgen.rand()
    return t
}
tgen.token = (length) => {
    let t = tgen._token(Math.floor(length / 11))
    return t.length > length ? t.substring(0, length) : (t.length < length ? (t + tgen.rand()).substring(0, length) : t)
}

module.exports = tgen;