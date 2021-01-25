const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

module.exports.getSigners = () => {
    return db.query('SELECT * FROM signatures');
};

module.exports.addSigner = (userID, signature) => {
    const q = `INSERT INTO signatures (user_id, signature)
     VALUES ($1,$2)`;
    const params = [userID, signature];
    return db.query(q, params);
};

module.exports.viewTotal = () => {
    return db.query('SELECT COUNT(*) FROM signatures');
};

module.exports.getSignee = (userID) => {
    const q = `SELECT * FROM signatures WHERE user_id = $1`;
    const params = [userID];
    return db.query(q, params);
};

module.exports.newUser = (firstName, lastName, email, password) => {
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id`;
    const params = [firstName, lastName, email, password];
    return db.query(q, params);
};

module.exports.logAttempt = (email) => {
    const q = `SELECT * FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.checkSignature = (userId) => {
    const q = `select * from signatures where user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.userDetails = (userId) => {
    const q = `SELECT * FROM users WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};

// insert into user_profiles (age, city, url, user_id) values (29, 'Berlin', 'banana.com', '18d504b4-70cb-4355-8525-71b41a425831');
