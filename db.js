const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getSigners = () => {
    return db.query('SELECT * FROM signatures');
};

module.exports.addSigner = (first, last, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
     VALUES ($1,$2,$3)`;
    const params = [first, last, signature];
    return db.query(q, params);
};

module.exports.viewTotal = () => {
    return db.query('SELECT COUNT(*) FROM signatures');
};
