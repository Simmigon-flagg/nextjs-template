import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { connectToDatabase } from '../../../utils/database';

jest.mock('mongodb', () => {
  const actual = jest.requireActual('mongodb');
  return {
    ...actual,
    GridFSBucket: jest.fn(),
  };
});

describe('connectToDatabase', () => {
  const mockDb = { some: 'db' };
  const mockConnection = {
    db: mockDb,
    dropDatabase: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
    readyState: 1,
  };
  const mockBucketInstance = { bucket: true };

  beforeEach(() => {
    jest.clearAllMocks();
    global.mongoose = { conn: null, bucket: null, promise: null };
    process.env.MONGODB_URI = 'mongodb://localhost:27017/template';

    // Mock mongoose.connect to resolve with mockConnection
    mongoose.connect = jest.fn().mockResolvedValue({
      connection: mockConnection,
    });

    // Mock mongoose.connection methods to avoid hanging
    mongoose.connection.dropDatabase = jest.fn().mockResolvedValue();
    mongoose.connection.close = jest.fn().mockResolvedValue();
    mongoose.connection.readyState = 1;

    GridFSBucket.mockImplementation(() => mockBucketInstance);
  });

  it('connects and returns db and bucket on first call', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/template'; // restore

    const { db, bucket } = await connectToDatabase();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, {});
    expect(GridFSBucket).toHaveBeenCalledWith(mockDb, {
      bucketName: 'uploads',
    });
    expect(db).toBe(mockConnection);
    expect(bucket).toBe(mockBucketInstance);
  });

  it('returns cached connection and bucket on subsequent calls', async () => {
    await connectToDatabase();

    mongoose.connect.mockClear();
    GridFSBucket.mockClear();

    const { db, bucket } = await connectToDatabase();

    expect(mongoose.connect).not.toHaveBeenCalled();
    expect(GridFSBucket).not.toHaveBeenCalled();
    expect(db).toBe(global.mongoose.conn);
    expect(bucket).toBe(global.mongoose.bucket);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.dropDatabase();
      } catch (err) {
        // ignore if mock connection doesn't support dropDatabase
      }
      await mongoose.connection.close();
    }
  });
});
