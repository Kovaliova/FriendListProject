import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import UserList from './components/UserList';
import './styles.css';

const container = document.getElementById('root') || (() => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  return root;
})();

const root = createRoot(container);
root.render(
  <Provider store={store}>
    <div className="app">
      <h1>Friend List</h1>
      <UserList />
    </div>
  </Provider>
);