// ========================================
// 실시간 주식 대시보드
// ========================================

console.log('🚀 Stock Dashboard Loading...');

// 시간 업데이트
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

updateTime();
setInterval(updateTime, 1000);

// ========================================
// 주식 데이터베이스 (검색용)
// ========================================
const stockDatabase = {
    korean: [
        { name: '삼성전자', code: '005930', keywords: ['삼성', '전자', 'samsung'] },
        { name: 'SK하이닉스', code: '000660', keywords: ['sk', '하이닉스', 'hynix'] },
        { name: 'LG에너지솔루션', code: '373220', keywords: ['lg', '에너지', '솔루션', 'energy'] },
        { name: '삼성바이오로직스', code: '207940', keywords: ['삼성', '바이오', 'bio'] },
        { name: '현대차', code: '005380', keywords: ['현대', '자동차', 'hyundai'] },
        { name: 'POSCO홀딩스', code: '005490', keywords: ['포스코', 'posco', '철강'] },
        { name: 'LG화학', code: '051910', keywords: ['lg', '화학', 'chem'] },
        { name: '삼성SDI', code: '006400', keywords: ['삼성', 'sdi', '배터리'] },
        { name: 'NAVER', code: '035420', keywords: ['네이버', 'naver'] },
        { name: '카카오', code: '035720', keywords: ['kakao', '카톡'] },
        { name: '셀트리온', code: '068270', keywords: ['celltrion', '바이오'] },
        { name: '기아', code: '000270', keywords: ['kia', '자동차'] },
        { name: 'KB금융', code: '105560', keywords: ['kb', '금융', '은행'] },
        { name: '신한지주', code: '055550', keywords: ['신한', '금융', '은행'] },
        { name: 'HMM', code: '011200', keywords: ['해운', 'shipping'] },
        { name: '에코프로비엠', code: '247540', keywords: ['에코프로', '2차전지'] },
        { name: '포스코퓨처엠', code: '003670', keywords: ['포스코', '2차전지'] },
        { name: '엘앤에프', code: '066970', keywords: ['2차전지'] },
        { name: 'SK이노베이션', code: '096770', keywords: ['sk', '이노베이션', '배터리'] },
        { name: 'LG전자', code: '066570', keywords: ['lg', '전자'] }
    ],
    us: [
        { name: '애플', ticker: 'AAPL', keywords: ['apple', 'aapl', '애플'] },
        { name: '마이크로소프트', ticker: 'MSFT', keywords: ['microsoft', 'msft', 'ms', '마소'] },
        { name: '엔비디아', ticker: 'NVDA', keywords: ['nvidia', 'nvda', '엔비디아'] },
        { name: '테슬라', ticker: 'TSLA', keywords: ['tesla', 'tsla', '테슬라'] },
        { name: '아마존', ticker: 'AMZN', keywords: ['amazon', 'amzn', '아마존'] },
        { name: '메타', ticker: 'META', keywords: ['meta', 'facebook', '페이스북', '메타'] },
        { name: '알파벳', ticker: 'GOOGL', keywords: ['alphabet', 'google', 'googl', '구글'] },
        { name: '버크셔해서웨이', ticker: 'BRK.B', keywords: ['berkshire', 'brk', '버핏'] },
        { name: 'AMD', ticker: 'AMD', keywords: ['amd'] },
        { name: '인텔', ticker: 'INTC', keywords: ['intel', 'intc', '인텔'] },
        { name: '넷플릭스', ticker: 'NFLX', keywords: ['netflix', 'nflx', '넷플릭스'] },
        { name: '코카콜라', ticker: 'KO', keywords: ['coca', 'cola', 'ko', '코카콜라'] },
        { name: '디즈니', ticker: 'DIS', keywords: ['disney', 'dis', '디즈니'] },
        { name: '나이키', ticker: 'NKE', keywords: ['nike', 'nke', '나이키'] },
        { name: '맥도날드', ticker: 'MCD', keywords: ['mcdonald', 'mcd', '맥도날드'] },
        { name: '스타벅스', ticker: 'SBUX', keywords: ['starbucks', 'sbux', '스타벅스'] },
        { name: '비자', ticker: 'V', keywords: ['visa', 'v', '비자'] },
        { name: '마스터카드', ticker: 'MA', keywords: ['mastercard', 'ma', '마스터카드'] },
        { name: '월마트', ticker: 'WMT', keywords: ['walmart', 'wmt', '월마트'] },
        { name: '제이피모건', ticker: 'JPM', keywords: ['jpmorgan', 'jpm', '제이피모건'] }
    ]
};

// ========================================
// 주식 검색 기능
// ========================================
function searchStocks(event) {
    const query = document.getElementById('stockSearchInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    const results = [];
    
    // 한국 주식 검색
    stockDatabase.korean.forEach(stock => {
        const matchName = stock.name.toLowerCase().includes(query);
        const matchCode = stock.code.includes(query);
        const matchKeywords = stock.keywords.some(kw => kw.includes(query));
        
        if (matchName || matchCode || matchKeywords) {
            results.push({
                type: 'korean',
                ...stock
            });
        }
    });
    
    // 미국 주식 검색
    stockDatabase.us.forEach(stock => {
        const matchName = stock.name.toLowerCase().includes(query);
        const matchTicker = stock.ticker.toLowerCase().includes(query);
        const matchKeywords = stock.keywords.some(kw => kw.includes(query));
        
        if (matchName || matchTicker || matchKeywords) {
            results.push({
                type: 'us',
                ...stock
            });
        }
    });
    
    // 결과 표시
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #8fa3bf;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <div>검색 결과가 없습니다.</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem;">다른 키워드로 검색해보세요.</div>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = results.map(stock => {
            if (stock.type === 'korean') {
                return `
                    <div class="result-item" onclick="openNaverDiscussion('${stock.code}', '${stock.name}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.3rem;">${stock.name}</div>
                                <div style="color: #8fa3bf; font-size: 0.9rem; font-family: var(--font-display);">${stock.code}</div>
                            </div>
                            <div style="padding: 0.5rem 1rem; background: rgba(0,255,136,0.2); border-radius: 6px; color: var(--accent-success); font-weight: 700;">🇰🇷 한국</div>
                        </div>
                        <div style="margin-top: 1rem; color: var(--accent-primary); font-size: 0.9rem;">📱 클릭하여 네이버 토론실 열기 →</div>
                    </div>
                `;
            } else {
                return `
                    <div class="result-item" onclick="openYahooFinance('${stock.ticker}', '${stock.name}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.3rem;">${stock.name}</div>
                                <div style="color: #8fa3bf; font-size: 0.9rem; font-family: var(--font-display);">${stock.ticker}</div>
                            </div>
                            <div style="padding: 0.5rem 1rem; background: rgba(0,240,255,0.2); border-radius: 6px; color: var(--accent-primary); font-weight: 700;">🇺🇸 미국</div>
                        </div>
                        <div style="margin-top: 1rem; color: var(--accent-primary); font-size: 0.9rem;">📊 클릭하여 야후 파이낸스 열기 →</div>
                    </div>
                `;
            }
        }).join('');
    }
}

function openNaverDiscussion(code, name) {
    window.open(`https://finance.naver.com/item/board.naver?code=${code}`, '_blank');
}

function openYahooFinance(ticker, name) {
    window.open(`https://finance.yahoo.com/quote/${ticker}`, '_blank');
}

// ========================================
// 실시간 지수 데이터
// ========================================
async function fetchIndices() {
    console.log('📊 Fetching market indices...');
    
    try {
        // S&P 500
        const sp500Response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d');
        const sp500Data = await sp500Response.json();
        if (sp500Data.chart && sp500Data.chart.result && sp500Data.chart.result[0]) {
            const meta = sp500Data.chart.result[0].meta;
            updateIndexUI('sp500', meta.regularMarketPrice, meta.chartPreviousClose);
        }
        
        await sleep(300);
        
        // NASDAQ
        const nasdaqResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1d&range=1d');
        const nasdaqData = await nasdaqResponse.json();
        if (nasdaqData.chart && nasdaqData.chart.result && nasdaqData.chart.result[0]) {
            const meta = nasdaqData.chart.result[0].meta;
            updateIndexUI('nasdaq', meta.regularMarketPrice, meta.chartPreviousClose);
        }
        
        await sleep(300);
        
        // 코스피
        const kospiResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11?interval=1d&range=1d');
        const kospiData = await kospiResponse.json();
        if (kospiData.chart && kospiData.chart.result && kospiData.chart.result[0]) {
            const meta = kospiData.chart.result[0].meta;
            updateIndexUI('kospi', meta.regularMarketPrice, meta.chartPreviousClose);
        }
        
        await sleep(300);
        
        // 코스닥
        const kosdaqResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EKQ11?interval=1d&range=1d');
        const kosdaqData = await kosdaqResponse.json();
        if (kosdaqData.chart && kosdaqData.chart.result && kosdaqData.chart.result[0]) {
            const meta = kosdaqData.chart.result[0].meta;
            updateIndexUI('kosdaq', meta.regularMarketPrice, meta.chartPreviousClose);
        }
        
        console.log('✅ All indices loaded!');
        
    } catch (error) {
        console.error('Error fetching indices:', error);
    }
}

function updateIndexUI(id, price, previousClose) {
    const priceElement = document.getElementById(`${id}-price`);
    const changeElement = document.getElementById(`${id}-change`);
    
    if (priceElement && changeElement) {
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;
        const isPositive = change >= 0;
        
        priceElement.textContent = price.toFixed(2);
        priceElement.style.color = isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
        
        const arrow = isPositive ? '▲' : '▼';
        changeElement.textContent = `${arrow} ${Math.abs(change).toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`;
        changeElement.style.color = isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
    }
}

// ========================================
// 한국 주식 데이터
// ========================================
async function fetchKoreanStocks() {
    console.log('📈 Fetching Korean stocks...');
    
    const tbody = document.getElementById('koreanStocksTable');
    const stocks = stockDatabase.korean.slice(0, 20);
    
    let html = '';
    
    for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];
        
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.code}.KS?interval=1d&range=1d`);
            const data = await response.json();
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const meta = data.chart.result[0].meta;
                const price = meta.regularMarketPrice;
                const previousClose = meta.chartPreviousClose;
                const change = price - previousClose;
                const changePercent = (change / previousClose) * 100;
                const isPositive = change >= 0;
                
                html += `
                    <tr onclick="openNaverDiscussion('${stock.code}', '${stock.name}')">
                        <td style="font-weight: 700; font-family: var(--font-display);">${i + 1}</td>
                        <td style="font-weight: 700;">${stock.name}</td>
                        <td style="font-family: var(--font-display); color: #8fa3bf;">${stock.code}</td>
                        <td style="font-weight: 700; font-family: var(--font-display);">${Math.round(price).toLocaleString()}원</td>
                        <td style="font-weight: 700; color: ${isPositive ? 'var(--accent-success)' : 'var(--accent-danger)'};">${isPositive ? '+' : ''}${changePercent.toFixed(2)}%</td>
                    </tr>
                `;
                
                console.log(`✅ ${stock.name}: ${Math.round(price).toLocaleString()}원 (${changePercent.toFixed(2)}%)`);
            }
        } catch (error) {
            console.log(`Skip ${stock.name}`);
        }
        
        await sleep(200);
    }
    
    tbody.innerHTML = html || '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #8fa3bf;">데이터를 불러올 수 없습니다.</td></tr>';
}

// ========================================
// 미국 주식 데이터
// ========================================
async function fetchUSStocks() {
    console.log('📈 Fetching US stocks...');
    
    const tbody = document.getElementById('usStocksTable');
    const stocks = stockDatabase.us.slice(0, 20);
    
    let html = '';
    
    for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];
        
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.ticker}?interval=1d&range=1d`);
            const data = await response.json();
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const meta = data.chart.result[0].meta;
                const price = meta.regularMarketPrice;
                const previousClose = meta.chartPreviousClose;
                const change = price - previousClose;
                const changePercent = (change / previousClose) * 100;
                const isPositive = change >= 0;
                
                html += `
                    <tr onclick="openYahooFinance('${stock.ticker}', '${stock.name}')">
                        <td style="font-weight: 700; font-family: var(--font-display);">${i + 1}</td>
                        <td style="font-weight: 700;">${stock.name}</td>
                        <td style="font-family: var(--font-display); color: #8fa3bf;">${stock.ticker}</td>
                        <td style="font-weight: 700; font-family: var(--font-display);">$${price.toFixed(2)}</td>
                        <td style="font-weight: 700; color: ${isPositive ? 'var(--accent-success)' : 'var(--accent-danger)'};">${isPositive ? '+' : ''}${changePercent.toFixed(2)}%</td>
                    </tr>
                `;
                
                console.log(`✅ ${stock.name}: $${price.toFixed(2)} (${changePercent.toFixed(2)}%)`);
            }
        } catch (error) {
            console.log(`Skip ${stock.name}`);
        }
        
        await sleep(200);
    }
    
    tbody.innerHTML = html || '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #8fa3bf;">데이터를 불러올 수 없습니다.</td></tr>';
}

// ========================================
// 새로고침 함수
// ========================================
function refreshIndices() {
    fetchIndices();
}

function refreshKoreanStocks() {
    document.getElementById('koreanStocksTable').innerHTML = '<tr><td colspan="5" class="loading">📊 데이터 로딩중...</td></tr>';
    fetchKoreanStocks();
}

function refreshUSStocks() {
    document.getElementById('usStocksTable').innerHTML = '<tr><td colspan="5" class="loading">📊 데이터 로딩중...</td></tr>';
    fetchUSStocks();
}

// ========================================
// 유틸리티
// ========================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// 초기화
// ========================================
async function initializeDashboard() {
    console.log('🚀 Initializing Dashboard...');
    
    await fetchIndices();
    await fetchKoreanStocks();
    await fetchUSStocks();
    
    console.log('✅ Dashboard Ready!');
}

// 페이지 로드 시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// 자동 갱신 (5분마다)
setInterval(() => {
    console.log('🔄 Auto-refresh...');
    fetchIndices();
}, 300000);

console.log('Stock Dashboard Ready! 🎯');
