// --- Генерация QR-кода с поддержкой кириллицы ---
function generateQR() {
    const fio = document.getElementById("fio").value.trim();
    const group = document.getElementById("group").value.trim();

    if (!fio || !group) {
        alert("Введите ФИО и группу!");
        return;
    }

    const data = JSON.stringify({ fio, group });

    // Очистка контейнера
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";

    // Кодируем текст в UTF-8
    const utf8Data = unescape(encodeURIComponent(data));

    // Генерация QR
    new QRCode(qrContainer, {
        text: utf8Data,
        width: 250,
        height: 250,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    // Сохраняем студента в localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    students.push({ fio, group });
    localStorage.setItem("students", JSON.stringify(students));
}



// --- Сканирование QR-кода с камеры ---
function startScanner() {
    const video = document.getElementById("video");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();
            scanLoop();
        });
}

function scanLoop() {
    const video = document.getElementById("video");
    const canvas = document.createElement("canvas");

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
            handleScan(code.data);
            return;
        }
    }

    requestAnimationFrame(scanLoop);
}

function handleScan(data) {
    try {
        // Декодируем UTF-8 обратно в строку
        const decoded = decodeURIComponent(escape(data));
        const obj = JSON.parse(decoded);

        const fio = obj.fio;
        const group = obj.group;

        const visits = JSON.parse(localStorage.getItem("visits") || "[]");
        const date = new Date();

        visits.push({
            fio,
            group,
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        });

        localStorage.setItem("visits", JSON.stringify(visits));

        document.getElementById("message").innerText =
            `Посещение зафиксировано: ${fio} (${group})`;

    } catch {
        alert("QR-код не распознан!");
    }
}



// --- Таблица посещений ---
function loadVisits() {
    const table = document.getElementById("visitsTable");
    const visits = JSON.parse(localStorage.getItem("visits") || "[]");

    visits.forEach(v => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${v.fio}</td>
            <td>${v.group}</td>
            <td>${v.date}</td>
            <td>${v.time}</td>
        `;
        table.appendChild(row);
    });
}
