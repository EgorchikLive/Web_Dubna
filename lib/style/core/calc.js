const MORTGAGE = 9.6;
const AUTO_CREDIT = 3.5;
const CREDIT = 14.5;

let currentRate = MORTGAGE;

const btnPlus = document.querySelector('.input_plus');
const btnMinus = document.querySelector('.input_minus');

const inputSumma = document.getElementById('summa_credit');
const inputFirstMoneyText = document.querySelector('input[name="first_money"][type="text"]');
const inputFirstMoneyRange = document.getElementById('first_money');
const inputPeriodText = document.querySelector('input[name="period"]');
const inputPeriodRange = document.getElementById('period_value');

const resultAllMoney = document.querySelector('.result_all_money input');
const resultMonthPay = document.querySelector('.result_month_pay input');
const resultPercent = document.querySelector('.result_precent input');
const resultRequiredIncome = document.querySelector('.required_income input');

const fmt = v => Math.round(v).toLocaleString('ru-RU');

function getFullSum() {
    return Number(String(inputSumma.value).replace(/\D/g, '')) || 0;
}

function calcMonthlyPay(creditBody, periodYears) {
    const i = currentRate / 12 / 100;
    const n = periodYears * 12;
    if (i === 0) return creditBody / n;
    const pow = Math.pow(1 + i, n);
    return Math.floor(creditBody * i * pow / (pow - 1));
}

function updateAll() {
    const fullSum  = getFullSum();                            // полная сумма кредита
    const firstPay = Number(inputFirstMoneyRange.value) || 0; // первоначальный взнос
    const period   = Number(inputPeriodRange.value) || 5;     // срок, лет

    const creditBody = Math.max(fullSum - firstPay, 0);

    const monthlyPay     = calcMonthlyPay(creditBody, period);
    const requiredIncome = monthlyPay * 2;

    inputSumma.value         = fmt(fullSum);
    inputFirstMoneyText.value = fmt(firstPay) + ' рублей';
    inputPeriodText.value     = period + ' лет';

    resultAllMoney.value       = fmt(creditBody);
    resultMonthPay.value       = fmt(monthlyPay);
    resultPercent.value        = currentRate.toFixed(1);
    resultRequiredIncome.value = fmt(requiredIncome);
}

const selectArrow = document.querySelector('.select_arrow');
const selectList  = document.querySelector('.calc_block_left ul.list_hidden');
const selectInput = document.querySelector('.select_wrapper input[type="text"]');

selectArrow.addEventListener('click', () => {
    selectList.classList.toggle('list_hidden');
});

selectList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        const key = li.dataset.key;
        selectInput.value = li.textContent.trim();
        selectList.classList.add('list_hidden');

        if (key === '1') currentRate = MORTGAGE;
        else if (key === '2') currentRate = AUTO_CREDIT;
        else currentRate = CREDIT;

        if (key === '1') {
            inputFirstMoneyRange.min  = 200000;
            inputFirstMoneyRange.max  = 2000000;
            inputFirstMoneyRange.step = 10000;
            if (+inputFirstMoneyRange.value < 200000) inputFirstMoneyRange.value = 200000;
        } else if (key === '2') {
            inputFirstMoneyRange.min  = 0;
            inputFirstMoneyRange.max  = 1000000;
            inputFirstMoneyRange.step = 10000;
            if (+inputFirstMoneyRange.value > 1000000) inputFirstMoneyRange.value = 1000000;
        } else {
            inputFirstMoneyRange.min  = 0;
            inputFirstMoneyRange.max  = 500000;
            inputFirstMoneyRange.step = 5000;
            if (+inputFirstMoneyRange.value > 500000) inputFirstMoneyRange.value = 500000;
        }

        updateAll();
    });
});

btnPlus.addEventListener('click', () => {
    const val = getFullSum() + 100000;
    inputSumma.value = val;
    if (val > +inputFirstMoneyRange.max) inputFirstMoneyRange.max = val;
    updateAll();
});

btnMinus.addEventListener('click', () => {
    const val = Math.max(getFullSum() - 100000, 100000);
    inputSumma.value = val;
    updateAll();
});

inputFirstMoneyRange.addEventListener('input', updateAll);

inputPeriodRange.addEventListener('input', updateAll);

inputSumma.value          = 2000000;
inputFirstMoneyRange.value = 200000;
inputPeriodRange.value     = 5;
updateAll();