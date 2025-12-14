// Генерация QR
function generateQR() {
    const fio = document.getElementById("fio").value.trim();
    const group = document.getElementById("group").value.trim();

    if (!fio || !group) {
        alert("Введите ФИО и группу");
        return;
    }

    const data = JSON.stringify({
        fio: fio,
        group: group
    });

    const qrDiv = document.getElementById("qr");
    qrDiv.innerHTML = "";

    new QRCode(qrDiv, {
        text: data,
        width: 250,
        height: 250,
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Сканирование QR
function startScanner() {
    const result = document.getElementById("scanResult");

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            const student = JSON.parse(decodedText);

            saveVisit(student.fio, student.group);

            result.innerHTML = `
                <p style="color:green;">
                ✅ Посещение зафиксировано<br>
                <b>${student.fio}</b><br>${student.group}
                </p>
            `;

            html5QrCode.stop();
        }
    );
}

// Сохранение посещения
function saveVisit(fio, group) {
    const visits = JSON.parse(localStorage.getItem("visits") || "[]");

    visits.push({
        fio: fio,
        group: group,
        time: new Date().toLocaleString()
    });

    localStorage.setItem("visits", JSON.stringify(visits));
}

// Загрузка таблицы
function loadVisits() {
    const table = document.getElementById("visitsTable");
    const visits = JSON.parse(localStorage.getItem("visits") || "[]");

    visits.forEach((v, i) => {
        const row = `
            <tr>
                <td>${i + 1}</td>
                <td>${v.fio}</td>
                <td>${v.group}</td>
                <td>${v.time}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}
