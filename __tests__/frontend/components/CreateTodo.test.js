// __tests__/frontend/components/CreateTodo.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import CreateTodoPage from '../../../app/components/CreateTodo/CreateTodo';
import TodoContext from '../../../app/context/TodoContext';

// Mock next/router
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe('CreateTodoPage', () => {
  const mockCreateTodo = jest.fn();

  const renderComponent = () =>
    render(
      <TodoContext.Provider value={{ createTodo: mockCreateTodo }}>
        <CreateTodoPage />
      </TodoContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields and buttons', () => {
    renderComponent();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload File/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  it('calls router.back when Back button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText(/Back/i));
    expect(mockBack).toHaveBeenCalled();
  });

  it('calls createTodo when Save button is clicked with title', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Todo' },
    });
    fireEvent.click(screen.getByText(/Save/i));

    // createTodo is async, so wrap in act
    expect(mockCreateTodo).toHaveBeenCalled();
  });

  it('does not call createTodo if title is empty', () => {
    renderComponent();
    fireEvent.click(screen.getByText(/Save/i));
    expect(mockCreateTodo).not.toHaveBeenCalled();
  });
});
