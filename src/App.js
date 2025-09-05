import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import store from './store/store';
import UserList from './components/UserList';
import './styles.css';

function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
       <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>Главная</Link>
       <Link to="/all" className={`sidebar-link ${location.pathname === '/all' ? 'active' : ''}`}>Топ 60</Link>
    </div>
  );
}

const container = document.getElementById('root') || (() => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  return root;
})();

const root = createRoot(container);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <div className="app">
        <h1>Friend List</h1>
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<UserList showAll={false} />} />
            <Route path="/all" element={<UserList showAll={true} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </Provider>
);