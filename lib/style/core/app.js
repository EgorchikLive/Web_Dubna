// ============================================================
// БУРГЕР-МЕНЮ
// ============================================================
document.querySelector('.burger').addEventListener('click', () => {
    // Теперь класс вешается на тег nav, а не на ul
    document.querySelector('.header nav').classList.toggle('show_menu');
});

// ============================================================
// ОСТАЛЬНАЯ ЛОГИКА АВТОРИЗАЦИИ (БЕЗ ИЗМЕНЕНИЙ)
// ============================================================
const popup = document.querySelector('.popup_overlay');
const authForm = document.getElementById('auth-form');
const submitBtn = document.getElementById('submit-auth');
const errorBox = document.getElementById('auth-error');
const confirmPasswordGroup = document.querySelector('.confirm_password_group');
const confirmPasswordInput = document.getElementById('form-confirm-password');
const enterBlockSpan = document.querySelector('.enter_block span');

let currentAuthMode = 'login';

function updateAuthUI(user) {
    window.currentFirebaseUser = user;

    if (user) {
        enterBlockSpan.textContent = 'Личный кабинет';
        document.querySelector('.enter_block').onclick = (e) => {
            e.preventDefault();
            window.location.href = 'profile.html';
        };
    } else {
        enterBlockSpan.textContent = 'Войти в Интернет-банк';
        document.querySelector('.enter_block').onclick = (e) => {
            e.preventDefault();
            popup.classList.remove('popup_hidden');
            document.getElementById('form-email').focus();
            resetForm();
        };
    }
}

document.querySelectorAll('.popup_close').forEach(btn => {
    btn.addEventListener('click', () => popup.classList.add('popup_hidden'));
});

window.addEventListener('click', (e) => {
    if (e.target === popup) popup.classList.add('popup_hidden');
});

document.querySelector('.show_password').addEventListener('click', function () {
    const passInput = document.getElementById('form-password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        this.style.color = 'var(--blue)';
    } else {
        passInput.type = 'password';
        this.style.color = '#707c87';
    }
});

document.querySelectorAll('.auth_tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = tab.dataset.tab;
        if (mode === currentAuthMode) return;

        currentAuthMode = mode;
        document.querySelectorAll('.auth_tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (mode === 'login') {
            submitBtn.textContent = 'Войти';
            confirmPasswordGroup.style.display = 'none';
            confirmPasswordInput.removeAttribute('required');
            document.getElementById('form-password').setAttribute('autocomplete', 'current-password');
        } else {
            submitBtn.textContent = 'Зарегистрироваться';
            confirmPasswordGroup.style.display = 'flex';
            confirmPasswordInput.setAttribute('required', 'true');
            document.getElementById('form-password').setAttribute('autocomplete', 'new-password');
        }
        resetForm();
    });
});

function resetForm() {
    authForm.reset();
    errorBox.classList.add('popup_hidden');
    errorBox.textContent = '';
}

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('popup_hidden');
}

async function saveUserToFirestore(user) {
    try {
        const userRef = window.firestoreDoc(window.firebaseDb, "users", user.uid);
        const docSnap = await window.firestoreGetDoc(userRef);
        if (!docSnap.exists()) {
            await window.firestoreSetDoc(userRef, {
                email: user.email,
                uid: user.uid,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                createdAt: window.firestoreServerTimestamp(),
                role: "user"
            });
        }
    } catch (error) {
        console.error("Firestore save error:", error);
    }
}

window.addEventListener('firebaseReady', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const customToken = urlParams.get('customToken');

    if (customToken) {
        window.history.replaceState({}, document.title, window.location.pathname);
        window.firebaseSignInWithCustomToken(window.firebaseAuth, customToken)
            .then(async (cred) => {
                await saveUserToFirestore(cred.user);
                handleAuthSuccess('Вы успешно вошли через Яндекс ID!');
            })
            .catch((err) => {
                console.error('Custom token error:', err);
                showError('Ошибка входа через Яндекс: ' + err.message);
            });
    }

    window.firebaseOnAuthStateChanged(window.firebaseAuth, async (user) => {
        updateAuthUI(user);
        if (user) await saveUserToFirestore(user);
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.classList.add('popup_hidden');

        const email = document.getElementById('form-email').value.trim();
        const password = document.getElementById('form-password').value;

        if (password.length < 6) return showError('Пароль должен содержать минимум 6 символов');

        if (currentAuthMode === 'register') {
            const confirmPass = confirmPasswordInput.value;
            if (password !== confirmPass) return showError('Пароли не совпадают');
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Подождите...';

        try {
            if (currentAuthMode === 'login') {
                const cred = await window.firebaseSignIn(window.firebaseAuth, email, password);
                await saveUserToFirestore(cred.user);
                handleAuthSuccess('Вы успешно вошли!');
            } else {
                const cred = await window.firebaseSignUp(window.firebaseAuth, email, password);
                await saveUserToFirestore(cred.user);
                handleAuthSuccess('Регистрация успешна!');
            }
        } catch (err) {
            if (err.code === 'auth/user-not-found') showError('Пользователь не найден.');
            else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') showError('Неверный пароль.');
            else if (err.code === 'auth/email-already-in-use') showError('Этот email уже зарегистрирован.');
            else if (err.code === 'auth/invalid-email') showError('Некорректный формат email.');
            else if (err.code === 'auth/weak-password') showError('Слишком слабый пароль.');
            else showError('Ошибка: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = currentAuthMode === 'login' ? 'Войти' : 'Зарегистрироваться';
        }
    });

    document.getElementById('google-login').addEventListener('click', () => {
        const provider = new window.firebaseGoogleProvider();
        window.firebaseSignInWithPopup(window.firebaseAuth, provider)
            .then(async (result) => {
                await saveUserToFirestore(result.user);
                handleAuthSuccess('Вы успешно вошли через Google!');
            })
            .catch((error) => {
                if (error.code === 'auth/popup-closed-by-user') return;
                if (error.code === 'auth/popup-blocked') {
                    showError('Браузер заблокировал окно. Разрешите всплывающие окна для этого сайта.');
                } else {
                    showError('Ошибка Google: ' + error.message);
                }
            });
    });

    document.getElementById('yandex-login').addEventListener('click', () => {
        const CLIENT_ID = 'ВАШ_CLIENT_ID_ЯНДЕКСА';
        const REDIRECT_URI = window.location.origin + '/yandex-callback.html';
        const scope = 'login:email login:info';

        const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
        window.location.href = authUrl;
    });
});

function handleAuthSuccess(message) {
    document.querySelector('.popup_wrapper').classList.add('popup_hidden');
    const thxWrapper = document.querySelector('.thx_wrapper');
    thxWrapper.querySelector('h3').textContent = message;
    thxWrapper.classList.remove('popup_hidden');
    resetForm();
    setTimeout(() => {
        thxWrapper.classList.add('popup_hidden');
        window.location.href = 'profile.html';
    }, 1500);
}