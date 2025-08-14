import { Writable } from 'stream';

import User from '../../../../models/user'; // adjust path as needed
import Todo from '../../../../models/todo';
import {
  findUserByEmail,
  addTodoToUser,
  getTodosByUser,
} from '../../../../services/api/todo'; // adjust path as needed
import * as todoService from '../../../../services/api/todo';

jest.mock('../../../../models/user');
jest.mock('../../../../models/todo', () => {
  const mockQuery = {
    sort: jest.fn().mockReturnThis(),
    collation: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn(),
  };
  return {
    find: jest.fn(() => mockQuery),
    countDocuments: jest.fn(),
  };
});

describe('findUserByEmail', () => {
  it('should call User.findOne with correct email and select _id and todos', async () => {
    const mockSelect = jest.fn().mockResolvedValue({ _id: '123', todos: [] });
    User.findOne.mockReturnValue({ select: mockSelect });

    const email = 'test@example.com';
    const result = await findUserByEmail(email);

    expect(User.findOne).toHaveBeenCalledWith({ email });
    expect(mockSelect).toHaveBeenCalledWith('_id todos');
    expect(result).toEqual({ _id: '123', todos: [] });
  });
});

describe('addTodoToUser', () => {
  it('should push todoId to user.todos and save the user', async () => {
    const user = {
      todos: [],
      save: jest.fn().mockResolvedValue(true),
    };
    const todoId = 'todo123';

    await addTodoToUser(user, todoId);

    expect(user.todos).toContain(todoId);
    expect(user.save).toHaveBeenCalled();
  });
});

describe('getTodosByUser', () => {
  const mockTodos = [{ _id: '1', title: 'Test Todo' }];
  const mockCount = 1;

  beforeEach(() => {
    const mockChain = {
      sort: jest.fn().mockReturnThis(),
      collation: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockTodos),
    };

    Todo.find.mockReturnValue(mockChain);
    Todo.countDocuments.mockResolvedValue(mockCount);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply filters, pagination, and sorting correctly', async () => {
    const filters = {
      search: 'Test',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      completed: 'true',
      fav: 'false',
    };
    const pagination = { page: 2, limit: 10 };
    const sortConfig = { sortBy: 'title', sortOrder: 'asc' };

    const result = await getTodosByUser(
      'userId',
      filters,
      pagination,
      sortConfig
    );

    expect(Todo.find).toHaveBeenCalledWith({
      userId: 'userId',
      title: { $regex: 'Test', $options: 'i' },
      createdAt: {
        $gte: new Date('2023-01-01'),
        $lte: new Date('2023-12-31'),
      },
      completed: true,
      fav: false,
    });

    const mockChain = Todo.find.mock.results[0].value;
    expect(mockChain.sort).toHaveBeenCalledWith({ title: 1 });
    expect(mockChain.collation).toHaveBeenCalledWith({
      locale: 'en',
      strength: 2,
    });
    expect(mockChain.skip).toHaveBeenCalledWith(10); // (page 2 -1) * limit 10
    expect(mockChain.limit).toHaveBeenCalledWith(10);

    expect(Todo.countDocuments).toHaveBeenCalledWith({
      userId: 'userId',
      title: { $regex: 'Test', $options: 'i' },
      createdAt: {
        $gte: new Date('2023-01-01'),
        $lte: new Date('2023-12-31'),
      },
      completed: true,
      fav: false,
    });

    expect(result.todos).toEqual(mockTodos);
    expect(result.total).toBe(mockCount);
    expect(result.totalPages).toBe(Math.ceil(mockCount / 10));
  });
});
