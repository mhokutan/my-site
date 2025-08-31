function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('profile') || '{}');
  } catch (e) {
    return {};
  }
}

function saveProfile(data) {
  localStorage.setItem('profile', JSON.stringify(data));
}

function getOrCreateNickname() {
  const data = getProfile();
  if (!data.nickname) {
    data.nickname = 'user-' + Math.random().toString(36).substring(2, 8);
    saveProfile(data);
  }
  return data.nickname;
}

window.getProfile = getProfile;
window.saveProfile = saveProfile;
window.getOrCreateNickname = getOrCreateNickname;
