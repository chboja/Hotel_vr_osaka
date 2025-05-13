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

  // ✅ Enter 키 입력 시 키보드 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement &&
        (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
      e.preventDefault(); // submit 방지
      document.activeElement.blur(); // 키보드 닫기
    }
  });

  // ✅ 입력 외의 영역을 터치하면 키보드 닫기
  document.addEventListener("touchstart", (e) => {
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      !e.target.closest("input") &&
      !e.target.closest("textarea")
    ) {
      // Delay blur slightly to ensure compatibility with iPadOS event processing
      setTimeout(() => {
        active.blur();
      }, 50);
    }
  });
});