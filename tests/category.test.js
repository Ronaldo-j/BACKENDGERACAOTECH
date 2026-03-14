const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/connection');

let token = '';

beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create a mock user for auth
    await request(app).post('/v1/user').send({
        firstname: 'Admin',
        surname: 'User',
        email: 'admin@example.com',
        password: 'password123',
        confirmPassword: 'password123'
    });
    const loginRes = await request(app).post('/v1/user/token').send({
        email: 'admin@example.com',
        password: 'password123'
    });
    token = loginRes.body.token;
});

afterAll(async () => {
    await sequelize.close();
});

describe('Category Endpoints', () => {
    let categoryId = '';

    it('should create a new category', async () => {
        const res = await request(app)
            .post('/v1/category')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Electronics',
                slug: 'electronics',
                use_in_menu: true
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        categoryId = res.body.id;
    });

    it('should fetching category list', async () => {
        const res = await request(app).get('/v1/category/search');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.total).toBeGreaterThan(0);
    });

    it('should fetch category by ID', async () => {
        const res = await request(app).get(`/v1/category/${categoryId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Electronics');
    });

    it('should update category', async () => {
        const res = await request(app)
            .put(`/v1/category/${categoryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Computers',
                slug: 'computers',
                use_in_menu: false
            });
        expect(res.statusCode).toEqual(204);

        const verify = await request(app).get(`/v1/category/${categoryId}`);
        expect(verify.body).toHaveProperty('name', 'Computers');
        expect(verify.body).toHaveProperty('use_in_menu', false);
    });

    it('should delete category', async () => {
        const res = await request(app)
            .delete(`/v1/category/${categoryId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(204);

        const verify = await request(app).get(`/v1/category/${categoryId}`);
        expect(verify.statusCode).toEqual(404);
    });
});
