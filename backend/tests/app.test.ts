import request from 'supertest';
import app from '../src/app'; // Adjust the path if necessary

describe('App Tests', () => {
    it('should respond with a 200 status for the root route', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('should create an item and respond with a 201 status', async () => {
        const newItem = { name: 'Test Item', description: 'This is a test item.' };
        const response = await request(app).post('/items').send(newItem);
        expect(response.status).toBe(201);
        expect(response.body.name).toBe(newItem.name);
    });

    // Add more tests as needed
});