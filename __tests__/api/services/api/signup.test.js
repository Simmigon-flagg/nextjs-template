import { signupUser } from '../../../../services/api/signup'; // adjust path if needed
import Users from '../../../../models/user';
import * as db from '../../../../utils/database';

jest.mock('../../../../utils/database');
jest.mock('../../../../models/user');

describe('signupUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error if user already exists', async () => {
    // Mock connectToDatabase to resolve immediately
    db.connectToDatabase.mockResolvedValue();

    // Mock Users.findOne to simulate existing user
    Users.findOne.mockResolvedValue({
      _id: 'existingUserId',
      email: 'test@example.com',
    });

    const input = { name: 'Test', email: 'test@example.com', password: 'pass' };

    const result = await signupUser(input);

    expect(db.connectToDatabase).toHaveBeenCalled();
    expect(Users.findOne).toHaveBeenCalledWith({ email: input.email });
    expect(result).toEqual({ error: 'User already exists', status: 409 });
  });

  it('creates a new user if not exists and returns user with status 201', async () => {
    db.connectToDatabase.mockResolvedValue();

    Users.findOne.mockResolvedValue(null);

    const fakeUser = {
      _id: 'newUserId',
      name: 'New User',
      email: 'new@example.com',
      password: 'hashedPassword',
      imageId: null,
    };

    Users.create.mockResolvedValue(fakeUser);

    const input = {
      name: 'New User',
      email: 'new@example.com',
      password: 'pass',
    };

    const result = await signupUser(input);

    expect(db.connectToDatabase).toHaveBeenCalled();
    expect(Users.findOne).toHaveBeenCalledWith({ email: input.email });
    expect(Users.create).toHaveBeenCalledWith({
      name: input.name,
      email: input.email,
      password: input.password,
      imageId: null,
    });
    expect(result).toEqual({ user: fakeUser, status: 201 });
  });
});
