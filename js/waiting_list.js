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

  let count = 1;

  const submitBtn = document.getElementById("searchButton");
  submitBtn.addEventListener("click", () => {
    const text = document.getElementById("qrResult").value.trim();
    if (!text) {
      alert("部屋番号を入力してください。");
      return;
    }

    window.currentRoomText = text; // store room info globally
    document.getElementById("customPromptOverlay").style.display = "flex"; // show modal
  });

  // ✅ Enter 키 입력 시 검색 버튼 클릭 실행 (keydown과 keypress 모두 사용하여 iPad 호환성 개선)
  ["keydown", "keypress"].forEach(eventType => {
    document.addEventListener(eventType, (e) => {
      if ((e.key === "Enter" || e.key === "Return") &&
          document.activeElement?.id === "qrResult") {
        e.preventDefault();
        document.getElementById("searchButton").click();
      }
    });
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

  // ✅ 입력 필드 포커스/포커스아웃 시 스크롤 제어 개선
  let lastScrollY = 0;

  document.addEventListener("focusin", () => {
    lastScrollY = window.scrollY;
  });

  document.addEventListener("focusout", () => {
    setTimeout(() => {
      // 키보드 내려간 뒤에도 수동 스크롤한 적 없으면 복원
      if (window.scrollY > lastScrollY + 50) return; // 사용자가 직접 내린 경우 건드리지 않음
      window.scrollTo({ top: lastScrollY, behavior: "smooth" });
    }, 200);
  });
  // --- Helper functions for custom guest count modal ---
  window.submitGuestCount = function() {
    const guests = document.getElementById("guestCountInput").value;
    if (!guests) {
      alert("人数を入力してください。");
      return;
    }

    const text = window.currentRoomText || "";
    const button = document.createElement("button");
    button.textContent = `${text}号 ${guests}名`;
    button.onclick = () => {
      alert(`"${text}" (${guests}名) ボタンがクリックされました`);
    };

    const listContainer = document.getElementById("List");
    listContainer.appendChild(button);

    document.getElementById("qrResult").value = "";
    document.getElementById("guestCountInput").value = "";
    document.getElementById("customPromptOverlay").style.display = "none";
  };

  window.closeCustomPrompt = function() {
    document.getElementById("customPromptOverlay").style.display = "none";
    document.getElementById("guestCountInput").value = "";
  };
});