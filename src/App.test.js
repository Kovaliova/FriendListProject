import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from './store/store';
import UserList from './components/UserList';

describe('App entry point', () => {
  test('рендерит UserList внутри Provider', () => {
    render(
      <Provider store={store}>
        <div className="app">
          <UserList />
        </div>
      </Provider>
    );

    expect(screen.getByText(/Загрузка.../i)).toBeInTheDocument();
  });
});