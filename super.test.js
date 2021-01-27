const supertest = require('supertest');
const { app } = require('./server');
const cookieSession = require('cookie-session');

test('GET /petition Users who are logged out are redirected to the registration page when they attempt to go to the petition page', () => {
    cookieSession.mockSessionOnce({});

    return supertest(app)
        .get('/petition')
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('/register');
        });
});

test('GET /register Users who are logged in are redirected to the petition page when they attempt to go to either the registration page or the login page', () => {
    cookieSession.mockSessionOnce({
        userID: '788d2d43-83d7-491e-b5f5-3d76f51bda2a',
    });

    return supertest(app)
        .get('/register')
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('/petition');
        });
});

test('GET /petition Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page or submit a signature', () => {
    cookieSession.mockSessionOnce({
        userID: '788d2d43-83d7-491e-b5f5-3d76f51bda2a',
        result: {
            rows: [{ id: '788d2d43-83d7-491e', signature: '987654321' }],
        },
    });

    return supertest(app)
        .get('/petition')
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('/thanks');
        });
});

test('GET /thanks Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to either the thank you page or the signers page', () => {
    cookieSession.mockSessionOnce({
        userID: '788d2d43-83d7-491e-b5f5-3d76f51bda2a',
    });

    return supertest(app)
        .get('/thanks')
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('/petition');
        });
});
