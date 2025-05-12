document.addEventListener("DOMContentLoaded", () => {
  const qrResult = document.getElementById("qrResult");
  const qrRegionId = "preview";

  const html5QrCode = new Html5Qrcode(qrRegionId);

  function onScanSuccess(decodedText, decodedResult) {
    qrResult.value = decodedText;
    html5QrCode.stop().catch(err => console.error("Failed to stop scanner:", err)); // スキャン後停止
  }

  html5QrCode.start(
    { facingMode: { exact: "environment" } },
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    onScanSuccess
  ).catch(err => {
    console.error("Camera initialization error:", err);
    qrResult.value = "カメラの初期化に失敗しました。";
  });
});