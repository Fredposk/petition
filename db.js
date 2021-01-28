const spicedPg = require('spiced-pg');
const db = spicedPg(
    process.env.DATABASE_URL ||
        'postgres:postgres:postgres@localhost:5432/petition'
);

module.exports.getSigners = () => {
    return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
FROM users
LEFT JOIN signatures ON users.user_id = signatures.user_id
LEFT JOIN user_profiles ON signatures.user_id = user_profiles.user_id`);
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

module.exports.addUserDetails = (age, city, url, userId) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)`;
    const params = [age, city, url, userId];
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

module.exports.UserAccountDetails = (userID) => {
    const q = `SELECT *
FROM users
LEFT JOIN signatures ON users.user_id = signatures.user_id
LEFT JOIN user_profiles ON signatures.user_id = user_profiles.user_id
WHERE users.user_id = $1`;
    const params = [userID];
    return db.query(q, params);
};

module.exports.filterByCity = (city) => {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.url
FROM  users
LEFT JOIN signatures ON users.user_id = signatures.user_id
LEFT JOIN user_profiles ON signatures.user_id = user_profiles.user_id
WHERE LOWER(user_profiles.city) = LOWER($1)`;
    const params = [city];
    return db.query(q, params);
};

module.exports.superDelete1 = (userId) => {
    const q = `DELETE FROM signatures WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};
module.exports.superDelete2 = (userId) => {
    const q = `DELETE FROM user_profiles WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};
module.exports.superDelete3 = (userId) => {
    const q = `DELETE FROM users WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.userProfileUpdate = (age, city, url, userID) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $1, city = $2, url = $3, user_id = $4`;
    const params = [age, city, url, userID];
    return db.query(q, params);
};

module.exports.userAccountUpdate = (
    firstName,
    lastName,
    email,
    password,
    userID
) => {
    const q = `UPDATE users SET first = $1, last = $2, email = $3, password = $4 WHERE user_id = $5`;
    const params = [firstName, lastName, email, password, userID];
    return db.query(q, params);
};

module.exports.deleteSignature = (userID) => {
    const q = `DELETE FROM signatures WHERE user_id = $1`;
    const params = [userID];
    return db.query(q, params);
};
