document.addEventListener('DOMContentLoaded', () => {
    const btnOrder = document.querySelector('.btn_order');
    const signaturePopup = document.getElementById('signature-popup');
    const signatureClose = document.querySelector('.signature_close');
    const canvas = document.getElementById('signature-canvas');
    const clearBtn = document.getElementById('clear-signature');
    const submitBtn = document.getElementById('submit-signature');

    if (!btnOrder || !signaturePopup) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let hasDrawn = false;

    // Корректный размер canvas для Retina и мобилок
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1f1e25';
    }

    function startDrawing(e) {
        isDrawing = true;
        hasDrawn = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault(); 
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // События мыши
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // События тачскрина
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
    });

    // Открытие окна подписи
    btnOrder.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!window.currentFirebaseUser) {
            alert('Пожалуйста, войдите в личный кабинет, чтобы оформить заявку.');
            document.querySelector('.enter_block').click();
            return;
        }

        const summa = document.querySelector('.result_all_money input').value;
        const period = document.querySelector('input[name="period"]').value;
        const monthly = document.querySelector('.result_month_pay input').value;

        document.getElementById('sig-amount').textContent = summa;
        document.getElementById('sig-period').textContent = period.replace(' лет', '');
        document.getElementById('sig-monthly').textContent = monthly;

        signaturePopup.classList.remove('popup_hidden');
        
        setTimeout(() => {
            resizeCanvas();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasDrawn = false;
        }, 100);
    });

    signatureClose.addEventListener('click', () => {
        signaturePopup.classList.add('popup_hidden');
    });

    // Отправка
    submitBtn.addEventListener('click', async () => {
        if (!hasDrawn) {
            alert('Пожалуйста, распишитесь в поле выше.');
            return;
        }

        const signatureData = canvas.toDataURL('image/png');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            const user = window.currentFirebaseUser;
            
            const applicationData = {
                userId: user.uid,
                email: user.email,
                amount: document.getElementById('sig-amount').textContent,
                period: document.getElementById('sig-period').textContent,
                monthlyPayment: document.getElementById('sig-monthly').textContent,
                signature: signatureData,
                createdAt: window.firestoreServerTimestamp(),
                status: 'pending'
            };

            await window.firestoreSetDoc(
                window.firestoreDoc(window.firebaseDb, "applications", Date.now().toString()),
                applicationData
            );

            alert('Заявка успешно подписана и отправлена!');
            signaturePopup.classList.add('popup_hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подтвердить';

        } catch (error) {
            console.error("Ошибка отправки:", error);
            alert('Ошибка при отправке заявки: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подтвердить';
        }
    });
});