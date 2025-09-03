import React from 'react';

export default function UserCard({ user, onFollow, onToggleHidden, busy, onClick }) {
  return (
    <div className="user-card">
      <div className="user-info">
        <img src={user.image || user.avatar} alt={user.firstName || user.name} />
        <div>
          <div className="name">
            {user.firstName ? `${user.firstName} ${user.lastName}` : user.name}
          </div>
          <div className='age'>Age: {user.age !== undefined && `${user.age}`}</div>
          <div className="meta">{user.isFollowed ? 'Подписаны' : 'Не подписаны'}</div>
        </div>
      </div>
      <div className="user-actions">
        <button
          className="btn primary"
          onClick={() => onFollow(user.id)}
          disabled={busy}
        >
          <span>{user.isFollowed ? 'Отписаться' : 'Подписаться'}</span>
        </button>
        <button
          className="btn danger"
          onClick={() => onToggleHidden(user.id)}
        >
          <span>{user.isHidden ? 'Показать' : 'Скрыть'}</span>
        </button>
        <button
          className="btn success"
          onClick={() => onClick(user)}
        >
          <span>Подробнее</span>
        </button>
      </div>
    </div>
  );
}