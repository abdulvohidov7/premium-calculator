const currentDisplay = document.getElementById("current");
const previousDisplay = document.getElementById("previous");

const historyPanel = document.getElementById("history");
const historyList = document.getElementById("historyList");

const historyBtn = document.getElementById("historyBtn");
const closeHistory = document.getElementById("closeHistory");

let current = "";
let previous = "";
let operator = null;

let shouldReset = false;
let history = [];


/* =========================
   DISPLAY
========================= */

function updateDisplay() {
    currentDisplay.textContent = current || "0";

    if (previous !== "" && operator !== null) {
        previousDisplay.textContent =
            `${previous} ${getSymbol(operator)}`;
    } else {
        previousDisplay.textContent = "";
    }
}


/* =========================
   OPERATOR SYMBOL
========================= */

function getSymbol(op) {
    switch (op) {
        case "*":
            return "×";
        case "/":
            return "÷";
        case "-":
            return "−";
        default:
            return op;
    }
}


/* =========================
   NUMBER
========================= */

function addNumber(number) {

    // Error bo'lsa yangi raqam bosilganda qayta boshlaydi
    if (current === "Error") {
        current = "";
        previous = "";
        operator = null;
        shouldReset = false;
    }

    // Natijadan keyin raqam bosilsa yangi hisob boshlanadi
    if (shouldReset) {
        current = "";
        shouldReset = false;
    }

    // Nuqta
    if (number === ".") {

        // Bir nechta nuqta kiritishni bloklash
        if (current.includes(".")) {
            return;
        }

        // Boshida nuqta bo'lsa 0. qiladi
        if (current === "") {
            current = "0.";
        } else {
            current += ".";
        }

    } else {

        // 0 dan keyin yana 0 bosilishini oldini olish
        if (current === "0") {
            current = number;
        } else {
            current += number;
        }
    }

    updateDisplay();
}


/* =========================
   OPERATOR
========================= */

function chooseOperator(op) {

    if (current === "Error") {
        return;
    }

    // Birinchi operator
    if (current !== "" && previous === "") {

        previous = current;
        current = "";
        operator = op;

        updateDisplay();
        return;
    }

    // Operator allaqachon tanlangan bo'lsa,
    // yangi operator bilan almashtiradi
    if (previous !== "" && current === "" && operator !== null) {

        operator = op;
        updateDisplay();
        return;
    }

    // Ikkinchi son mavjud bo'lsa avval hisoblaydi
    if (previous !== "" && current !== "" && operator !== null) {

        const result = performCalculation();

        if (result === null) {
            return;
        }

        previous = result.toString();
        current = "";
        operator = op;

        updateDisplay();
    }
}


/* =========================
   CALCULATION
========================= */

function performCalculation() {

    if (
        previous === "" ||
        current === "" ||
        operator === null
    ) {
        return null;
    }

    const a = Number(previous);
    const b = Number(current);

    let result;

    switch (operator) {

        case "+":
            result = a + b;
            break;

        case "-":
            result = a - b;
            break;

        case "*":
            result = a * b;
            break;

        case "/":

            if (b === 0) {

                current = "Error";
                previous = "";
                operator = null;
                shouldReset = true;

                updateDisplay();

                return null;
            }

            result = a / b;
            break;

        default:
            return null;
    }

    // Juda uzun kasrlarni qisqartirish
    result = Number(result.toFixed(10));

    return result;
}


/* =========================
   EQUALS
========================= */

function calculate() {

    if (
        previous === "" ||
        current === "" ||
        operator === null
    ) {
        return;
    }

    const a = Number(previous);
    const b = Number(current);
    const selectedOperator = operator;

    const result = performCalculation();

    if (result === null) {
        return;
    }

    // History
    addHistory(
        `${formatNumber(a)} ${getSymbol(selectedOperator)} ${formatNumber(b)}`,
        formatNumber(result)
    );

    current = result.toString();
    previous = "";
    operator = null;

    shouldReset = true;

    updateDisplay();
}


/* =========================
   NUMBER FORMAT
========================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    return Number(number).toString();
}


/* =========================
   CLEAR
========================= */

function clearCalculator() {

    current = "";
    previous = "";
    operator = null;
    shouldReset = false;

    updateDisplay();
}


/* =========================
   DELETE
========================= */

function deleteNumber() {

    if (shouldReset || current === "Error") {
        return;
    }

    if (current.length > 0) {
        current = current.slice(0, -1);
    }

    updateDisplay();
}


/* =========================
   PERCENT
========================= */

function percentage() {

    if (
        current === "" ||
        current === "Error"
    ) {
        return;
    }

    const number = Number(current);

    if (!Number.isFinite(number)) {
        return;
    }

    current = (number / 100).toString();

    updateDisplay();
}


/* =========================
   PLUS / MINUS
========================= */

function changeSign() {

    if (
        current === "" ||
        current === "0" ||
        current === "Error"
    ) {
        return;
    }

    if (current.startsWith("-")) {
        current = current.slice(1);
    } else {
        current = "-" + current;
    }

    updateDisplay();
}


/* =========================
   HISTORY
========================= */

function addHistory(expression, result) {

    history.unshift({
        expression: expression,
        result: result
    });

    // Maksimum 20 ta tarix
    if (history.length > 20) {
        history.pop();
    }

    renderHistory();
}


function renderHistory() {

    if (history.length === 0) {

        historyList.innerHTML =
            "<p>Hozircha tarix yo‘q</p>";

        return;
    }

    historyList.innerHTML = history
        .map(item => {

            return `
                <div class="history-item">
                    <small>${item.expression}</small>
                    <div>= ${item.result}</div>
                </div>
            `;

        })
        .join("");
}


/* =========================
   OPEN HISTORY
========================= */

historyBtn.addEventListener("click", () => {
    historyPanel.classList.add("active");
});


/* =========================
   CLOSE HISTORY
========================= */

closeHistory.addEventListener("click", () => {
    historyPanel.classList.remove("active");
});


/* =========================
   BUTTONS
========================= */

document
    .querySelectorAll(".buttons button")
    .forEach(button => {

        button.addEventListener("click", function(event) {

            /* RIPPLE */

            const ripple = document.createElement("span");
            ripple.classList.add("ripple");

            const rect = button.getBoundingClientRect();

            const size = Math.max(
                rect.width,
                rect.height
            );

            ripple.style.width = size + "px";
            ripple.style.height = size + "px";

            ripple.style.left =
                event.clientX -
                rect.left -
                size / 2 +
                "px";

            ripple.style.top =
                event.clientY -
                rect.top -
                size / 2 +
                "px";

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 450);


            /* DATA */

            const value = button.dataset.value;
            const action = button.dataset.action;


            /* NUMBER */

            if (
                value !== undefined &&
                !action &&
                !["+", "-", "*", "/"].includes(value)
            ) {
                addNumber(value);
            }


            /* CLEAR */

            if (action === "clear") {
                clearCalculator();
            }


            /* DELETE */

            if (action === "delete") {
                deleteNumber();
            }


            /* PERCENT */

            if (action === "percent") {
                percentage();
            }


            /* SIGN */

            if (action === "sign") {
                changeSign();
            }


            /* EQUALS */

            if (action === "equals") {
                calculate();
            }


            /* OPERATOR */

            if (
                value &&
                ["+", "-", "*", "/"].includes(value)
            ) {
                chooseOperator(value);
            }

        });

    });


/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", event => {

    const key = event.key;

    // Raqamlar
    if (key >= "0" && key <= "9") {
        addNumber(key);
        return;
    }

    // Nuqta
    if (key === ".") {
        addNumber(".");
        return;
    }

    // Operatorlar
    if (
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/"
    ) {
        chooseOperator(key);
        return;
    }

    // Enter
    if (
        key === "Enter" ||
        key === "="
    ) {
        event.preventDefault();
        calculate();
        return;
    }

    // Backspace
    if (key === "Backspace") {
        deleteNumber();
        return;
    }

    // Escape
    if (key === "Escape") {
        clearCalculator();
        return;
    }

    // Percent
    if (key === "%") {
        percentage();
    }

});


/* =========================
   START
========================= */

updateDisplay();