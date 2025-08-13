// __tests__/authToken.test.js
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as db from '../../../utils/database';
import User from '../../../models/user'; // mock this model

import {
  generateAndStoreRefreshToken,
  verifyRefreshTokenAndGenerateAccessToken,
} from '../../../services/api/auth';

jest.mock('../../../utils/database');
jest.mock('../../../models/user');
jest.mock('jsonwebtoken');

describe('Auth token functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAndStoreRefreshToken', () => {
    it('returns null if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await generateAndStoreRefreshToken('test@example.com');
      expect(result).toBeNull();
      expect(db.connectToDatabase).toHaveBeenCalled();
    });

    it('generates and stores a refresh token if user found', async () => {
      const mockUser = {
        refreshToken: null,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes = jest.fn(() => ({ toString: () => 'mockedtoken' }));

      const token = await generateAndStoreRefreshToken('test@example.com');

      expect(token).toBe('mockedtoken');
      expect(mockUser.refreshToken).toBe('mockedtoken');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('verifyRefreshTokenAndGenerateAccessToken', () => {
    it('returns null if user not found by refresh token', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await verifyRefreshTokenAndGenerateAccessToken('invalidtoken');
      expect(result).toBeNull();
      expect(db.connectToDatabase).toHaveBeenCalled();
    });

    it('returns access token if user found', async () => {
      const mockUser = {
        _id: 'userid123',
        email: 'test@example.com',
      };
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockedAccessToken');

      const token = await verifyRefreshTokenAndGenerateAccessToken('validtoken');

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser._id, email: mockUser.email },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: '15m' }
      );
      expect(token).toBe('mockedAccessToken');
    });
  });
});
