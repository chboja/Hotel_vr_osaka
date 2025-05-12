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
});