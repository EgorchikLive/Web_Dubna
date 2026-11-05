document.addEventListener('DOMContentLoaded', () => {
    const statusBanner = document.getElementById('offline-banner');
    const statusText = document.getElementById('status-text');
    const lastUpdateText = document.getElementById('last-update');

    // Функция форматирования времени
    const formatTime = (timestamp) => {
        if (!timestamp) return 'никогда';
        const date = new Date(timestamp);
        return date.toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Обновление интерфейса баннера
    function updateStatusUI(isOnline) {
        const lastSync = localStorage.getItem('lastSyncTime');
        
        if (!statusBanner) return; // Если баннера нет на странице

        if (isOnline) {
            statusBanner.className = 'offline-banner online';
            statusText.textContent = 'Вы онлайн. Данные актуальны.';
            lastUpdateText.textContent = `Последнее обновление: ${formatTime(lastSync)}`;
        } else {
            statusBanner.className = 'offline-banner offline';
            statusText.textContent = 'Нет подключения к интернету. Вы просматриваете сохраненную копию.';
            lastUpdateText.textContent = `Последнее обновление: ${formatTime(lastSync)}`;
        }
    }

    // Проверка времени последней синхронизации (раз в 1 час)
    function checkSyncTime() {
        const lastSync = localStorage.getItem('lastSyncTime');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (!lastSync || (now - lastSync) > oneHour) {
            // Если прошло больше часа или синхронизации не было — обновляем метку
            localStorage.setItem('lastSyncTime', now);
            console.log('Время синхронизации обновлено');
            
            // Здесь можно добавить логику обновления данных из Firebase,
            // но так как Firebase кэширует данные сам, мы просто обновляем метку.
        }
    }

    // Слушатели событий сети
    window.addEventListener('online', () => {
        checkSyncTime();
        updateStatusUI(true);
    });
    
    window.addEventListener('offline', () => updateStatusUI(false));

    // Инициализация при загрузке
    checkSyncTime();
    updateStatusUI(navigator.onLine);

    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((reg) => console.log('Service Worker зарегистрирован:', reg.scope))
                .catch((err) => console.error('Ошибка Service Worker:', err));
        });
    }
});