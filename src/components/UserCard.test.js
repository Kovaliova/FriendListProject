import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from './UserCard';

describe('UserCard', () => {
  const user = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    age: 30,
    image: 'avatar.jpg',
    isFollowed: false,
    isHidden: false,
  };

  test('рендерит информацию о пользователе', () => {
    render(
      <UserCard
        user={user}
        onFollow={() => {}}
        onToggleHidden={() => {}}
        onClick={() => {}}
        busy={false}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Age: 30')).toBeInTheDocument();
    expect(screen.getByText('Не подписаны')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'avatar.jpg');
  });

  test('кнопка подписки показывает "Подписаться" и вызывает onFollow', () => {
    const onFollow = jest.fn();
    render(
      <UserCard user={user} onFollow={onFollow} onToggleHidden={() => {}} onClick={() => {}} busy={false} />
    );

    const followBtn = screen.getByText('Подписаться');
    expect(followBtn).toBeInTheDocument();

    fireEvent.click(followBtn);
    expect(onFollow).toHaveBeenCalledWith(user.id);
  });

  test('кнопка подписки дизейблится если busy=true', () => {
    render(
      <UserCard user={user} onFollow={() => {}} onToggleHidden={() => {}} onClick={() => {}} busy={true} />
    );

    const followBtn = screen.getByText('Подписаться').closest('button');
    expect(followBtn).toBeDisabled();
  });

  test('кнопка скрытия/показа вызывает onToggleHidden', () => {
    const onToggleHidden = jest.fn();
    render(
      <UserCard user={user} onFollow={() => {}} onToggleHidden={onToggleHidden} onClick={() => {}} busy={false} />
    );

    const toggleBtn = screen.getByText('Скрыть');
    fireEvent.click(toggleBtn);
    expect(onToggleHidden).toHaveBeenCalledWith(user.id);
  });

  test('кнопка "Подробнее" вызывает onClick с пользователем', () => {
    const onClick = jest.fn();
    render(
      <UserCard user={user} onFollow={() => {}} onToggleHidden={() => {}} onClick={onClick} busy={false} />
    );

    const detailsBtn = screen.getByText('Подробнее');
    fireEvent.click(detailsBtn);
    expect(onClick).toHaveBeenCalledWith(user);
  });

  test('отображает корректный текст кнопок при isFollowed и isHidden', () => {
    const followedUser = { ...user, isFollowed: true, isHidden: true };
    render(
      <UserCard user={followedUser} onFollow={() => {}} onToggleHidden={() => {}} onClick={() => {}} busy={false} />
    );

    expect(screen.getByText('Отписаться')).toBeInTheDocument();
    expect(screen.getByText('Показать')).toBeInTheDocument();
  });
});