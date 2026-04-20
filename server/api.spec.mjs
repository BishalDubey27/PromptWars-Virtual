import request from 'supertest';
import { describe, it, expect } from 'vitest';
import express from 'express';
import { body, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

app.post('/api/chat', 
  body('message').isString().notEmpty().trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    res.json({ reply: "Test response" });
  }
);

app.get('/healthz', (req, res) => res.status(200).send('OK'));

describe('VenueFlow API Suite', () => {
  it('GET /healthz should return 200 OK', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });

  it('POST /api/chat should validate input correctly', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: "" });
    expect(response.status).toBe(400);
  });

  it('POST /api/chat should accept valid messages', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: "Where is the bathroom?" });
    expect(response.status).toBe(200);
    expect(response.body.reply).toBe("Test response");
  });
});
