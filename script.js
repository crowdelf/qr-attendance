/*************** BASE64 (РУССКИЙ ЯЗЫК) ***************/
function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
    return decodeURIComponent(escape(atob(str)));
}

/*************** ГЕНЕРАЦИЯ QR ***************/
function generateQR() {
    const fio = document.getElementById("fio").value.trim();
    const group = document.getElementById("group").value.trim();

    if (!fio || !group) {
        alert("Введите ФИО и группу");
        return;
    }

    const data = encodeBase64(`${fio}||${group}`);
    const canvas = document.getElementById("qrCanvas");

    QRCode.toCanvas(canvas, data, {
        width: 280,
        margin: 2
    });
}

/*************** СКАНИРОВАНИЕ QR ***************/
function startScanner() {
    const video = document.getElementById("video");
    const result = document.getElementById("scanResult");

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    }).then(stream => {
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        function scan() {
            if (video.videoWidth === 0) {
                requestAnimationFrame(scan);
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "attemptBoth"
            });

            if (code) {
                try {
                    const decoded = decodeBase64(code.data);
                    const [fio, group] = decoded.split("||");

                    saveVisit(fio, group);

                    result.innerHTML = `
                        ✅ Посещение зафиксировано<br>
                        <b>${fio}</b><br>
                        Группа: ${group}
                    `;

                    stream.getTracks().forEach(t => t.stop());
                    return;
                } catch (e) {
                    console.error("Ошибка чтения QR", e);
                }
            }

            requestAnimationFrame(scan);
        }

        scan();
    }).catch(() => {
        alert("Не удалось открыть камеру");
    });
}

/*************** ХРАНЕНИЕ ПОСЕЩЕНИЙ ***************/
function saveVisit(fio, group) {
    const visits = JSON.parse(localStorage.getItem("visits") || "[]");
    visits.push({
        fio,
        group,
        time: new Date().toLocaleString()
    });
    localStorage.setItem("visits", JSON.stringify(visits));
}

/*************** ВЫВОД ПОСЕЩЕНИЙ ***************/
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
