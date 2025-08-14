import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

test('basic mongoose and GridFSBucket import', async () => {
  expect(typeof mongoose.connect).toBe('function');
  expect(typeof GridFSBucket).toBe('function');
});
