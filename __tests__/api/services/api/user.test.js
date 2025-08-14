import {
  updateUserByEmail,
  getUserProfile,
  checkUserExists,
  resetPassword,
  requestPasswordReset,
} from '../../../../services/api/user';
import User from '../../../../models/user';
import { connectToDatabase } from '../../../../utils/database';
import { sendEmail } from '../../../../utils/sendEmail';
import crypto from 'crypto';

jest.mock('../../../../models/user');
jest.mock('../../../../utils/database');
jest.mock('../../../../utils/sendEmail');

describe('user service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserByEmail', () => {
    it('returns null if user not found', async () => {
      connectToDatabase.mockResolvedValue();
      User.findOne.mockResolvedValue(null);

      const result = await updateUserByEmail('noone@example.com', {
        name: 'New',
      });
      expect(result).toBeNull();
      expect(User.findOne).toHaveBeenCalledWith({ email: 'noone@example.com' });
    });

    it('updates and returns user', async () => {
      connectToDatabase.mockResolvedValue();
      const mockUser = {
        save: jest.fn(),
        email: 'user@example.com',
        name: 'Old Name',
      };
      User.findOne.mockResolvedValue(mockUser);

      const data = { name: 'New Name' };
      const result = await updateUserByEmail('user@example.com', data);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
    });
  });

  describe('getUserProfile', () => {
    it('returns null if user not found', async () => {
      connectToDatabase.mockResolvedValue({ bucket: { find: jest.fn() } });
      User.findOne.mockResolvedValue(null);

      const result = await getUserProfile('missing@example.com');
      expect(result).toBeNull();
    });

    it('returns user profile without image if no imageId', async () => {
      connectToDatabase.mockResolvedValue({ bucket: { find: jest.fn() } });
      const mockUser = {
        _id: 'id',
        name: 'Name',
        email: 'email@example.com',
        imageId: null,
        children: ['child1'],
      };
      User.findOne.mockResolvedValue(mockUser);

      const profile = await getUserProfile('email@example.com');

      expect(profile).toEqual({
        _id: 'id',
        name: 'Name',
        email: 'email@example.com',
        imagefileUrl: null,
        children: ['child1'],
      });
    });

    it('returns user profile with image URL if image found', async () => {
      const mockImage = [{ _id: 'imageid' }];
      const bucketFind = jest
        .fn()
        .mockReturnValue({ toArray: jest.fn().mockResolvedValue(mockImage) });
      connectToDatabase.mockResolvedValue({ bucket: { find: bucketFind } });

      const mockUser = {
        _id: 'id',
        name: 'Name',
        email: 'email@example.com',
        imageId: 'imageid',
        children: [],
      };
      User.findOne.mockResolvedValue(mockUser);

      const profile = await getUserProfile('email@example.com');

      expect(bucketFind).toHaveBeenCalledWith({ _id: 'imageid' });
      expect(profile.imagefileUrl).toBe('/api/images/imageid');
    });
  });

  describe('checkUserExists', () => {
    it('returns user with only _id field', async () => {
      connectToDatabase.mockResolvedValue();
      const mockUser = { _id: 'userId' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await checkUserExists('email@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'email@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('resetPassword', () => {
    it('throws error if missing token or newPassword', async () => {
      await expect(resetPassword(null, 'pass')).rejects.toMatchObject({
        status: 400,
      });
      await expect(resetPassword('token', null)).rejects.toMatchObject({
        status: 400,
      });
    });

    it('throws error if user not found or token expired', async () => {
      connectToDatabase.mockResolvedValue();
      User.findOne.mockResolvedValue(null);

      await expect(resetPassword('token', 'newpass')).rejects.toMatchObject({
        status: 400,
        message: 'Token invalid or expired',
      });
    });

    it('updates password and clears reset fields', async () => {
      connectToDatabase.mockResolvedValue();

      const mockUser = {
        passwordResetToken: 'hashedtoken',
        passwordResetExpires: Date.now() + 10000,
        save: jest.fn(),
        password: 'oldpass',
      };

      User.findOne.mockResolvedValue(mockUser);

      // Mock crypto to produce known hashed token
      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: () => ({
          digest: () => 'hashedtoken',
        }),
      });

      const result = await resetPassword('token', 'newpass');

      expect(mockUser.password).toBe('newpass');
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBe(true);

      crypto.createHash.mockRestore();
    });
  });

  describe('requestPasswordReset', () => {
    it('throws error if email missing', async () => {
      await expect(requestPasswordReset(null)).rejects.toMatchObject({
        status: 400,
      });
    });

    it('returns silently if user not found', async () => {
      connectToDatabase.mockResolvedValue();
      User.findOne.mockResolvedValue(null);

      const result = await requestPasswordReset('noone@example.com');
      expect(result).toBeUndefined();
    });

    it('creates reset token, saves user and sends email', async () => {
      connectToDatabase.mockResolvedValue();

      const mockUser = {
        createPasswordResetToken: jest.fn().mockReturnValue('resettoken'),
        save: jest.fn(),
        email: 'email@example.com',
      };

      User.findOne.mockResolvedValue(mockUser);

      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';

      await requestPasswordReset('email@example.com');

      expect(mockUser.createPasswordResetToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(sendEmail).toHaveBeenCalledWith(
        mockUser.email,
        'Password Reset Request',
        expect.stringContaining(
          'https://example.com/reset-password?token=resettoken'
        )
      );
    });
  });
});
