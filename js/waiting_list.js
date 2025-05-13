function onScanSuccess(decodedText, decodedResult) {
  console.log(`✅ QRコードスキャン成功: ${decodedText}`);
  document.getElementById("qrResult").value = decodedText;
}

document.addEventListener("DOMContentLoaded", () => {
  const qrResult = document.getElementById("qrResult");
  const qrRegionId = "reader";
  const html5QrCode = new Html5Qrcode(qrRegionId);

  function onScanSuccess(decodedText, decodedResult) {
    console.log(`✅ QRコードスキャン成功: ${decodedText}`);
    qrResult.value = decodedText;
    html5QrCode.stop().catch(err => console.error("Failed to stop scanner:", err));
  }

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length > 0) {
      html5QrCode.start(
        { facingMode: "user" },
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

  const submitBtn = document.getElementById("searchButton");
  submitBtn.addEventListener("click", () => {
    const text = document.getElementById("qrResult").value.trim();
    const guests = prompt("朝食を取る人数を入力してください。");
    if (!text || !guests) {
      alert("QR情報と人数を入力してください。");
      return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = `部屋: ${text}, 朝食人数: ${guests}`;
    document.getElementById("waitingList").appendChild(listItem);

    document.getElementById("qrResult").value = "";
  });
});