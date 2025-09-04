const API_LIST = 'https://dummyjson.com/users';

const LOCAL_FOLLOWS_KEY = 'mini-social-follows';

export async function fetchUsers(page = 1, limit = 8) {
  const skip = (page - 1) * limit;
  const res = await fetch(`${API_LIST}?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error('Failed to load users');
  const json = await res.json();

  const persisted = JSON.parse(localStorage.getItem(LOCAL_FOLLOWS_KEY) || '{}');

  const users = (json.users || []).map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    avatar: u.image,
    isFollowed: !!persisted[u.id]
  }));

  return { users, total: json.total || users.length };
}

export async function saveFollowToCloud(payload) {
  const persisted = JSON.parse(localStorage.getItem(LOCAL_FOLLOWS_KEY) || '{}');
  persisted[payload.id] = payload.followed;
  localStorage.setItem(LOCAL_FOLLOWS_KEY, JSON.stringify(persisted));

  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 200));
}

export function sendBulkWithProgress(bigObject, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://httpbin.org/post', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else reject(new Error('Bulk request failed'));
    };
    xhr.onerror = () => reject(new Error('Network error'));

    xhr.send(JSON.stringify(bigObject));
  });
}