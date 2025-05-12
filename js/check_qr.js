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

      if (calculatedHash === hashFromQR) {
        alert("✅ QRコードが確認されました。");
        // ✅ 서버에 예약번호와 해쉬값 검증 요청
        try {
          const scriptUrl = "https://script.google.com/macros/s/AKfycbzLco53yA9DunIBU4VcyrCYzulUUn8UNAzEtTY0-PGrwGVwiTmfVz_bmuKcq9kMBlIW4A/exec";
          const verifyUrl = `${scriptUrl}?callback=handleVerifyResponse&verifyReservation=${encodeURIComponent(reservation)}&hashcode=${encodeURIComponent(hashFromQR)}`;

          const script = document.createElement("script");
          console.log(verifyUrl);
          script.src = verifyUrl;
          document.body.appendChild(script);
        } catch (err) {
          console.error("Verification request failed:", err);
          alert("サーバーとの確認中にエラーが発生しました。");
        }
      } else {
        alert("❌ QRコードが不正です。");
      }
    });
  }
});

window.handleVerifyResponse = function(response) {
  if (!response.success) {
    alert("❌ QRコードの確認中にエラーが発生しました。");
  } else if (response.match === true) {
    alert("✅ QRコードがデータベースと一致しました。");
  } else {
    alert("❌ データベースの情報と一致しません。");
  }
};