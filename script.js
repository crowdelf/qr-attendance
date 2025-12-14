/***********************
 * BASE64 (РУССКИЙ ЯЗЫК)
 ***********************/
function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
    return decodeURIComponent(escape(atob(str)));
}

/***********************
 * ДАТА И ВРЕМЯ
 ***********************/
function getCurrentDate() {
    return new Date().toLocaleDateString();
}

function getCurrentDateTime() {
    return new Date().toLocaleString();
}

/***********************
 * ГЕНЕРАЦИЯ QR
 ***********************/
function generateQR() {
    const fio = document.getElementById("fio").value.trim();
    const group = document.getElementById("group").value.trim();

    if (!fio || !group) {
        alert("Введите ФИО и группу");
        return;
    }

    const data = encodeBase64(JSON.stringify({ fio, group }));
    const canvas = document.getElementById("qrCanvas");

    QRCode.toCanvas(canvas, data, { width: 250 });
}

/***********************
 * СКАНИРОВАНИЕ QR
 ***********************/
function startScanner() {
    const video = document.getElementById("video");
    const result = document.getElementById("scanResult");

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    }).then(stream => {
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        function tick() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    try {
                        const decoded = JSON.parse(decodeBase64(code.data));
                        const status = saveVisit(decoded.fio, decoded.group);

                        if (status === "saved") {
                            result.innerHTML = `✅ Посещение зафиксировано<br>
                            <b>${decoded.fio}</b><br>Группа: ${decoded.group}`;
                        } else {
                            result.innerHTML = `⚠️ Уже отмечен сегодня<br>
                            <b>${decoded.fio}</b>`;
                        }

                        stream.getTracks().forEach(t => t.stop());
                        return;
                    } catch (e) {
                        console.error("Ошибка чтения QR", e);
                    }
                }
            }
            requestAnimationFrame(tick);
        }
        tick();
    }).catch(() => {
        alert("Камера недоступна");
    });
}

/***********************
 * СОХРАНЕНИЕ ПОСЕЩЕНИЯ
 ***********************/
function saveVisit(fio, group) {
    const visits = JSON.parse(localStorage.getItem("visits") || "[]");
    const today = getCurrentDate();

    const exists = visits.some(v =>
        v.fio === fio &&
        v.group === group &&
        v.date === today
    );

    if (exists) return "exists";

    visits.push({
        fio,
        group,
        date: today,
        time: getCurrentDateTime()
    });

    localStorage.setItem("visits", JSON.stringify(visits));
    return "saved";
}

/***********************
 * ЗАГРУЗКА ТАБЛИЦЫ
 ***********************/
function loadVisits() {
    const table = document.getElementById("visitsTable");
    if (!table) return;

    const visits = JSON.parse(localStorage.getItem("visits") || "[]");
    table.innerHTML = "";

    visits.forEach((v, i) => {
        table.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${v.fio}</td>
                <td>${v.group}</td>
                <td>${v.time}</td>
            </tr>
        `;
    });
}
