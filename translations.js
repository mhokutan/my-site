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
    'following': 'Takip Ettiklerim',
    
    // Kanal başlıkları
    'sponsorChannelsTitle': '💰 Sponsor Kanallar',
    'generalChannelsTitle': '🌐 Genel Kanallar',
    'favoriteCitiesTitle': '🏙️ Favori Şehirler',
    
    // Modals
    'loginTitle': 'Giriş / Kayıt',
    'profileTitle': 'Profil Düzenle',
    'locationTitle': 'Lokasyon Ayarla',
    'sponsorTitle': 'Sponsor Kanal Oluştur',
    'channelTitle': 'Yeni Kanal Oluştur',
    'hobbiesTitle': 'İlgi Alanları',
    
    // Form fields
    'email': 'Email veya Telefon',
    'password': 'Şifre',
    'firstName': 'İsim',
    'lastName': 'Soyisim',
    'gender': 'Cinsiyet',
    'birth': 'Doğum Tarihi',
    'country': 'Ülke',
    'city': 'Şehir',
    'channelName': 'Kanal adı',
    'channelPassword': 'Şifre',
    
    // Buttons
    'loginBtn': 'Giriş',
    'registerBtn': 'Kayıt',
    'saveBtn': 'Kaydet',
    'cancelBtn': 'İptal',
    'createBtn': 'Oluştur',
    'addBtn': 'Ekle',
    'closeBtn': 'Kapat',
    'saveHobbiesBtn': 'İlgi Alanlarını Kaydet',
    'rememberMe': 'Beni Hatırla',
    'hobbiesTitle': 'İlgi Alanları',
    'selectHobbies': 'İlgi alanlarınızı seçin',
    'selectedHobbies': 'Seçilenler:',
    'hobbiesHint': 'Seçtiklerine göre önerilen kanallar otomatik eklenecek.',
    'createChannel': 'Kanal Oluştur',
    'addChannel': 'Kanal Ekle',
    'saveHobbies': 'İlgi Alanlarını Kaydet',
    
    // Login/Register specific
    'loginSubtitle': 'Hesabınıza giriş yapın',
    'registerSubtitle': 'Yeni hesap oluşturun',
    'forgotPassword': 'Şifremi unuttum',
    'alreadyHaveAccount': 'Zaten hesabınız var mı?',
    'dontHaveAccount': 'Hesabınız yok mu?',
    'loginError': 'Giriş başarısız',
    'registerError': 'Kayıt başarısız',
    'loginSuccess': 'Giriş başarılı',
    'registerSuccess': 'Kayıt başarılı',
    
    // Messages
    'loginSuccess': 'Giriş başarılı',
    'registerSuccess': 'Kayıt başarılı',
    'profileUpdated': 'Profil güncellendi',
    'locationUpdated': 'Lokasyon güncellendi',
    'channelCreated': 'Kanal oluşturuldu',
    'channelJoined': 'Kanala katıldınız',
    'hobbiesSaved': 'İlgi alanları kaydedildi',
    
    // Hints
    'loginHint': 'Giriş yapmadan anonim sohbet edebilirsin; fakat DM, arkadaş ekleme ve kanal ekleme için giriş gerekir.',
    'channelHint': 'Kendi kanalını ekle (#konya gibi).',
    'locationHint': 'Lokasyonunuz sponsor kanallar ve bölgesel özellikler için kullanılır.',
    'sponsorHint': 'Bölgenizdeki kullanıcılara sponsor kanalınız gösterilecek.',
    
    // Channel types
    'public': 'Herkese Açık',
    'private': 'Şifreli (Özel)',
    
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
    'channelPassword': 'Password',
    
    'loginBtn': 'Login',
    'registerBtn': 'Register',
    'saveBtn': 'Save',
    'cancelBtn': 'Cancel',
    'createBtn': 'Create',
    'addBtn': 'Add',
    'closeBtn': 'Close',
    'saveHobbiesBtn': 'Save Interests',
    'rememberMe': 'Remember Me',
    
    // Login/Register specific
    'loginSubtitle': 'Sign in to your account',
    'registerSubtitle': 'Create new account',
    'forgotPassword': 'Forgot password',
    'alreadyHaveAccount': 'Already have an account?',
    'dontHaveAccount': "Don't have an account?",
    'loginError': 'Login failed',
    'registerError': 'Registration failed',
    'loginSuccess': 'Login successful',
    'registerSuccess': 'Registration successful',
    
    'loginSuccess': 'Login successful',
    'registerSuccess': 'Registration successful',
    'profileUpdated': 'Profile updated',
    'locationUpdated': 'Location updated',
    'channelCreated': 'Channel created',
    'channelJoined': 'Joined channel',
    'hobbiesSaved': 'Interests saved',
    
    'loginHint': 'You can chat anonymously without login; but login is required for DM, adding friends and adding channels.',
    'channelHint': 'Add your own channel (like #newyork).',
    'locationHint': 'Your location is used for sponsor channels and regional features.',
    'sponsorHint': 'Your sponsor channel will be shown to users in your region.',
    
    'public': 'Public',
    'private': 'Private (Password Protected)',
    
    'anonymous': 'Anonymous',
    'loggedIn': 'Logged in',
    'typing': 'typing...',
    
    'now': 'now',
    'today': 'today',
    'yesterday': 'yesterday'
  },
  
  // Fransızca
  'FR': {
    'menu': 'Menu',
    'login': 'Connexion',
    'logout': 'Déconnexion',
    'profile': 'Modifier le Profil',
    'feedback': 'Commentaires',
    'location': 'Localisation',
    'sponsor': 'Sponsor',
    
    'sponsorChannels': 'Canaux Sponsorisés',
    'generalChannels': 'Canaux Généraux',
    'favoriteChannels': 'Mes Canaux Favoris',
    'users': 'Utilisateurs',
    'following': 'Abonnements',
    
    'loginTitle': 'Connexion / Inscription',
    'profileTitle': 'Modifier le Profil',
    'locationTitle': 'Définir la Localisation',
    'sponsorTitle': 'Créer un Canal Sponsor',
    'channelTitle': 'Créer un Nouveau Canal',
    'hobbiesTitle': 'Centres d\'Intérêt',
    
    'email': 'Email ou Téléphone',
    'password': 'Mot de passe',
    'firstName': 'Prénom',
    'lastName': 'Nom de famille',
    'gender': 'Genre',
    'birth': 'Date de naissance',
    'country': 'Pays',
    'city': 'Ville',
    'channelName': 'Nom du canal',
    'channelPassword': 'Mot de passe',
    
    'loginBtn': 'Connexion',
    'registerBtn': 'Inscription',
    'saveBtn': 'Enregistrer',
    'cancelBtn': 'Annuler',
    'createBtn': 'Créer',
    'addBtn': 'Ajouter',
    'closeBtn': 'Fermer',
    
    'loginSuccess': 'Connexion réussie',
    'registerSuccess': 'Inscription réussie',
    'profileUpdated': 'Profil mis à jour',
    'locationUpdated': 'Localisation mise à jour',
    'channelCreated': 'Canal créé',
    'channelJoined': 'Rejoint le canal',
    'hobbiesSaved': 'Centres d\'intérêt enregistrés',
    
    'loginHint': 'Vous pouvez discuter anonymement sans connexion; mais la connexion est requise pour les MP, ajouter des amis et ajouter des canaux.',
    'channelHint': 'Ajoutez votre propre canal (comme #paris).',
    'locationHint': 'Votre localisation est utilisée pour les canaux sponsors et les fonctionnalités régionales.',
    'sponsorHint': 'Votre canal sponsor sera affiché aux utilisateurs de votre région.',
    
    'public': 'Public',
    'private': 'Privé (Protégé par mot de passe)',
    
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
    'profile': 'Profil Bearbeiten',
    'feedback': 'Feedback',
    'location': 'Standort',
    'sponsor': 'Sponsor',
    
    'sponsorChannels': 'Gesponserte Kanäle',
    'generalChannels': 'Allgemeine Kanäle',
    'favoriteChannels': 'Meine Lieblingskanäle',
    'users': 'Benutzer',
    'following': 'Folge ich',
    
    'loginTitle': 'Anmelden / Registrieren',
    'profileTitle': 'Profil Bearbeiten',
    'locationTitle': 'Standort Festlegen',
    'sponsorTitle': 'Sponsor-Kanal Erstellen',
    'channelTitle': 'Neuen Kanal Erstellen',
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
    'channelPassword': 'Passwort',
    
    'loginBtn': 'Anmelden',
    'registerBtn': 'Registrieren',
    'saveBtn': 'Speichern',
    'cancelBtn': 'Abbrechen',
    'createBtn': 'Erstellen',
    'addBtn': 'Hinzufügen',
    'closeBtn': 'Schließen',
    
    'loginSuccess': 'Anmeldung erfolgreich',
    'registerSuccess': 'Registrierung erfolgreich',
    'profileUpdated': 'Profil aktualisiert',
    'locationUpdated': 'Standort aktualisiert',
    'channelCreated': 'Kanal erstellt',
    'channelJoined': 'Kanal beigetreten',
    'hobbiesSaved': 'Interessen gespeichert',
    
    'loginHint': 'Sie können anonym chatten ohne Anmeldung; aber Anmeldung ist erforderlich für DMs, Freunde hinzufügen und Kanäle hinzufügen.',
    'channelHint': 'Fügen Sie Ihren eigenen Kanal hinzu (wie #berlin).',
    'locationHint': 'Ihr Standort wird für Sponsor-Kanäle und regionale Funktionen verwendet.',
    'sponsorHint': 'Ihr Sponsor-Kanal wird Benutzern in Ihrer Region angezeigt.',
    
    'public': 'Öffentlich',
    'private': 'Privat (Passwort geschützt)',
    
    'anonymous': 'Anonym',
    'loggedIn': 'Angemeldet',
    'typing': 'tippt...',
    
    'now': 'jetzt',
    'today': 'heute',
    'yesterday': 'gestern'
  },
  
  // İspanyolca
  'ES': {
    'menu': 'Menú',
    'login': 'Iniciar Sesión',
    'logout': 'Cerrar Sesión',
    'profile': 'Editar Perfil',
    'feedback': 'Comentarios',
    'location': 'Ubicación',
    'sponsor': 'Patrocinador',
    
    'sponsorChannels': 'Canales Patrocinados',
    'generalChannels': 'Canales Generales',
    'favoriteChannels': 'Mis Canales Favoritos',
    'users': 'Usuarios',
    'following': 'Siguiendo',
    
    'loginTitle': 'Iniciar Sesión / Registrarse',
    'profileTitle': 'Editar Perfil',
    'locationTitle': 'Establecer Ubicación',
    'sponsorTitle': 'Crear Canal Patrocinado',
    'channelTitle': 'Crear Nuevo Canal',
    'hobbiesTitle': 'Intereses',
    
    'email': 'Email o Teléfono',
    'password': 'Contraseña',
    'firstName': 'Nombre',
    'lastName': 'Apellido',
    'gender': 'Género',
    'birth': 'Fecha de Nacimiento',
    'country': 'País',
    'city': 'Ciudad',
    'channelName': 'Nombre del canal',
    'channelPassword': 'Contraseña',
    
    'loginBtn': 'Iniciar Sesión',
    'registerBtn': 'Registrarse',
    'saveBtn': 'Guardar',
    'cancelBtn': 'Cancelar',
    'createBtn': 'Crear',
    'addBtn': 'Agregar',
    'closeBtn': 'Cerrar',
    
    'loginSuccess': 'Inicio de sesión exitoso',
    'registerSuccess': 'Registro exitoso',
    'profileUpdated': 'Perfil actualizado',
    'locationUpdated': 'Ubicación actualizada',
    'channelCreated': 'Canal creado',
    'channelJoined': 'Unido al canal',
    'hobbiesSaved': 'Intereses guardados',
    
    'loginHint': 'Puedes chatear anónimamente sin iniciar sesión; pero se requiere inicio de sesión para DM, agregar amigos y agregar canales.',
    'channelHint': 'Agrega tu propio canal (como #madrid).',
    'locationHint': 'Tu ubicación se usa para canales patrocinados y características regionales.',
    'sponsorHint': 'Tu canal patrocinado se mostrará a los usuarios de tu región.',
    
    'public': 'Público',
    'private': 'Privado (Protegido con contraseña)',
    
    'anonymous': 'Anónimo',
    'loggedIn': 'Conectado',
    'typing': 'escribiendo...',
    
    'now': 'ahora',
    'today': 'hoy',
    'yesterday': 'ayer'
  }
};

// Dil değiştirme fonksiyonu
function changeLanguage(countryCode) {
  const lang = translations[countryCode] || translations['TR'];
  const elements = document.querySelectorAll('[data-translate]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-translate');
    if (lang[key]) {
      element.textContent = lang[key];
    }
  });
  
  // Placeholder'ları güncelle
  const placeholders = document.querySelectorAll('[data-placeholder]');
  placeholders.forEach(element => {
    const key = element.getAttribute('data-placeholder');
    if (lang[key]) {
      element.placeholder = lang[key];
    }
  });
  
  // Title'ları güncelle
  const titles = document.querySelectorAll('[data-title]');
  titles.forEach(element => {
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
  if (translations[countryCode]) {
    changeLanguage(countryCode);
  }
}

// Global olarak erişilebilir yap
window.changeLanguage = changeLanguage;
window.loadLanguage = loadLanguage;
window.onLocationChange = onLocationChange;
