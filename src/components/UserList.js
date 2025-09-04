import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUsers, toggleFollow, toggleHidden, setToast, setLoading } from '../store/actions';
import { fetchUsers, saveFollowToCloud } from '../api/users';
import Loader from './Loader';
import Pagination from './Pagination';
import UserCard from './UserCard';
import Toast from './Toast';
import { TransitionGroup, CSSTransition } from "react-transition-group";
import debounce from 'lodash.debounce';
import { FaTrash, FaEdit } from 'react-icons/fa';

export default function UserList() {
  const dispatch = useDispatch();
  const { users, limit, loading, toast } = useSelector(s => s);
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState('all');
  const [tabPage, setTabPage] = useState({ all: 1, followed: 1, hidden: 1 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ visible: false, type: '', userId: null });
  const [sortBy, setSortBy] = useState('name');
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, userId: null, commentIndex: null });
  const [editingComment, setEditingComment] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userComments');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const fixed = {};
        Object.keys(parsed).forEach(key => {
          fixed[key] = Array.isArray(parsed[key]) ? parsed[key] : [];
        });
        setComments(fixed);
      } catch {
        setComments({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userComments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    async function loadAll() {
      try {
        dispatch(setLoading(true));
        const { users: dataUsers } = await fetchUsers(1, 1000);
        const merged = dataUsers.map(u => ({
          ...u,
          isFollowed: false,
          isHidden: false,
          age: u.age ?? Math.floor(Math.random() * 50) + 18
        }));
        dispatch(setUsers(merged));
      } catch {
        dispatch(setToast('Ошибка загрузки списка'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    loadAll();
  }, []);

  function calculateAge(birthDate) {
    if (!birthDate) return undefined;
    const birth = new Date(birthDate);
    const diff = new Date() - birth;
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  useEffect(() => {
    if (!sending) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          dispatch(setToast('Данные отправлены (симуляция)'));
          setSending(false);
          return 0;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [sending]);

  function sendBulk() {
    setSending(true);
  }

  function onFollow(id) {
    dispatch(toggleFollow(id));
    const user = users.find(u => u.id === id);
    saveFollowToCloud({ id, followed: !user?.isFollowed })
      .then(() => dispatch(setToast(!user?.isFollowed ? 'Подписались' : 'Отписались')))
  }

  function onToggleHidden(id, confirmed = false) {
    const user = users.find(u => u.id === id);
    if (!confirmed) {
      showConfirm('hide', id);
      return;
    }
    dispatch(toggleHidden(id));
    dispatch(setToast(user?.isHidden ? 'Пользователь показан' : 'Пользователь скрыт'));
  }

  function showConfirm(type, userId) {
    setConfirmAction({ visible: true, type, userId });
  }

  function hideConfirm() {
    setConfirmAction({ visible: false, type: '', userId: null });
  }

  function confirmActionHandler() {
    if (!confirmAction.userId) return;
    if (confirmAction.type === 'follow') onFollow(confirmAction.userId);
    if (confirmAction.type === 'hide') onToggleHidden(confirmAction.userId, true);
    hideConfirm();
  }

  async function openUser(user) {
    try {
      setLoadingUser(true);
      setSelectedUser(null);
      const res = await fetch(`https://dummyjson.com/users/${user.id}`);
      const data = await res.json();
      data.age = data.age ?? (data.birthDate ? calculateAge(data.birthDate) : undefined);
      setSelectedUser(data);
      setCommentInput('');
      setEditingComment(null);
    } catch {
      dispatch(setToast('Ошибка загрузки данных пользователя'));
    } finally {
      setLoadingUser(false);
    }
  }

  function handleSaveCommentOrEdit() {
    if (!selectedUser || !commentInput.trim()) return;
    const now = new Date().toISOString();
    if (editingComment !== null) {
      setComments(prev => {
        const userComments = Array.isArray(prev[selectedUser.id]) ? [...prev[selectedUser.id]] : [];
        userComments[editingComment].text = commentInput;
        userComments[editingComment].date = now;
        return { ...prev, [selectedUser.id]: userComments };
      });
      setEditingComment(null);
    } else {
      setComments(prev => {
        const userComments = Array.isArray(prev[selectedUser.id]) ? [...prev[selectedUser.id]] : [];
        return { ...prev, [selectedUser.id]: [...userComments, { text: commentInput, date: now }] };
      });
    }
    setCommentInput('');
  }

  function handleDeleteComment(index) {
    if (!selectedUser) return;
    setDeleteConfirm({ visible: true, userId: selectedUser.id, commentIndex: index });
  }

  function confirmDeleteComment() {
    const { userId, commentIndex } = deleteConfirm;
    if (userId === null || commentIndex === null) return;
    setComments(prev => {
      const updated = [...prev[userId]];
      updated.splice(commentIndex, 1);
      return { ...prev, [userId]: updated };
    });
    setDeleteConfirm({ visible: false, userId: null, commentIndex: null });
  }

  function hideDeleteConfirm() {
    setDeleteConfirm({ visible: false, userId: null, commentIndex: null });
  }

  function closePopup() {
    setSelectedUser(null);
    setEditingComment(null);
    setCommentInput('');
  }

  function formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  const debouncedSetSearch = useCallback(debounce(value => setSearch(value), 300), []);

  const counts = useMemo(() => ({
    all: users.length,
    followed: users.filter(u => u.isFollowed).length,
    hidden: users.filter(u => u.isHidden).length
  }), [users]);

  const filtered = useMemo(() => {
    let list = users;
    if (tab === 'followed') list = users.filter(u => u.isFollowed);
    else if (tab === 'hidden') list = users.filter(u => u.isHidden);

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(u =>
        `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''}`.toLowerCase().includes(s)
      );
    }

    list = [...list];
    if (sortBy === 'name') list.sort((a, b) => ((a.firstName || a.name) > (b.firstName || b.name) ? 1 : -1));
    else if (sortBy === 'age') list.sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
    else if (sortBy === 'follow') list.sort((a, b) => (b.isFollowed - a.isFollowed));

    return list;
  }, [users, tab, search, sortBy]);

  const currentPage = tabPage[tab];
  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = (search.trim() || filtered.length <= limit)
    ? filtered
    : filtered.slice((currentPage - 1) * limit, currentPage * limit);

  function handleTabPageChange(newPage) {
    setTabPage(prev => ({ ...prev, [tab]: newPage }));
  }

  return (
    <React.Fragment>
      <div className="tabs">
        <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>Все ({counts.all})</button>
        <button className={tab === 'followed' ? 'active' : ''} onClick={() => setTab('followed')}>Подписанные ({counts.followed})</button>
        <button className={tab === 'hidden' ? 'active' : ''} onClick={() => setTab('hidden')}>Скрытые ({counts.hidden})</button>
      </div>

      <div className="toolbar">
        <div className="search">
          <input placeholder="Поиск по имени…" onChange={e => debouncedSetSearch(e.target.value)} />
        </div>
        <div className="sort">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Сортировать по имени</option>
            <option value="age">Сортировать по возрасту</option>
            <option value="follow">Сортировать по подпискам</option>
          </select>
        </div>
        <button className="btn muted" onClick={sendBulk}><span>Отправить данные</span></button>
      </div>

      {progress > 0 && <div className="progress"><div className="bar" style={{ width: `${progress}%` }} /></div>}

      {loading ? <Loader /> : (
        <div className="user-list">
          <TransitionGroup component={null}>
            {paginated.map(u => {
              const nodeRef = React.createRef();
              return (
                <CSSTransition key={u.id} timeout={500} classNames="fade" nodeRef={nodeRef}>
                  <div ref={nodeRef}>
                    <UserCard
                      user={u}
                      onFollow={() => showConfirm('follow', u.id)}
                      onToggleHidden={() => showConfirm('hide', u.id)}
                      onClick={openUser}
                    />
                  </div>
                </CSSTransition>
              );
            })}
          </TransitionGroup>
          {paginated.length === 0 && <p style={{ textAlign: 'center' }}>Нет пользователей</p>}
        </div>
      )}

      {totalPages > 1 && !search.trim() && (
        <Pagination page={currentPage} total={filtered.length} limit={limit} onPage={handleTabPageChange} />
      )}

      {selectedUser && (
        <div className="popup">
          <div className="popup-content">
            <button className="close" onClick={closePopup}>×</button>
            {loadingUser ? <Loader /> : (
              <div className="user-popup-card">
                <div className="user-header">
                  <img src={selectedUser.image || selectedUser.avatar} alt={selectedUser.firstName || selectedUser.name} />
                  <div>
                    <div className="name">{selectedUser.firstName ? `${selectedUser.firstName} ${selectedUser.lastName}` : selectedUser.name}</div>
                    <div className="meta">{selectedUser.isFollowed ? 'Подписаны' : 'Не подписаны'}</div>
                  </div>
                </div>

                <div className="user-details">
                  {['maidenName','age','gender','email','phone','username','password','birthDate','bloodGroup','height','weight','eyeColor'].map(key => (
                    selectedUser[key] !== undefined && <div key={key} className="detail"><strong>{formatLabel(key)}:</strong> <span>{selectedUser[key]}</span></div>
                  ))}
                </div>

                <div className="user-comment">
                  <textarea
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    placeholder="Оставьте комментарий..."
                  />
                  <button className="btn comment" onClick={handleSaveCommentOrEdit}>
                    <span>{editingComment !== null ? 'Сохранить' : 'Сохранить комментарий'}</span>
                  </button>
                </div>
                  {Array.isArray(comments[selectedUser.id]) && comments[selectedUser.id].length > 0 && (
                    <div className="saved-comment">
                      <strong>Комментарии:</strong>
                      {[...comments[selectedUser.id]]
                        .sort((a,b) => new Date(b.date) - new Date(a.date))
                        .map((c, i) => (
                        <div key={i} className="comment-item">
                          <div className="comment-text">{c.text}</div>
                          <div className="comment-meta">{new Date(c.date).toLocaleString()}</div>
                          <div className="comment-actions">
                              <button className="btn-icon edit" title="Редактировать" onClick={() => {
                                  setCommentInput(c.text);
                                  setEditingComment(i);
                              }}>
                                <FaEdit />
                              </button>
                              <button className="btn-icon delete" title="Удалить" onClick={() => handleDeleteComment(i)}>
                                  <FaTrash />
                              </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm.visible && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Точно хотите удалить этот комментарий?</p>
            <div className="modal-buttons">
              <button className="btn confirm" onClick={confirmDeleteComment}><span>Да</span></button>
              <button className="btn cancel" onClick={hideDeleteConfirm}><span>Нет</span></button>
            </div>
          </div>
        </div>
      )}

      {confirmAction.visible && (
        <div className="modal-overlay">
          <div className="modal">
            <p>{confirmAction.type === 'follow' ? 'Вы уверены, что хотите подписаться/отписаться?' : 'Вы уверены, что хотите скрыть/показать пользователя?'}</p>
            <div className="modal-buttons">
              <button className="btn confirm" onClick={confirmActionHandler}><span>Да</span></button>
              <button className="btn cancel" onClick={hideConfirm}><span>Нет</span></button>
            </div>
          </div>
        </div>
      )}

      <Toast text={toast} onHide={() => dispatch(setToast(''))} />
    </React.Fragment>
  );
}