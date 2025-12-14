function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
    return decodeURIComponent(escape(atob(str)));
}


function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
}


function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString();
}


function generateQR() {
    const fio = document.getElementById("fio").value.trim();
    const group = document.getElementById("group").value.trim();

    if (!fio || !group) {
        alert("Введите ФИО и группу!");
        return;
    }

    const studentData = { fio, group };

    const jsonString = JSON.stringify(studentData);
    const encodedData = encodeBase64(jsonString);

    const canvas = document.getElementById("qrCanvas");

    QRCode.toCanvas(canvas, encodedData, { width: 250 }, function (error) {
        if (error) {
            console.error(error);
            alert("Ошибка генерации QR-кода");
        }
    });
}


function startScanner() {
    const video = document.getElementById("video");
    const scanResult = document.getElementById("scanResult");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            video.play();

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            function scan() {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, canvas.width, canvas.height);

                    if (code) {
                        try {
                            const decodedString = decodeBase64(code.data);
                            const student = JSON.parse(decodedString);

                            const result = saveVisit(student.fio, student.group);

                            if (result === "saved") {
                                scanResult.innerHTML = `
                                    ✅ Посещение зафиксировано<br>
                                    <strong>${student.fio}</strong><br>
                                    Группа: ${student.group}
                                `;
                            } else {
                                scanResult.innerHTML = `
                                    ⚠️ Посещение уже зафиксировано сегодня<br>
                                    <strong>${student.fio}</strong>
                                `;
                            }

                            stream.getTracks().forEach(track => track.stop());
                            return;
                        } catch (e) {
                            console.error("Ошибка декодирования", e);
                        }
                    }
                }
                requestAnimationFrame(scan);
            }

            scan();
        })
        .catch(err => {
            console.error(err);
            alert("Не удалось получить доступ к камере");
        });
}


function saveVisit(fio, group) {
    const visits = JSON.parse(localStorage.getItem("visits") || "[]");
    const today = getCurrentDate();

    const alreadyVisited = visits.some(v =>
        v.fio === fio &&
        v.group === group &&
        v.date === today
    );

    if (alreadyVisited) {
        return "exists";
    }

    visits.push({
        fio: fio,
        group: group,
        date: today,
        datetime: getCurrentDateTime()
    });

    localStorage.setItem("visits", JSON.stringify(visits));
    return "saved";
}


function loadVisits() {
    const tableBody = document.getElementById("visitsTable");
    if (!tableBody) return;

    const visits = JSON.parse(localStorage.getItem("visits") || "[]");
    tableBody.innerHTML = "";

    visits.forEach((visit, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${visit.fio}</td>
            <td>${visit.group}</td>
            <td>${visit.datetime}</td>
        `;
        tableBody.appendChild(row);
    });
}
