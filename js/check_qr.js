document.addEventListener("DOMContentLoaded", () => {
  const qrResult = document.getElementById("qrResult");
  const qrRegionId = "preview";
  const html5QrCode = new Html5Qrcode(qrRegionId);

  function onScanSuccess(decodedText, decodedResult) {
    qrResult.value = decodedText;
    html5QrCode.stop().catch(err => console.error("Failed to stop scanner:", err));
  }

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length > 0) {
      const backCamera = devices.find(device =>
        device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')
      ) || devices[devices.length - 1];

      html5QrCode.start(
        { deviceId: { exact: backCamera.id } },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess
      ).catch(err => {
        console.error("Camera start error:", err);
        qrResult.value = "カメラの起動に失敗しました。";
      });
    } else {
      qrResult.value = "カメラが見つかりませんでした。";
    }
  }).catch(err => {
    console.error("Camera access error:", err);
    qrResult.value = "カメラへのアクセスに失敗しました。";
  });

  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", async () => {
      const qrText = qrResult.value.trim();
      if (!qrText) {
        alert("QRコードが読み取られていません。");
        return;
      }

      const parts = qrText.split(',');
      if (parts.length !== 7) {
        alert("QRコードの形式が正しくありません。");
        return;
      }

      const [room, checkIn, checkOut, days, guests, reservation, hashFromQR] = parts;
      const secret = "HOTEL_ONLY_SECRET_KEY";
      const data = `${room},${checkIn},${checkOut},${days},${guests},${reservation}`;
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data + secret));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const calculatedHash = hashHex.slice(0, 8);

      if (calculatedHash !== hashFromQR) {
        alert("❌ QRコードが不正です。");
        return;
      }

      // ✅ 서버에 예약번호와 해쉬값 검증 요청
      try {
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxlk6w8dPpztsopBPT6GqiEbNGz2ao9JTZyvXKArcDsX6lE2rA8Y-xifJ1bWddGxPfTIw/exec";
        const verifyUrl = `${scriptUrl}?callback=handleVerifyResponse&verifyReservation=${encodeURIComponent(reservation)}&hashcode=${encodeURIComponent(hashFromQR)}`;

        const script = document.createElement("script");
        console.log(verifyUrl);
        script.src = verifyUrl;
        document.body.appendChild(script);
      } catch (err) {
        console.error("Verification request failed:", err);
        alert("サーバーとの確認中にエラーが発生しました。");
      }
    });
  }
});

window.handleVerifyResponse = function(response) {
  if (!response.success) {
    alert("❌ QRコードの確認中にエラーが発生しました。");
  } else if (response.match === true) {
    alert("✅ QRコードがデータベースと一致しました。");
    // ✅ 朝食人数入力テーブルを表示
    const start = new Date(response.checkIn);
    const end = new Date(response.checkOut);
    const container = document.getElementById("breakfastCheckTable");
    if (!container) {
      console.error("❌ breakfastCheckTable element not found.");
      return;
    }
    container.innerHTML = ""; // 기존 테이블 초기화

    const tableTitle = document.createElement("h3");
    tableTitle.textContent = "朝食チェック表";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const header = table.insertRow();
    header.innerHTML = "<th>日付</th><th>人数</th>";
    header.querySelectorAll("th").forEach(th => {
      th.style.borderBottom = "1px solid #ccc";
      th.style.padding = "8px";
      th.style.textAlign = "left";
    });

    const days = [];
    let current = new Date(start);
    current.setDate(current.getDate() + 1); // 체크인 다음날부터 시작
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    days.forEach(date => {
      const row = table.insertRow();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      const dateCell = row.insertCell();
      dateCell.textContent = dateString;
      dateCell.style.padding = "8px";

      const inputCell = row.insertCell();
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.value = "0";
      input.style.width = "60px";
      inputCell.appendChild(input);
      inputCell.style.padding = "8px";
    });

    container.appendChild(tableTitle);
    container.appendChild(table);
  } else {
    alert("❌ データベースの情報と一致しません。");
  }
};