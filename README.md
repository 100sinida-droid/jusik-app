# 📊 STOCKHUB - 주식 투자 종합 대시보드

실시간 주식 정보를 한 눈에 확인할 수 있는 종합 대시보드입니다.

## 🎯 주요 기능

### 1. 실시간 시황 분석
- 코스피, 코스닥, S&P 500, 나스닥 지수 실시간 표시
- 거래량, 외국인/기관 매매 동향
- 자동 새로고침 기능

### 2. 오늘의 주목 종목
- 급등주 TOP 5
- 전문가 추천 종목
- 테마주 분석
- 탭 전환으로 다양한 종목 확인

### 3. 투자 전략 & 기법
- 차트 분석 가이드
- 가치투자 전략
- 손익 관리 방법
- 배당투자 정보

### 4. 실전 투자 라이브
- 포트폴리오 현황
- 실시간 매매 기록
- 수익률 추적

### 5. 주요 경제 이슈
- 금리, 환율 동향
- 산업별 뉴스
- 시장 분석 리포트

### 6. 초보자 투자 가이드
- 단계별 학습 프로그램
- 계좌 개설부터 첫 매수까지
- 학습 자료 모음

## 🚀 GitHub Pages 배포 방법

### 1. 저장소 생성
```bash
git init
git add .
git commit -m "Initial commit: Stock Dashboard"
```

### 2. GitHub에 푸시
```bash
git remote add origin https://github.com/YOUR_USERNAME/stock-dashboard.git
git branch -M main
git push -u origin main
```

### 3. GitHub Pages 설정
1. GitHub 저장소 페이지에서 Settings 탭 클릭
2. 왼쪽 메뉴에서 "Pages" 선택
3. Source에서 "Deploy from a branch" 선택
4. Branch는 "main"과 "/(root)" 선택
5. Save 클릭

### 4. 접속
약 1-2분 후 `https://YOUR_USERNAME.github.io/stock-dashboard/`에서 확인 가능합니다.

## 📁 파일 구조

```
stock-dashboard/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트 (사이버펑크 금융 테마)
├── script.js           # JavaScript 인터랙션
└── README.md           # 프로젝트 설명
```

## 🎨 디자인 특징

- **사이버펑크 금융 테마**: 네온 그라데이션과 미래지향적 디자인
- **Orbitron + Noto Sans KR 폰트**: 독특하고 가독성 높은 타이포그래피
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- **실시간 애니메이션**: 부드러운 전환 효과와 호버 인터랙션
- **다크 테마**: 눈의 피로를 줄이는 다크 모드

## ⌨️ 키보드 단축키

- `1-6`: 해당 섹션으로 빠르게 이동
- `Ctrl/Cmd + R`: 페이지 새로고침

## 🔧 커스터마이징

### 색상 변경
`styles.css` 파일의 `:root` 섹션에서 CSS 변수를 수정하세요:

```css
:root {
    --accent-primary: #00f0ff;    /* 메인 강조색 */
    --accent-secondary: #ff0099;  /* 보조 강조색 */
    --accent-tertiary: #ffaa00;   /* 3차 강조색 */
}
```

### 실시간 데이터 연동
`script.js`의 시뮬레이션 데이터를 실제 API로 교체하세요:

```javascript
// 예시: 실시간 주식 데이터 가져오기
async function fetchStockData() {
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    updateDashboard(data);
}
```

## 📝 주의사항

- 본 대시보드는 **교육 목적**으로 제작되었습니다.
- 표시되는 데이터는 시뮬레이션이며, 실제 투자에 사용하지 마세요.
- 실제 주식 거래는 공인된 증권사를 통해 진행하세요.

## 🛠 기술 스택

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Google Fonts (Orbitron, Noto Sans KR)

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🤝 기여

이슈나 풀 리퀘스트는 언제든 환영합니다!

---

**⚠️ 투자 유의사항**: 본 정보는 투자 참고용이며, 투자 판단의 책임은 투자자 본인에게 있습니다.
