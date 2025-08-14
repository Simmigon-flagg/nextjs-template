import { authOptions } from '../../../utils/authOptions';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectToDatabase } from '../../../utils/database';

jest.mock('../../../models/user');
jest.mock('../../../utils/database', () => ({ connectToDatabase: jest.fn() }));
jest.mock('bcryptjs');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('authOptions.providers[0].options.authorize', () => {
  let authorize;

  beforeAll(() => {
    // Access the actual authorize function from authOptions
    authorize = authOptions.providers[0].options.authorize;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should authorize user successfully', async () => {
    const mockUser = {
      _id: { toString: () => 'user123' },
      email: 'test@example.com',
      password: 'hashedPass',
      save: jest.fn(),
    };

    connectToDatabase.mockResolvedValue();
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    crypto.randomBytes.mockReturnValue(Buffer.from('token123'));

    const result = await authorize({
      email: 'test@example.com',
      password: 'password',
    });

    expect(connectToDatabase).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPass');
    expect(mockUser.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 'user123', email: 'test@example.com' });
  });

  it('should throw if credentials are missing', async () => {
    await expect(authorize(null)).rejects.toThrow('Missing email or password');
  });

  it('should throw if user is not found', async () => {
    connectToDatabase.mockResolvedValue();
    User.findOne.mockResolvedValue(null);

    await expect(
      authorize({ email: 'noone@example.com', password: 'password' })
    ).rejects.toThrow('User not found');
  });

  it('should throw if password is invalid', async () => {
    const mockUser = {
      _id: { toString: () => 'user123' },
      email: 'test@example.com',
      password: 'hashedPass',
    };

    connectToDatabase.mockResolvedValue();
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authorize({ email: 'test@example.com', password: 'wrong' })
    ).rejects.toThrow('Invalid password');
  });
});

describe('authOptions callbacks', () => {
  it('jwt callback adds userId if user exists', async () => {
    const token = {};
    const user = { id: 'user123' };
    const result = await authOptions.callbacks.jwt({ token, user });
    expect(result.userId).toBe('user123');
  });

  it('jwt callback returns token unchanged if no user', async () => {
    const token = {};
    const result = await authOptions.callbacks.jwt({ token, user: null });
    expect(result).toBe(token);
  });

  it('session callback adds _id to session user', async () => {
    const session = { user: {} };
    const token = { userId: 'user123' };
    const result = await authOptions.callbacks.session({ session, token });
    expect(result.user._id).toBe('user123');
  });
});
