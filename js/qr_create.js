// Include WanaKana for romaji to katakana conversion
const getSheetApiUrl = () => 'https://script.google.com/macros/s/AKfycbxlk6w8dPpztsopBPT6GqiEbNGz2ao9JTZyvXKArcDsX6lE2rA8Y-xifJ1bWddGxPfTIw/exec';
const wanakanaScript = document.createElement("script");
wanakanaScript.src = "https://unpkg.com/wanakana";
document.head.appendChild(wanakanaScript);

// Convert full-width katakana to half-width katakana (including voiced/semi-voiced marks)
function kanaFullToHalf(str){
    let kanaMap = {
        "ガ": "ｶﾞ", "ギ": "ｷﾞ", "グ": "ｸﾞ", "ゲ": "ｹﾞ", "ゴ": "ｺﾞ",
        "ザ": "ｻﾞ", "ジ": "ｼﾞ", "ズ": "ｽﾞ", "ゼ": "ｾﾞ", "ゾ": "ｿﾞ",
        "ダ": "ﾀﾞ", "ヂ": "ﾁﾞ", "ヅ": "ﾂﾞ", "デ": "ﾃﾞ", "ド": "ﾄﾞ",
        "バ": "ﾊﾞ", "ビ": "ﾋﾞ", "ブ": "ﾌﾞ", "ベ": "ﾍﾞ", "ボ": "ﾎﾞ",
        "パ": "ﾊﾟ", "ピ": "ﾋﾟ", "プ": "ﾌﾟ", "ペ": "ﾍﾟ", "ポ": "ﾎﾟ",
        "ヴ": "ｳﾞ", "ヷ": "ﾜﾞ", "ヺ": "ｦﾞ",
        "ア": "ｱ", "イ": "ｲ", "ウ": "ｳ", "エ": "ｴ", "オ": "ｵ",
        "カ": "ｶ", "キ": "ｷ", "ク": "ｸ", "ケ": "ｹ", "コ": "ｺ",
        "サ": "ｻ", "シ": "ｼ", "ス": "ｽ", "セ": "ｾ", "ソ": "ｿ",
        "タ": "ﾀ", "チ": "ﾁ", "ツ": "ﾂ", "テ": "ﾃ", "ト": "ﾄ",
        "ナ": "ﾅ", "ニ": "ﾆ", "ヌ": "ﾇ", "ネ": "ﾈ", "ノ": "ﾉ",
        "ハ": "ﾊ", "ヒ": "ﾋ", "フ": "ﾌ", "ヘ": "ﾍ", "ホ": "ﾎ",
        "マ": "ﾏ", "ミ": "ﾐ", "ム": "ﾑ", "メ": "ﾒ", "モ": "ﾓ",
        "ヤ": "ﾔ", "ユ": "ﾕ", "ヨ": "ﾖ",
        "ラ": "ﾗ", "リ": "ﾘ", "ル": "ﾙ", "レ": "ﾚ", "ロ": "ﾛ",
        "ワ": "ﾜ", "ヲ": "ｦ", "ン": "ﾝ",
        "ァ": "ｧ", "ィ": "ｨ", "ゥ": "ｩ", "ェ": "ｪ", "ォ": "ｫ",
        "ッ": "ｯ", "ャ": "ｬ", "ュ": "ｭ", "ョ": "ｮ",
        "。": "｡", "、": "､", "ー": "ｰ", "「": "｢", "」": "｣", "・": "･",
        "　": " "
    };
    let reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return str.replace(reg, function(s){
        return kanaMap[s];
    }).replace(/゛/g, 'ﾞ').replace(/゜/g, 'ﾟ');
}

wanakanaScript.onload = () => {
  const searchBtName = document.getElementById("searchBtName");
  if (searchBtName) {
    searchBtName.addEventListener("click", () => {
      if (!window.wanakana || !wanakana.toKatakana) {
        alert("wanakana error");
        return;
      }
      console.log("🧪 名前検索クリック");
      const baseInput = document.getElementById("name").value.trim();
      console.log("🔍 検索対象の入力:", baseInput);
      if (!baseInput) {
        alert("名前を入力してください。");
        return;
      }

      const fullKatakana = wanakana.toKatakana(baseInput);
      const halfKana = kanaFullToHalf(fullKatakana);
      const romajiInput = wanakana.toRomaji(baseInput);
      console.log("✅ kana:", fullKatakana);
      console.log("✅ halfKana:", halfKana);
      console.log("✅ romajiInput:", romajiInput);

      const searchTerms = Array.from(new Set([
        normalize(baseInput),
        halfKana, // use raw half-width kana instead of normalize
        normalize(romajiInput)
      ]));
      console.log("🔍 生成された検索語一覧:", searchTerms);

      pendingNameRequests = searchTerms.length;
      foundResults = [];

      searchTerms.forEach(term => {
        const script = document.createElement("script");
        script.src = `${getSheetApiUrl()}?callback=handleSearchResult&name=${encodeURIComponent(term)}`;
        document.body.appendChild(script);
      });
    });
  }

  // --- 部屋番号検索機能 追加 ---
  const searchBtRoom = document.getElementById("searchBtRoom");
  if (searchBtRoom) {
    searchBtRoom.addEventListener("click", () => {
      const baseInput = document.getElementById("room").value.trim();
      if (!baseInput) {
        alert("部屋番号を入力してください。");
        return;
      }

      console.log("🧪 部屋番号検索クリック");
      console.log("🔍 検索対象の部屋番号:", baseInput);

      const searchTerm = normalize(baseInput);
      const script = document.createElement("script");
      script.src = `${getSheetApiUrl()}?callback=handleRoomSearchResult&room=${encodeURIComponent(searchTerm)}`;
      document.body.appendChild(script);
    });
  }
};


// JSONP callback for upload responses
let pendingNameRequests = 0;
let foundResults = [];

function toHalfWidth(str) {
  // Convert full-width A-Z, a-z, 0-9 to half-width
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}

function toHalfWidthKana(str) {
  // Convert full-width katakana to half-width katakana
  return str.replace(/[\u30A1-\u30F6]/g, function(char) {
    const code = char.charCodeAt(0) - 0x60;
    return String.fromCharCode(code);
  });
}

const normalize = str => toHalfWidth(str).toLowerCase().replace(/\s+/g, "");

function fillFormWithData(data) {
  document.getElementById("name").value = data.name || "";
  document.getElementById("room").value = data.room || "";
  document.getElementById("checkIn").value = data.checkIn || "";
  document.getElementById("checkOut").value = data.checkOut || "";
  document.getElementById("guests").value = data.guestCount || "";
  document.getElementById("reservation").value = data.reservation || "";
  document.getElementById("breakfast").value = data.breakfastFlag === 1 ? "O" : data.breakfastFlag === 0 ? "X" : "";
}

window.handleSearchResult = function(response) {
  console.log("🔍 検索結果:", response);
  pendingNameRequests--;

  const data = response.success ? (response.matches || []) : [];
  if (response.success && data.length > 0) {
    foundResults.push(...data);
  }

  if (pendingNameRequests === 0) {
    if (foundResults.length === 0) {
      alert("一致する名前が見つかりませんでした。");
      return;
    }

    if (foundResults.length === 1) {
      fillFormWithData(foundResults[0]);
    } else {
      const nameOptions = foundResults.map((item, index) =>
        `${index + 1}: ${item.name}, ${item.checkIn}, ${item.checkOut}, ${item.reservation}`
      ).join("\n");
      const selected = prompt(`複数の一致が見つかりました。番号を選んでください:\n${nameOptions}`);
      const selectedIndex = parseInt(selected, 10) - 1;
      if (!isNaN(selectedIndex) && foundResults[selectedIndex]) {
        fillFormWithData(foundResults[selectedIndex]);
      }
    }

    // Reset after handling
    foundResults = [];
  }
};

// JSONP callback for upload responses
window.handleJsonpResponse = function(response) {
  console.log("📥 アップロード結果:", response);
  if (response.debug) {
    console.log("📊 combined:", response.debug.combined);
    console.log("📊 expected:", response.debug.expected);
  }
  // You can handle post-upload feedback here if needed
};

// QRコード検証のJSONPコールバック
window.handleVerifyResponse = function(response) {
  console.log("🔍 QRコード検証結果:", response);
  if (!response || typeof response.isValid === "undefined") {
    alert("QRコードの検証に失敗しました。");
    return;
  }
  if (response.isValid) {
    // 朝食フラグで分岐
    if (response.breakfastFlag === 1) {
      alert("✅ QRコードが確認されました。");

      // ✅ 朝食人数入力テーブルを表示
      const start = new Date(response.checkIn);
      const end = new Date(response.checkOut);
      const container = document.getElementById("breakfastCheckTable");
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
      alert("Room Onlyの部屋です。");
    }
  } else {
    alert("QRコードが無効です。");
  }
};

// 部屋番号検索のJSONPコールバック
window.handleRoomSearchResult = function(response) {
  console.log("🔍 部屋番号検索結果:", response);
  if (!response.success || !response.matches || response.matches.length === 0) {
    alert("一致する部屋番号が見つかりませんでした。");
    return;
  }

  if (response.matches.length === 1) {
    fillFormWithData(response.matches[0]);
  } else {
    const roomOptions = response.matches.map((item, index) =>
      `${index + 1}: ${item.room}, ${item.name}, ${item.checkIn}, ${item.checkOut}, ${item.reservation}`
    ).join("\n");
    const selected = prompt(`複数の一致が見つかりました。番号を選んでください:\n${roomOptions}`);
    const selectedIndex = parseInt(selected, 10) - 1;
    if (!isNaN(selectedIndex) && response.matches[selectedIndex]) {
      fillFormWithData(response.matches[selectedIndex]);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const SHEET_NAME_SEARCH_API = getSheetApiUrl();

    // ✅ チェックイン日を本日の日付に設定
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById("checkIn").value = `${yyyy}-${mm}-${dd}`;

  
    const form = document.getElementById("qrForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name")?.value.trim() || "";
      const room = document.getElementById("room").value.trim() || "";
      const checkIn = document.getElementById("checkIn").value || "";
      const checkOut = document.getElementById("checkOut").value || "";
      const guests = document.getElementById("guests").value || "";
      const reservation = document.getElementById("reservation").value.trim() || "";
      const breakfast = document.getElementById("breakfast")?.value.trim() || "";

      let days = "";
      if (checkIn && checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkOutDate <= checkInDate) {
          alert("チェックアウト日はチェックイン日より後に設定してください。");
          return;
        }
        const diffTime = checkOutDate - checkInDate;
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const data = `${room},${checkIn},${checkOut},${days},${guests},${reservation}`;
      const secret = "HOTEL_ONLY_SECRET_KEY";

      const hash = await sha256(data + secret);
      const qrText = `${data},${hash.slice(0, 8)}`;

      // ✅ 텍스트 정보 표시
      const textInfo = `Room : ${room}<br>Check-in : ${checkIn}<br>Check-out : ${checkOut}(~10:00)<br>Guests : ${guests}<br>Breakfast : ${breakfast}<br>Booking No : ${reservation}`;
      document.getElementById("qrTextInfo").innerHTML = textInfo;

      // ✅ QR 코드 생성 (작게)
      const qrResult = document.getElementById("qrResult");
      qrResult.innerHTML = "";
      new QRCode(qrResult, {
        text: qrText,
        width: 120,
        height: 120,
        correctLevel: QRCode.CorrectLevel.L
      });
    });
  
    // ✅ Enter 키 입력 시 키보드 닫기
    document.getElementById("guests").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // submit 방지
        e.target.blur(); // 키보드 닫기
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
        active.blur();
      }
    });
  
  // ✅ 파일 선택 후 input 초기화 (같은 파일도 다시 선택 가능)
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        const csvText = e.target.result;

        console.log("📄 원본 CSV 미리보기:", csvText.slice(0, 500));

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: async function (results) {
            const rows = results.data;

            const compacted = await Promise.all(rows
              .filter(row => row["ステータス"] !== "キャンセル")
              .map(async row => {
                const fullReservation = row["booking_no"]?.trim() || row["#予約番号"]?.trim() || "";
                const reservation = fullReservation.split(/[-_]/)[0];
                let rawRoom = row["room"]?.trim() || row["部屋名"]?.trim() || "";
                const room = rawRoom.match(/\d{1,3}/)?.[0] || "";
                const reserver = row["name"]?.trim() || row["予約者"]?.trim() || "";
                const checkInRaw = row["check_in"]?.trim() || row["C/I"]?.trim() || "";
                const checkOutRaw = row["check_out"]?.trim() || row["C/O"]?.trim() || "";
                const formatDate = (raw) => {
                  const dateObj = new Date(raw);
                  return isNaN(dateObj) ? "" : dateObj.toISOString().slice(0, 10);
                };
                const checkIn = formatDate(checkInRaw);
                const checkOut = formatDate(checkOutRaw);

                const guestCount = parseInt(row["guest_no"] || row["大人人数"] || "0", 10);
                const breakfastFlag = row["breakfast"] !== undefined
                  ? parseInt(row["breakfast"])
                  : (row["プラン名"]?.toLowerCase().includes("room only") ? 0 : 1);

                const hashData = `${room},${checkIn},${checkOut},${checkOut && checkIn ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : ""},${guestCount},${reservation}`;
                const secret = "HOTEL_ONLY_SECRET_KEY";
                const hash = await sha256(hashData + secret);

                let searchName = reserver;
                if (window.wanakana) {
                  if (/^[\x00-\x7F\s]+$/.test(reserver)) {
                    searchName = wanakana.toRomaji(reserver).toLowerCase();
                  } else {
                    searchName = wanakana.toKatakana(reserver, { IMEMode: true });
                  }
                }
                return [reservation, room, reserver, checkIn, checkOut, guestCount, breakfastFlag, searchName, hash.slice(0, 8)];
              }));

            console.log("📊 JSONP 전送用 문자열 배열 (with searchName):", compacted);
            const CHUNK_SIZE = 30;
            const expectedCount = compacted.length;
            const SHEET_API_URL = getSheetApiUrl();
            const uploadTimestamp = new Date().toISOString();

            // --- 1. Clear sheet before uploading chunks (command-based) ---
            const commandScript = document.createElement("script");
            commandScript.src = `${SHEET_API_URL}?callback=handleCommandResponse&command=clear&timestamp=${encodeURIComponent(uploadTimestamp)}`;
            document.body.appendChild(commandScript);

            window.handleCommandResponse = function(response) {
              if (response.success && response.cleared) {
                const chunks = [];
                for (let i = 0; i < compacted.length; i += CHUNK_SIZE) {
                  chunks.push(compacted.slice(i, i + CHUNK_SIZE));
                }
                uploadCsvChunksSequentially(chunks, 0, uploadTimestamp, SHEET_API_URL);
              } else {
                console.error("❌ clear command 실패", response);
              }
            };
          }
        });
      };

      reader.readAsText(file, 'shift-jis'); // Use JIS encoding for Japanese CSV
    });
  }
});
// Helper to upload CSV in chunks sequentially
function uploadCsvChunksSequentially(chunks, index = 0, uploadTimestamp, SHEET_API_URL) {
  if (index >= chunks.length) return;

  const chunk = chunks[index];
  const csvChunk = chunk.map(row => row.join(',')).join(';');
  const script = document.createElement("script");
  script.src = `${SHEET_API_URL}?callback=uploadChunkCallback&csv=${encodeURIComponent(csvChunk)}&timestamp=${encodeURIComponent(uploadTimestamp)}`;
  document.body.appendChild(script);

  window.uploadChunkCallback = function(response) {
    console.log(`✅ 청크 ${index + 1} 업로드 완료`, response);
    uploadCsvChunksSequentially(chunks, index + 1, uploadTimestamp, SHEET_API_URL);
  };
}