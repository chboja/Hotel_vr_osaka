body {
  font-family: sans-serif;
  margin: 0;
  padding: 20px;
  background: #f4f4f4;
  display: flex;
  justify-content: center;
  height: 100vh;
  box-sizing: border-box;
}

.container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 20px;
  height: 100%;
}

.scanner-section,
.list-section {
  flex: 1;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-reader {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
  margin-top: 10px;
}

.input-group input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  line-height: 1.5;
  height: 40px;
  box-sizing: border-box;
}

.input-group button {
  height: 40px;
  padding: 0 20px;
  background-color: #2e86de;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.input-group button:hover {
  background-color: #1b4f9c;
}

#waitingList {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
  list-style: none;
  padding: 0;
}

#waitingList li {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
}