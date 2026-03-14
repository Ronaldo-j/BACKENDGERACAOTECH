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

describe('Product Endpoints', () => {
    let productId = '';

    it('should create a new product', async () => {
        const res = await request(app)
            .post('/v1/product')
            .set('Authorization', `Bearer ${token}`)
            .send({
                enabled: true,
                name: "Produto 01",
                slug: "produto-01",
                stock: 10,
                description: "Descrição do produto 01",
                price: 119.90,
                price_with_discount: 99.90,
                category_ids: [],
                images: [
                    { content: "base64 da imagem 1" }
                ],
                options: [
                    {
                        title: "Cor",
                        shape: "square",
                        radius: "4px",
                        type: "text",
                        value: ["PP", "GG", "M"]
                    }
                ]
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        productId = res.body.id;
    });

    it('should fetching product list', async () => {
        const res = await request(app).get('/v1/product/search?option[1]=GG');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should fetch product by ID', async () => {
        const res = await request(app).get(`/v1/product/${productId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', 'Produto 01');
    });

    it('should update product', async () => {
        const res = await request(app)
            .put(`/v1/product/${productId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "Produto 01 atualizado",
                slug: "produto-01-atualizado",
            });
        expect(res.statusCode).toEqual(204);
    });

    it('should delete product', async () => {
        const res = await request(app)
            .delete(`/v1/product/${productId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(204);

        const verify = await request(app).get(`/v1/product/${productId}`);
        expect(verify.statusCode).toEqual(404);
    });
});
