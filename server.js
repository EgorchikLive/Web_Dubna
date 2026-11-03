// server.js
const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const cors = require('cors');

// ❌ УДАЛЕНО: const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

app.post('/yandex-auth', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No code' });

    try {
        // 1. Обмен кода на токен Яндекса (используем встроенный fetch)
        const tokenRes = await fetch('https://oauth.yandex.ru/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: 'a7f59f55a3b64366becee4591128c2f0',
                client_secret: 'ccd4e78d00c8486fb722831a454478ef'
            })
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) return res.status(400).json({ error: 'Token exchange failed' });

        // 2. Получение данных пользователя
        const userRes = await fetch('https://login.yandex.ru/info?format=json', {
            headers: { Authorization: `OAuth ${tokenData.access_token}` }
        });
        const userData = await userRes.json();
        const email = userData.default_email || (userData.emails && userData.emails[0]);
        if (!email) return res.status(400).json({ error: 'No email from Yandex' });

        // 3. Создаём / получаем пользователя в Firebase
        let userRecord;
        try {
            userRecord = await getAuth().getUserByEmail(email);
        } catch (e) {
            userRecord = await getAuth().createUser({
                email, 
                displayName: userData.real_name || userData.display_name || '' 
            });
        }

        // 4. Генерируем кастомный токен
        const customToken = await getAuth().createCustomToken(userRecord.uid);
        res.json({ token: customToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server started on port 3000'));