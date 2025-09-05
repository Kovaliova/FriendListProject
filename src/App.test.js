import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store/store';
import UserList from './components/UserList';

describe('App entry point', () => {
  test('рендерит UserList внутри Provider и BrowserRouter', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <div className="app">
            <UserList />
          </div>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Загрузка.../i)).toBeInTheDocument();
  });
});