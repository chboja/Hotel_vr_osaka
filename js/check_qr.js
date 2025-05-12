document.addEventListener("DOMContentLoaded", () => {
  const qrResult = document.getElementById("qrResult");
  const qrRegionId = "preview";

  const html5QrCode = new Html5Qrcode(qrRegionId);

  function onScanSuccess(decodedText, decodedResult) {
    qrResult.value = decodedText;
    html5QrCode.stop().catch(err => console.error("Failed to stop scanner:", err)); // スキャン後停止
  }

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const backCamera = devices.find(device => /back|rear/i.test(device.label)) || devices[0];
      const cameraId = backCamera.id;
      document.getElementById(qrRegionId).innerHTML = "";
      html5QrCode.start(cameraId, {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      }, onScanSuccess);
    } else {
      qrResult.value = "カメラが見つかりませんでした。";
    }
  }).catch(err => {
    console.error("Camera initialization error:", err);
    qrResult.value = "カメラの初期化に失敗しました。";
  });
});