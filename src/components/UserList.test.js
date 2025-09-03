import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserList from './UserList';
import * as api from '../api/users';

// Моки зависимостей
jest.mock('../api/users', () => ({
  fetchUsers: jest.fn(),
  saveFollowToCloud: jest.fn(() => Promise.resolve()),
}));
jest.mock('./Loader', () => () => <div>Loader</div>);
jest.mock('./Pagination', () => ({ page }) => <div data-testid="pagination">Pagination {page}</div>);
jest.mock('./UserCard', () => ({ user, onFollow, onToggleHidden, busy, onClick }) => (
  <div data-testid={`user-${user.id}`}>
    <span>{user.name || `${user.firstName} ${user.lastName}`}</span>
    <button onClick={() => onFollow(user.id)}>Follow</button>
    <button onClick={() => onToggleHidden(user.id)}>Hide</button>
    <button onClick={() => onClick(user)}>Details</button>
  </div>
));
jest.mock('./Toast', () => ({ text }) => <div data-testid="toast">{text}</div>);

// Мокаем react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe('UserList', () => {
  const dispatchMock = jest.fn();
  const useSelectorMock = require('react-redux').useSelector;
  const useDispatchMock = require('react-redux').useDispatch;

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatchMock.mockReturnValue(dispatchMock);
    useSelectorMock.mockReturnValue({
      users: [],
      limit: 10,
      loading: false,
      toast: '',
    });
  });

  test('рендерит Loader при загрузке', async () => {
    api.fetchUsers.mockResolvedValue({ users: [] });

    useSelectorMock.mockReturnValueOnce({
        users: [],
        limit: 10,
        loading: true,
        toast: '',
    });

    render(<UserList />);

    expect(screen.getByText('Loader')).toBeInTheDocument();

    await waitFor(() => expect(api.fetchUsers).toHaveBeenCalled());
  });

  test('отображает пользователей из Redux', () => {
    useSelectorMock.mockReturnValue({
      users: [
        { id: 1, firstName: 'John', lastName: 'Doe', age: 25, isFollowed: false, isHidden: false },
      ],
      limit: 10,
      loading: false,
      toast: '',
    });

    render(<UserList />);

    expect(screen.getByTestId('user-1')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('кнопки Follow и Hide открывают модалку подтверждения', () => {
    const user = { id: 1, firstName: 'John', lastName: 'Doe', age: 25, isFollowed: false, isHidden: false };
    useSelectorMock.mockReturnValue({ users: [user], limit: 10, loading: false, toast: '' });

    render(<UserList />);

    fireEvent.click(screen.getByText('Follow'));
    expect(screen.getByText(/Вы уверены, что хотите подписаться/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide'));
    expect(screen.getByText(/Вы уверены, что хотите скрыть/)).toBeInTheDocument();
  });

  test('Pagination отображается, если пользователей больше лимита', () => {
    const users = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `User${i + 1}`, isFollowed: false, isHidden: false }));
    useSelectorMock.mockReturnValue({ users, limit: 10, loading: false, toast: '' });

    render(<UserList />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toHaveTextContent('Pagination 1');
  });
});