const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Log = require('../models/Log');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Log.deleteMany({});
});

describe('API Endpoints', () => {
  test('GET /api/health - should return service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  test('POST /api/logs - should log city selection', async () => {
    const mockData = { city: 'Vilnius', timestamp: new Date().toISOString() };
    const res = await request(app)
      .post('/api/logs')
      .send(mockData);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Logged successfully');
  });

  test('GET /api/cities - should fetch cities', async () => {
    const res = await request(app).get('/api/cities');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Log Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Log.deleteMany({});
  });

  test('should create and save log successfully', async () => {
    const mockLog = {
      city: 'Kaunas',
      timestamp: new Date()
    };
    
    const savedLog = await Log.create(mockLog);
    
    expect(savedLog._id).toBeDefined();
    expect(savedLog.city).toBe(mockLog.city);
    expect(savedLog.timestamp).toEqual(mockLog.timestamp);
  });

  test('should fail if city is missing', async () => {
    const logWithoutCity = { timestamp: new Date() };
    
    await expect(Log.create(logWithoutCity))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });
});
