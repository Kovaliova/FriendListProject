import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserList from './UserList';
import * as api from '../api/users';
import { useSelector, useDispatch } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../api/users', () => ({
  fetchUsers: jest.fn(),
  saveFollowToCloud: jest.fn(() => Promise.resolve()),
}));

jest.mock('./Loader', () => () => <div>Loader</div>);
jest.mock('./Pagination', () => ({ page }) => <div data-testid="pagination">Pagination {page}</div>);
jest.mock('./UserCard', () => ({ user, onFollow, onToggleHidden, onClick }) => (
  <div data-testid={`user-${user.id}`}>
    <span>{user.name || `${user.firstName} ${user.lastName}`}</span>
    <button onClick={() => onFollow(user.id)}>Follow</button>
    <button onClick={() => onToggleHidden(user.id)}>Hide</button>
    <button onClick={() => onClick(user)}>Details</button>
  </div>
));
jest.mock('./Toast', () => ({ text }) => <div data-testid="toast">{text}</div>);

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe('UserList', () => {
  const dispatchMock = jest.fn();
  const useSelectorMock = useSelector;
  const useDispatchMock = useDispatch;

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
    useSelectorMock.mockReturnValueOnce({
      users: [],
      limit: 10,
      loading: true,
      toast: '',
    });

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    expect(screen.getByText('Loader')).toBeInTheDocument();
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

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-1')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('показывает 60 пользователей на вкладке /all', async () => {
    const users = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `User${i + 1}`, isFollowed: false, isHidden: false }));
    useSelectorMock.mockReturnValue({ users, limit: 10, loading: false, toast: '' });

    render(
      <MemoryRouter initialEntries={['/all']}>
        <UserList />
      </MemoryRouter>
    );

    for (let i = 1; i <= 60; i++) {
      expect(await screen.findByText(`User${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByText('User61')).not.toBeInTheDocument();
  });

    test('поиск фильтрует пользователей', async () => {
    const users = [
      { id: 1, firstName: 'John', lastName: 'Doe', isFollowed: false, isHidden: false },
      { id: 2, firstName: 'Jane', lastName: 'Smith', isFollowed: false, isHidden: false },
    ];
    useSelectorMock.mockReturnValue({ users, limit: 10, loading: false, toast: '' });

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Поиск по имени…');
    fireEvent.change(input, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  test('кнопки Follow и Hide вызывают модалку подтверждения', () => {
    const users = [
      { id: 1, firstName: 'John', lastName: 'Doe', isFollowed: false, isHidden: false },
    ];
    useSelectorMock.mockReturnValue({ users, limit: 10, loading: false, toast: '' });

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Follow'));
    expect(screen.getByText(/Подписаться\/Отписаться\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide'));
    expect(screen.getByText(/Скрыть\/Показать\?/i)).toBeInTheDocument();
  });

  test('Pagination отображается если пользователей больше лимита', () => {
    const users = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `User${i + 1}`, isFollowed: false, isHidden: false }));
    useSelectorMock.mockReturnValue({ users, limit: 10, loading: false, toast: '' });

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});