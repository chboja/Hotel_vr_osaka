


let html5QrCode;

function onScanSuccess(decodedText, decodedResult) {
  console.log(`✅ QRコードスキャン成功: ${decodedText}`);
  document.getElementById("scannedText").value = decodedText;
}

function startCameraScanner() {
  const qrConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 }
  };

  html5QrCode = new Html5Qrcode("cameraPreview");
  html5QrCode.start({ facingMode: "environment" }, qrConfig, onScanSuccess)
    .catch(err => console.error("❌ カメラ起動エラー:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  startCameraScanner();

  const submitBtn = document.getElementById("submitGuest");
  submitBtn.addEventListener("click", () => {
    const text = document.getElementById("scannedText").value.trim();
    const guests = document.getElementById("guestCount").value.trim();
    if (!text || !guests) {
      alert("QR情報と人数を入力してください。");
      return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = `部屋: ${text}, 朝食人数: ${guests}`;
    document.getElementById("guestList").appendChild(listItem);

    document.getElementById("scannedText").value = "";
    document.getElementById("guestCount").value = "";
  });
});