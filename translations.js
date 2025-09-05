// ===================== Çok Dilli Destek - Lokasyona Göre Dil Değişimi =====================

const translations = {
  // Türkçe (varsayılan)
  'TR': {
    // Menü
    'menu': 'Menü',
    'login': 'Giriş',
    'logout': 'Çıkış',
    'profile': 'Profil Düzenle',
    'feedback': 'Öneri',
    'location': 'Lokasyon',
    'sponsor': 'Sponsor',
    'donate': '☕ Kahve İkram Et',
    
    // Kanallar
    'sponsorChannels': 'Sponsorlu Kanallar',
    'generalChannels': 'Genel Kanallar',
    'favoriteChannels': 'Favori Kanallarım',
    'users': 'Kullanıcılar',
    'following': 'Takip Edilenler',
    
    // Kanal başlıkları
    'sponsorChannelsTitle': '💰 Sponsor Kanallar',
    'generalChannelsTitle': '🌐 Genel Kanallar',
    'favoriteCitiesTitle': '🏙️ Favori Şehirler',
    
    'loginTitle': 'Giriş / Kayıt',
    'profileTitle': 'Profil Düzenle',
    'locationTitle': 'Lokasyon Ayarla',
    'sponsorTitle': 'Sponsor Kanal Oluştur',
    'channelTitle': 'Yeni Kanal Oluştur',
    'hobbiesTitle': 'İlgi Alanları',
    
    'email': 'Email veya Telefon',
    'password': 'Şifre',
    'firstName': 'Ad',
    'lastName': 'Soyad',
    'gender': 'Cinsiyet',
    'birth': 'Doğum Tarihi',
    'country': 'Ülke',
    'city': 'Şehir',
    'channelName': 'Kanal adı',
    'channelDescription': 'Kanal açıklaması',
    'channelType': 'Kanal türü',
    'public': 'Genel',
    'private': 'Özel',
    'password': 'Şifre',
    'createChannel': 'Kanal Oluştur',
    'loginBtn': 'Giriş',
    'registerBtn': 'Kayıt',
    'rememberMe': 'Beni Hatırla',
    'saveBtn': 'Kaydet',
    'cancelBtn': 'İptal',
    'closeBtn': 'Kapat',
    
    // Status
    'anonymous': 'Anonim',
    'loggedIn': 'Giriş yapıldı',
    'typing': 'yazıyor...',
    
    // Time
    'now': 'şimdi',
    'today': 'bugün',
    'yesterday': 'dün'
  },
  
  // İngilizce
  'US': {
    'menu': 'Menu',
    'login': 'Login',
    'logout': 'Logout',
    'profile': 'Edit Profile',
    'feedback': 'Feedback',
    'location': 'Location',
    'sponsor': 'Sponsor',
    'donate': '☕ Buy me a coffee',
    
    'sponsorChannels': 'Sponsored Channels',
    'generalChannels': 'General Channels',
    'favoriteChannels': 'My Favorite Channels',
    'users': 'Users',
    'following': 'Following',
    
    // Kanal başlıkları
    'sponsorChannelsTitle': '💰 Sponsor Channels',
    'generalChannelsTitle': '🌐 General Channels',
    'favoriteCitiesTitle': '🏙️ Favorite Cities',
    
    'loginTitle': 'Login / Register',
    'profileTitle': 'Edit Profile',
    'locationTitle': 'Set Location',
    'sponsorTitle': 'Create Sponsor Channel',
    'channelTitle': 'Create New Channel',
    'hobbiesTitle': 'Interests',
    
    'email': 'Email or Phone',
    'password': 'Password',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'gender': 'Gender',
    'birth': 'Birth Date',
    'country': 'Country',
    'city': 'City',
    'channelName': 'Channel name',
    'channelDescription': 'Channel description',
    'channelType': 'Channel type',
    'public': 'Public',
    'private': 'Private',
    'password': 'Password',
    'createChannel': 'Create Channel',
    'loginBtn': 'Login',
    'registerBtn': 'Register',
    'rememberMe': 'Remember Me',
    'saveBtn': 'Save',
    'cancelBtn': 'Cancel',
    'closeBtn': 'Close',
    
    // Status
    'anonymous': 'Anonymous',
    'loggedIn': 'Logged in',
    'typing': 'typing...',
    
    // Time
    'now': 'now',
    'today': 'today',
    'yesterday': 'yesterday'
  },
  
  // Fransızca
  'FR': {
    'menu': 'Menu',
    'login': 'Connexion',
    'logout': 'Déconnexion',
    'profile': 'Modifier le profil',
    'feedback': 'Commentaires',
    'location': 'Localisation',
    'sponsor': 'Sponsor',
    'donate': '☕ Offrez-moi un café',
    
    'sponsorChannels': 'Canaux sponsorisés',
    'generalChannels': 'Canaux généraux',
    'favoriteChannels': 'Mes canaux favoris',
    'users': 'Utilisateurs',
    'following': 'Abonnements',
    
    'sponsorChannelsTitle': '💰 Canaux sponsorisés',
    'generalChannelsTitle': '🌐 Canaux généraux',
    'favoriteCitiesTitle': '🏙️ Villes favorites',
    
    'loginTitle': 'Connexion / Inscription',
    'profileTitle': 'Modifier le profil',
    'locationTitle': 'Définir la localisation',
    'sponsorTitle': 'Créer un canal sponsorisé',
    'channelTitle': 'Créer un nouveau canal',
    'hobbiesTitle': 'Centres d\'intérêt',
    
    'email': 'Email ou téléphone',
    'password': 'Mot de passe',
    'firstName': 'Prénom',
    'lastName': 'Nom de famille',
    'gender': 'Sexe',
    'birth': 'Date de naissance',
    'country': 'Pays',
    'city': 'Ville',
    'channelName': 'Nom du canal',
    'channelDescription': 'Description du canal',
    'channelType': 'Type de canal',
    'public': 'Public',
    'private': 'Privé',
    'createChannel': 'Créer le canal',
    'loginBtn': 'Connexion',
    'registerBtn': 'Inscription',
    'rememberMe': 'Se souvenir de moi',
    'saveBtn': 'Enregistrer',
    'cancelBtn': 'Annuler',
    'closeBtn': 'Fermer',
    
    'anonymous': 'Anonyme',
    'loggedIn': 'Connecté',
    'typing': 'en train d\'écrire...',
    
    'now': 'maintenant',
    'today': 'aujourd\'hui',
    'yesterday': 'hier'
  },
  
  // Almanca
  'DE': {
    'menu': 'Menü',
    'login': 'Anmelden',
    'logout': 'Abmelden',
    'profile': 'Profil bearbeiten',
    'feedback': 'Feedback',
    'location': 'Standort',
    'sponsor': 'Sponsor',
    'donate': '☕ Kaffee spenden',
    
    'sponsorChannels': 'Gesponserte Kanäle',
    'generalChannels': 'Allgemeine Kanäle',
    'favoriteChannels': 'Meine Lieblingskanäle',
    'users': 'Benutzer',
    'following': 'Folgen',
    
    'sponsorChannelsTitle': '💰 Gesponserte Kanäle',
    'generalChannelsTitle': '🌐 Allgemeine Kanäle',
    'favoriteCitiesTitle': '🏙️ Lieblingsstädte',
    
    'loginTitle': 'Anmelden / Registrieren',
    'profileTitle': 'Profil bearbeiten',
    'locationTitle': 'Standort festlegen',
    'sponsorTitle': 'Gesponserten Kanal erstellen',
    'channelTitle': 'Neuen Kanal erstellen',
    'hobbiesTitle': 'Interessen',
    
    'email': 'E-Mail oder Telefon',
    'password': 'Passwort',
    'firstName': 'Vorname',
    'lastName': 'Nachname',
    'gender': 'Geschlecht',
    'birth': 'Geburtsdatum',
    'country': 'Land',
    'city': 'Stadt',
    'channelName': 'Kanalname',
    'channelDescription': 'Kanalbeschreibung',
    'channelType': 'Kanaltyp',
    'public': 'Öffentlich',
    'private': 'Privat',
    'createChannel': 'Kanal erstellen',
    'loginBtn': 'Anmelden',
    'registerBtn': 'Registrieren',
    'rememberMe': 'Angemeldet bleiben',
    'saveBtn': 'Speichern',
    'cancelBtn': 'Abbrechen',
    'closeBtn': 'Schließen',
    
    'anonymous': 'Anonym',
    'loggedIn': 'Angemeldet',
    'typing': 'tippt...',
    
    'now': 'jetzt',
    'today': 'heute',
    'yesterday': 'gestern'
  },
  
  // İspanyolca (Arjantin, Meksika, İspanya)
  'ES': {
    'menu': 'Menú',
    'login': 'Iniciar sesión',
    'logout': 'Cerrar sesión',
    'profile': 'Editar perfil',
    'feedback': 'Comentarios',
    'location': 'Ubicación',
    'sponsor': 'Patrocinador',
    'donate': '☕ Invítame un café',
    
    'sponsorChannels': 'Canales patrocinados',
    'generalChannels': 'Canales generales',
    'favoriteChannels': 'Mis canales favoritos',
    'users': 'Usuarios',
    'following': 'Siguiendo',
    
    'sponsorChannelsTitle': '💰 Canales patrocinados',
    'generalChannelsTitle': '🌐 Canales generales',
    'favoriteCitiesTitle': '🏙️ Ciudades favoritas',
    
    'loginTitle': 'Iniciar sesión / Registrarse',
    'profileTitle': 'Editar perfil',
    'locationTitle': 'Establecer ubicación',
    'sponsorTitle': 'Crear canal patrocinado',
    'channelTitle': 'Crear nuevo canal',
    'hobbiesTitle': 'Intereses',
    
    'email': 'Email o teléfono',
    'password': 'Contraseña',
    'firstName': 'Nombre',
    'lastName': 'Apellido',
    'gender': 'Género',
    'birth': 'Fecha de nacimiento',
    'country': 'País',
    'city': 'Ciudad',
    'channelName': 'Nombre del canal',
    'channelDescription': 'Descripción del canal',
    'channelType': 'Tipo de canal',
    'public': 'Público',
    'private': 'Privado',
    'createChannel': 'Crear canal',
    'loginBtn': 'Iniciar sesión',
    'registerBtn': 'Registrarse',
    'rememberMe': 'Recordarme',
    'saveBtn': 'Guardar',
    'cancelBtn': 'Cancelar',
    'closeBtn': 'Cerrar',
    
    'anonymous': 'Anónimo',
    'loggedIn': 'Conectado',
    'typing': 'escribiendo...',
    
    'now': 'ahora',
    'today': 'hoy',
    'yesterday': 'ayer'
  },
  
  // Japonca
  'JP': {
    'menu': 'メニュー',
    'login': 'ログイン',
    'logout': 'ログアウト',
    'profile': 'プロフィール編集',
    'feedback': 'フィードバック',
    'location': '場所',
    'sponsor': 'スポンサー',
    'donate': '☕ コーヒーをおごる',
    
    'sponsorChannels': 'スポンサーチャンネル',
    'generalChannels': '一般チャンネル',
    'favoriteChannels': 'お気に入りチャンネル',
    'users': 'ユーザー',
    'following': 'フォロー中',
    
    'sponsorChannelsTitle': '💰 スポンサーチャンネル',
    'generalChannelsTitle': '🌐 一般チャンネル',
    'favoriteCitiesTitle': '🏙️ お気に入りの都市',
    
    'loginTitle': 'ログイン / 登録',
    'profileTitle': 'プロフィール編集',
    'locationTitle': '場所を設定',
    'sponsorTitle': 'スポンサーチャンネル作成',
    'channelTitle': '新しいチャンネル作成',
    'hobbiesTitle': '興味',
    
    'email': 'メールまたは電話',
    'password': 'パスワード',
    'firstName': '名',
    'lastName': '姓',
    'gender': '性別',
    'birth': '生年月日',
    'country': '国',
    'city': '都市',
    'channelName': 'チャンネル名',
    'channelDescription': 'チャンネル説明',
    'channelType': 'チャンネルタイプ',
    'public': '公開',
    'private': '非公開',
    'createChannel': 'チャンネル作成',
    'loginBtn': 'ログイン',
    'registerBtn': '登録',
    'rememberMe': 'ログイン状態を保持',
    'saveBtn': '保存',
    'cancelBtn': 'キャンセル',
    'closeBtn': '閉じる',
    
    'anonymous': '匿名',
    'loggedIn': 'ログイン済み',
    'typing': '入力中...',
    
    'now': '今',
    'today': '今日',
    'yesterday': '昨日'
  },
  
  // Korece
  'KR': {
    'menu': '메뉴',
    'login': '로그인',
    'logout': '로그아웃',
    'profile': '프로필 편집',
    'feedback': '피드백',
    'location': '위치',
    'sponsor': '스폰서',
    'donate': '☕ 커피 사주기',
    
    'sponsorChannels': '스폰서 채널',
    'generalChannels': '일반 채널',
    'favoriteChannels': '즐겨찾기 채널',
    'users': '사용자',
    'following': '팔로잉',
    
    'sponsorChannelsTitle': '💰 스폰서 채널',
    'generalChannelsTitle': '🌐 일반 채널',
    'favoriteCitiesTitle': '🏙️ 즐겨찾기 도시',
    
    'loginTitle': '로그인 / 회원가입',
    'profileTitle': '프로필 편집',
    'locationTitle': '위치 설정',
    'sponsorTitle': '스폰서 채널 생성',
    'channelTitle': '새 채널 생성',
    'hobbiesTitle': '관심사',
    
    'email': '이메일 또는 전화번호',
    'password': '비밀번호',
    'firstName': '이름',
    'lastName': '성',
    'gender': '성별',
    'birth': '생년월일',
    'country': '국가',
    'city': '도시',
    'channelName': '채널명',
    'channelDescription': '채널 설명',
    'channelType': '채널 유형',
    'public': '공개',
    'private': '비공개',
    'createChannel': '채널 생성',
    'loginBtn': '로그인',
    'registerBtn': '회원가입',
    'rememberMe': '로그인 상태 유지',
    'saveBtn': '저장',
    'cancelBtn': '취소',
    'closeBtn': '닫기',
    
    'anonymous': '익명',
    'loggedIn': '로그인됨',
    'typing': '입력 중...',
    
    'now': '지금',
    'today': '오늘',
    'yesterday': '어제'
  },
  
  // Çince
  'CN': {
    'menu': '菜单',
    'login': '登录',
    'logout': '登出',
    'profile': '编辑资料',
    'feedback': '反馈',
    'location': '位置',
    'sponsor': '赞助商',
    'donate': '☕ 请我喝咖啡',
    
    'sponsorChannels': '赞助频道',
    'generalChannels': '普通频道',
    'favoriteChannels': '收藏频道',
    'users': '用户',
    'following': '关注中',
    
    'sponsorChannelsTitle': '💰 赞助频道',
    'generalChannelsTitle': '🌐 普通频道',
    'favoriteCitiesTitle': '🏙️ 收藏城市',
    
    'loginTitle': '登录 / 注册',
    'profileTitle': '编辑资料',
    'locationTitle': '设置位置',
    'sponsorTitle': '创建赞助频道',
    'channelTitle': '创建新频道',
    'hobbiesTitle': '兴趣爱好',
    
    'email': '邮箱或电话',
    'password': '密码',
    'firstName': '名',
    'lastName': '姓',
    'gender': '性别',
    'birth': '出生日期',
    'country': '国家',
    'city': '城市',
    'channelName': '频道名称',
    'channelDescription': '频道描述',
    'channelType': '频道类型',
    'public': '公开',
    'private': '私密',
    'createChannel': '创建频道',
    'loginBtn': '登录',
    'registerBtn': '注册',
    'rememberMe': '记住我',
    'saveBtn': '保存',
    'cancelBtn': '取消',
    'closeBtn': '关闭',
    
    'anonymous': '匿名',
    'loggedIn': '已登录',
    'typing': '正在输入...',
    
    'now': '现在',
    'today': '今天',
    'yesterday': '昨天'
  }
};

// Dil değiştirme fonksiyonu
function changeLanguage(countryCode) {
  const lang = translations[countryCode] || translations['TR'];
  
  // Tüm data-translate attribute'larına sahip elementleri bul ve güncelle
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (lang[key]) {
      element.textContent = lang[key];
    }
  });
  
  // Placeholder'ları güncelle
  document.querySelectorAll('[data-placeholder]').forEach(element => {
    const key = element.getAttribute('data-placeholder');
    if (lang[key]) {
      element.placeholder = lang[key];
    }
  });
  
  // Title'ları güncelle
  document.querySelectorAll('[data-title]').forEach(element => {
    const key = element.getAttribute('data-title');
    if (lang[key]) {
      element.title = lang[key];
    }
  });
  
  // Dil kodunu localStorage'a kaydet
  localStorage.setItem('selectedLanguage', countryCode);
  
  console.log(`🌍 Dil değiştirildi: ${countryCode}`);
}

// Sayfa yüklendiğinde dil ayarını yükle
function loadLanguage() {
  const savedLanguage = localStorage.getItem('selectedLanguage');
  const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
  
  // Önce kaydedilmiş dil varsa onu kullan
  if (savedLanguage && translations[savedLanguage]) {
    changeLanguage(savedLanguage);
    return;
  }
  
  // Yoksa kullanıcının lokasyonuna göre dil belirle
  if (userLocation.country && translations[userLocation.country]) {
    changeLanguage(userLocation.country);
  } else {
    // Varsayılan olarak Türkçe
    changeLanguage('TR');
  }
}

// Lokasyon değiştiğinde dil değiştir
function onLocationChange(countryCode) {
  console.log('🌍 onLocationChange çağrıldı:', countryCode);
  console.log('🌍 Mevcut translations anahtarları:', Object.keys(translations));
  
  if (translations[countryCode]) {
    console.log('✅ Dil değiştiriliyor:', countryCode);
    changeLanguage(countryCode);
  } else {
    console.log('❌ Dil bulunamadı:', countryCode);
    console.log('🔄 Varsayılan dil (TR) kullanılıyor');
    changeLanguage('TR');
  }
}

// Global olarak erişilebilir yap
window.changeLanguage = changeLanguage;
window.loadLanguage = loadLanguage;
window.onLocationChange = onLocationChange;