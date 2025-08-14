import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Immediately create in-memory Mongo and set environment variable
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Make MONGODB_URI available for all modules
  process.env.MONGODB_URI = uri;
  global.__MONGO_URI__ = uri;

  // Connect mongoose
  await mongoose.connect(uri); // no need for useNewUrlParser/useUnifiedTopology
});

// Clear all collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and stop MongoMemoryServer after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
