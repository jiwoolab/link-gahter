# 🔐 인터넷 안전 탈출 작전 — 멀티플레이

게더타운 스타일 2D 멀티플레이 교육 웹게임
초등학생 20명 동시 접속 · Socket.IO 기반

---

## 📂 폴더 구조

다운로드한 파일을 아래처럼 배치하세요:

```
📁 gather-edu/          ← 새 폴더 생성
├── server.js
├── package.json
├── README.md
└── 📁 public/          ← public 폴더 직접 만들어야 함!
    └── index.html
```

> ⚠️ **index.html 은 반드시 `public` 폴더 안에** 넣어야 해요!

---

## 🚀 실행 방법

### 1단계: Node.js 설치 확인
```bash
node --version   # v16 이상 필요
npm --version
```
Node.js가 없으면 → https://nodejs.org 에서 설치

### 2단계: 라이브러리 설치 (최초 1회)
```bash
cd gather-edu
npm install
```
`node_modules` 폴더가 생기면 성공!

### 3단계: 서버 시작
```bash
node server.js
```

성공하면 아래처럼 표시돼요:
```
====================================
  🎮 인터넷 안전 탈출 작전 서버
====================================
  주소: http://localhost:3000
  최대: 20명
  [Ctrl+C] 로 종료
====================================
```

### 4단계: 접속

- **선생님(서버 컴퓨터)**: http://localhost:3000
- **학생들**: http://[선생님IP]:3000

선생님 IP 확인 방법:
- Windows: `ipconfig` → IPv4 주소
- Mac/Linux: `ifconfig` 또는 `ip addr`

---

## ❗ 자주 발생하는 오류

| 오류 메시지 | 원인 | 해결 |
|---|---|---|
| `Cannot find module 'express'` | npm install 안 함 | `npm install` 실행 |
| `Error: listen EADDRINUSE` | 포트 3000 사용 중 | 자동으로 3001 시도 |
| `Cannot GET /` | index.html 위치 오류 | `public/` 폴더 안에 넣기 |
| 브라우저에서 빈 화면 | 서버 미실행 | `node server.js` 실행 |

---

## 🎮 게임 방법

1. 브라우저로 접속
2. 닉네임 입력 + 아바타 선택
3. 방향키(↑↓←→) 또는 WASD로 이동
4. 오브젝트 근처에서 **스페이스바** 또는 **클릭** → 미션 시작
5. 4개 미션 완료 → 탈출문 열림!

### 미션 목록
- 💻 컴퓨터 → 안전한 링크 찾기
- 📱 스마트폰 → 개인정보 보호
- 🔒 금고 → 비밀번호 지키기
- 💬 게시판 → 사이버 폭력 막기

---

## 🖥️ 기술 스택

- **서버**: Node.js + Express + Socket.IO
- **클라이언트**: HTML5 Canvas + JavaScript
- **통신**: WebSocket (Socket.IO)
- **최대 접속**: 20명
