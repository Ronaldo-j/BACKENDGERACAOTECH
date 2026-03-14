const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/connection');

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('User Endpoints', () => {
    let token = '';
    let targetUserId = '';

    it('should create a new user', async () => {
        const res = await request(app)
            .post('/v1/user')
            .send({
                firstname: 'John',
                surname: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        targetUserId = res.body.id;
    });

    it('should not create a user with mismatched passwords', async () => {
        const res = await request(app)
            .post('/v1/user')
            .send({
                firstname: 'Jane',
                surname: 'Doe',
                email: 'jane@example.com',
                password: 'password123',
                confirmPassword: 'password1234'
            });
        expect(res.statusCode).toEqual(400);
    });

    it('should login and get a token', async () => {
        const res = await request(app)
            .post('/v1/user/token')
            .send({
                email: 'john@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should fetch user by id', async () => {
        const res = await request(app)
            .get(`/v1/user/${targetUserId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('firstname', 'John');
        expect(res.body).not.toHaveProperty('password');
    });

    it('should update user', async () => {
        const res = await request(app)
            .put(`/v1/user/${targetUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstname: 'John Updated',
                surname: 'Doe',
                email: 'john.update@example.com'
            });
        expect(res.statusCode).toEqual(204);

        const fetchRes = await request(app).get(`/v1/user/${targetUserId}`);
        expect(fetchRes.body).toHaveProperty('firstname', 'John Updated');
    });

    it('should delete user', async () => {
        const res = await request(app)
            .delete(`/v1/user/${targetUserId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(204);

        const fetchRes = await request(app).get(`/v1/user/${targetUserId}`);
        expect(fetchRes.statusCode).toEqual(404);
    });
});
