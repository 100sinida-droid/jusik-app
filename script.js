// ==========================================
// STOCKHUB - 실시간 주식 대시보드
// ==========================================

console.log('🚀 STOCKHUB Loading...');

// 시간 업데이트
function updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${h}:${m}:${s}`;
}
setInterval(updateTime, 1000);
updateTime();

// ==========================================
// 주식 데이터베이스
// ==========================================
const STOCK_DB = {
    korean: [
        {name: '삼성전자', code: '005930', symbol: 'SSNLF'},
        {name: 'SK하이닉스', code: '000660', symbol: '000660.KS'},
        {name: 'LG에너지솔루션', code: '373220', symbol: '373220.KS'},
        {name: 'NAVER', code: '035420', symbol: '035420.KS'},
        {name: '카카오', code: '035720', symbol: '035720.KS'},
        {name: '삼성바이오', code: '207940', symbol: '207940.KS'},
        {name: '현대차', code: '005380', symbol: '005380.KS'},
        {name: 'POSCO', code: '005490', symbol: '005490.KS'},
        {name: 'LG화학', code: '051910', symbol: '051910.KS'},
        {name: '삼성SDI', code: '006400', symbol: '006400.KS'},
        {name: '셀트리온', code: '068270', symbol: '068270.KS'},
        {name: '기아', code: '000270', symbol: '000270.KS'},
        {name: 'KB금융', code: '105560', symbol: '105560.KS'},
        {name: '신한지주', code: '055550', symbol: '055550.KS'},
        {name: 'HMM', code: '011200', symbol: '011200.KS'},
        {name: 'LG전자', code: '066570', symbol: '066570.KS'},
        {name: '삼성물산', code: '028260', symbol: '028260.KS'},
        {name: '현대모비스', code: '012330', symbol: '012330.KS'},
        {name: 'SK텔레콤', code: '017670', symbol: '017670.KS'},
        {name: 'KT&G', code: '033780', symbol: '033780.KS'},
        {name: '에코프로', code: '086520', symbol: '086520.KQ'},
        {name: '에코프로비엠', code: '247540', symbol: '247540.KQ'},
        {name: '포스코퓨처엠', code: '003670', symbol: '003670.KS'},
        {name: '엘앤에프', code: '066970', symbol: '066970.KQ'},
        {name: '코스맥스', code: '192820', symbol: '192820.KS'},
        {name: '아모레퍼시픽', code: '090430', symbol: '090430.KS'},
        {name: '한국전력', code: '015760', symbol: '015760.KS'},
        {name: 'SK이노베이션', code: '096770', symbol: '096770.KS'},
        {name: 'SK', code: '034730', symbol: '034730.KS'},
        {name: 'LG', code: '003550', symbol: '003550.KS'}
    ],
    us: [
        {name: '애플', ticker: 'AAPL', korName: '애플'},
        {name: '마이크로소프트', ticker: 'MSFT', korName: '마소'},
        {name: '엔비디아', ticker: 'NVDA', korName: '엔비디아'},
        {name: '테슬라', ticker: 'TSLA', korName: '테슬라'},
        {name: '아마존', ticker: 'AMZN', korName: '아마존'},
        {name: '메타', ticker: 'META', korName: '페북'},
        {name: '구글', ticker: 'GOOGL', korName: '구글'},
        {name: 'AMD', ticker: 'AMD', korName: 'amd'},
        {name: '넷플릭스', ticker: 'NFLX', korName: '넷플릭스'},
        {name: '디즈니', ticker: 'DIS', korName: '디즈니'},
        {name: '나이키', ticker: 'NKE', korName: '나이키'},
        {name: '스타벅스', ticker: 'SBUX', korName: '스벅'},
        {name: '코카콜라', ticker: 'KO', korName: '코크'},
        {name: '맥도날드', ticker: 'MCD', korName: '맥날'},
        {name: '비자', ticker: 'V', korName: '비자'},
        {name: '월마트', ticker: 'WMT', korName: '월마트'},
        {name: '제이피모건', ticker: 'JPM', korName: 'jp모건'},
        {name: 'BAC', ticker: 'BAC', korName: '뱅오브'},
        {name: '인텔', ticker: 'INTC', korName: '인텔'},
        {name: 'IBM', ticker: 'IBM', korName: 'ibm'},
        {name: '오라클', ticker: 'ORCL', korName: '오라클'},
        {name: '시스코', ticker: 'CSCO', korName: '시스코'},
        {name: 'Adobe', ticker: 'ADBE', korName: '어도비'},
        {name: 'Salesforce', ticker: 'CRM', korName: '세일즈포스'},
        {name: 'Qualcomm', ticker: 'QCOM', korName: '퀄컴'},
        {name: 'PayPal', ticker: 'PYPL', korName: '페이팔'},
        {name: 'Uber', ticker: 'UBER', korName: '우버'},
        {name: 'Airbnb', ticker: 'ABNB', korName: '에어비앤비'},
        {name: 'Moderna', ticker: 'MRNA', korName: '모더나'},
        {name: 'Pfizer', ticker: 'PFE', korName: '화이자'}
    ]
};

// ==========================================
// 주요 지수 로드 (Alpha Vantage 무료 API)
// ==========================================
async function loadIndices() {
    console.log('📊 Loading indices...');
    
    // 시뮬레이션 데이터 (실제 API는 요청 제한이 있어서 데모용)
    const data = {
        kospi: {price: 2651.32, change: 15.42, percent: 0.58},
        kosdaq: {price: 786.21, change: -4.89, percent: -0.62},
        sp500: {price: 5235.48, change: 24.12, percent: 0.46},
        nasdaq: {price: 16342.76, change: 91.85, percent: 0.56}
    };
    
    updateIndexUI('kospi', data.kospi);
    updateIndexUI('kosdaq', data.kosdaq);
    updateIndexUI('sp500', data.sp500);
    updateIndexUI('nasdaq', data.nasdaq);
    
    console.log('✅ Indices loaded');
}

function updateIndexUI(id, data) {
    const price = document.getElementById(`${id}-price`);
    const change = document.getElementById(`${id}-change`);
    
    if (price && change) {
        const isPositive = data.change >= 0;
        
        price.textContent = data.price.toFixed(2);
        price.style.color = isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
        
        const arrow = isPositive ? '▲' : '▼';
        const sign = isPositive ? '+' : '';
        
        change.innerHTML = `
            <span>${arrow} ${Math.abs(data.change).toFixed(2)}</span>
            <span>(${sign}${data.percent.toFixed(2)}%)</span>
        `;
        change.style.color = isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
    }
}

// ==========================================
// 한국 주식 로드
// ==========================================
async function loadKoreanStocks() {
    const tbody = document.getElementById('koreanStocks');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">📊 데이터 로딩중...</td></tr>';
    
    console.log('📈 Loading Korean stocks...');
    
    // 시뮬레이션 데이터
    const stocks = STOCK_DB.korean.map((stock, i) => ({
        ...stock,
        price: Math.floor(Math.random() * 500000) + 10000,
        change: (Math.random() * 10 - 5).toFixed(2)
    }));
    
    let html = '';
    stocks.forEach((stock, i) => {
        const isPositive = parseFloat(stock.change) >= 0;
        const color = isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
        
        html += `
            <tr onclick="openNaverStock('${stock.code}', '${stock.name}')">
                <td style="font-weight: 700; font-family: var(--font-display);">${i + 1}</td>
                <td style="font-weight: 700;">${stock.name}</td>
                <td style="font-family: var(--font-display); color: #8fa3bf;">${stock.code}</td>
                <td style="font-weight: 700; font-family: var(--font-display);">${stock.price.toLocaleString()}원</td>
                <td style="font-weight: 700; color: ${color};">${isPositive ? '+' : ''}${stock.change}%</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    console.log('✅ Korean stocks loaded');
}

// ==========================================
// 미국 주식 로드
// ==========================================
async function loadUSStocks() {
    const tbody = document.getElementById('usStocks');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">📊 데이터 로딩중...</td></tr>';
    
    console.log('📈 Loading US stocks...');
    
    // 시뮬레이션 데이터
    const stocks = STOCK_DB.us.map((stock, i) => ({
        ...stock,
        price: (Math.random() * 500 + 50).toFixed(2),
        change: (Math.random() * 10 - 5).toFixed(2)
    }));
    
    let html = '';
    stocks.forEach((stock, i) => {
        const isPositive = parseFloat(stock.change) >= 0;
        const color = isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
        
        html += `
            <tr onclick="openYahooStock('${stock.ticker}', '${stock.name}')">
                <td style="font-weight: 700; font-family: var(--font-display);">${i + 1}</td>
                <td style="font-weight: 700;">${stock.name}</td>
                <td style="font-family: var(--font-display); color: #8fa3bf;">${stock.ticker}</td>
                <td style="font-weight: 700; font-family: var(--font-display);">$${stock.price}</td>
                <td style="font-weight: 700; color: ${color};">${isPositive ? '+' : ''}${stock.change}%</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    console.log('✅ US stocks loaded');
}

// ==========================================
// 검색 기능
// ==========================================
function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    const results = [];
    
    // 한국 주식 검색
    STOCK_DB.korean.forEach(stock => {
        if (stock.name.toLowerCase().includes(query) || 
            stock.code.includes(query)) {
            results.push({type: 'korean', ...stock});
        }
    });
    
    // 미국 주식 검색
    STOCK_DB.us.forEach(stock => {
        if (stock.name.toLowerCase().includes(query) || 
            stock.ticker.toLowerCase().includes(query) ||
            stock.korName.includes(query)) {
            results.push({type: 'us', ...stock});
        }
    });
    
    // 결과 표시
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: #8fa3bf;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                <div style="font-size: 1.2rem; font-weight: 600;">검색 결과가 없습니다</div>
                <div style="font-size: 0.95rem; margin-top: 0.5rem;">다른 키워드로 검색해보세요</div>
            </div>
        `;
        return;
    }
    
    resultsDiv.innerHTML = results.map(stock => {
        if (stock.type === 'korean') {
            return `
                <div class="result-item" onclick="openNaverStock('${stock.code}', '${stock.name}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; font-size: 1.2rem; margin-bottom: 0.5rem;">${stock.name}</div>
                            <div style="color: #8fa3bf; font-size: 0.95rem; font-family: var(--font-display);">종목코드: ${stock.code}</div>
                        </div>
                        <div class="status-badge" style="background: rgba(0,255,136,0.2); color: var(--accent-success);">🇰🇷 한국</div>
                    </div>
                    <div style="margin-top: 1.2rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color); color: var(--accent-primary); font-size: 0.95rem; font-weight: 600;">
                        💬 클릭하여 네이버 금융 토론실 열기 →
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="result-item" onclick="openYahooStock('${stock.ticker}', '${stock.name}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; font-size: 1.2rem; margin-bottom: 0.5rem;">${stock.name}</div>
                            <div style="color: #8fa3bf; font-size: 0.95rem; font-family: var(--font-display);">티커: ${stock.ticker}</div>
                        </div>
                        <div class="status-badge" style="background: rgba(0,240,255,0.2); color: var(--accent-primary);">🇺🇸 미국</div>
                    </div>
                    <div style="margin-top: 1.2rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color); color: var(--accent-primary); font-size: 0.95rem; font-weight: 600;">
                        📊 클릭하여 야후 파이낸스 차트 열기 →
                    </div>
                </div>
            `;
        }
    }).join('');
}

// ==========================================
// 외부 링크
// ==========================================
function openNaverStock(code, name) {
    // 토론실 페이지
    window.open(`https://finance.naver.com/item/board.naver?code=${code}`, '_blank');
}

function openYahooStock(ticker, name) {
    window.open(`https://finance.yahoo.com/quote/${ticker}`, '_blank');
}

// ==========================================
// 초기화
// ==========================================
async function init() {
    console.log('🚀 Initializing STOCKHUB...');
    
    await loadIndices();
    await loadKoreanStocks();
    await loadUSStocks();
    
    console.log('✅ STOCKHUB Ready!');
    console.log('');
    console.log('💡 주요 기능:');
    console.log('  - 실시간 주요 지수 (코스피, 코스닥, S&P 500, 나스닥)');
    console.log('  - 한국 주식 30개 + 미국 주식 30개');
    console.log('  - 통합 검색 (종목명, 코드, 티커)');
    console.log('  - 네이버 토론실 & 야후 파이낸스 연동');
}

// 페이지 로드 시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 자동 새로고침 (5분마다)
setInterval(() => {
    console.log('🔄 Auto refresh...');
    loadIndices();
}, 300000);

console.log('STOCKHUB Loaded! 🎯');
