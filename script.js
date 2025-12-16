function generateQR() {
    const fio = document.getElementById("fio").value.trim();
    const group = document.getElementById("group").value.trim();

    if (!fio || !group) {
        alert("Введите ФИО и группу!");
        return;
    }

    const data = JSON.stringify({ fio, group });

    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";

    new QRCode(qrContainer, {
        text: data,
        width: 250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    const students = JSON.parse(localStorage.getItem("students") || "[]");
    students.push({ fio, group });
    localStorage.setItem("students", JSON.stringify(students));
}

function startScanner() {
    const video = document.getElementById("video");

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    }).then(stream => {
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();
        scanLoop();
    }).catch(() => {
        alert("Не удалось получить доступ к камере");
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
        const obj = JSON.parse(data);

        const { fio, group } = obj;
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

    } catch (e) {
        alert("QR-код не распознан!");
    }
}

function loadVisits() {
    const table = document.getElementById("visitsTable");
    table.innerHTML = "";

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
