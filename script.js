// ==========================================
// STOCKHUB - 실시간 주식 대시보드 (실제 데이터)
// ==========================================

console.log('🚀 STOCKHUB Loading with REAL DATA...');

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

// CORS 프록시
const PROXY = 'https://api.allorigins.win/raw?url=';

// ==========================================
// 실제 주요 지수 로드 (Yahoo Finance)
// ==========================================
async function loadIndices() {
    console.log('📊 Loading REAL indices...');
    
    try {
        // S&P 500
        await fetchRealIndex('sp500', '^GSPC', 'S&P 500');
        await sleep(500);
        
        // NASDAQ
        await fetchRealIndex('nasdaq', '^IXIC', 'NASDAQ');
        await sleep(500);
        
        // 코스피
        await fetchRealIndex('kospi', '^KS11', '코스피');
        await sleep(500);
        
        // 코스닥
        await fetchRealIndex('kosdaq', '^KQ11', '코스닥');
        
        console.log('✅ All REAL indices loaded!');
    } catch (error) {
        console.error('지수 로드 에러:', error);
    }
}

async function fetchRealIndex(id, symbol, name) {
    try {
        const url = `${PROXY}${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const change = price - previousClose;
            const percent = (change / previousClose) * 100;
            
            updateIndexUI(id, {price, change, percent});
            console.log(`✅ ${name}: ${price.toFixed(2)} (${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%)`);
        }
    } catch (error) {
        console.error(`${name} 로드 실패:`, error);
    }
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
// 한국 주식 실제 데이터 로드
// ==========================================
const KOREAN_STOCKS = [
    {name: '삼성전자', code: '005930'},
    {name: 'SK하이닉스', code: '000660'},
    {name: 'LG에너지솔루션', code: '373220'},
    {name: 'NAVER', code: '035420'},
    {name: '카카오', code: '035720'},
    {name: '삼성바이오로직스', code: '207940'},
    {name: '현대차', code: '005380'},
    {name: 'POSCO홀딩스', code: '005490'},
    {name: 'LG화학', code: '051910'},
    {name: '삼성SDI', code: '006400'},
    {name: '셀트리온', code: '068270'},
    {name: '기아', code: '000270'},
    {name: 'KB금융', code: '105560'},
    {name: '신한지주', code: '055550'},
    {name: 'HMM', code: '011200'},
    {name: 'LG전자', code: '066570'},
    {name: '삼성물산', code: '028260'},
    {name: '현대모비스', code: '012330'},
    {name: 'SK텔레콤', code: '017670'},
    {name: 'KT&G', code: '033780'},
    {name: '에코프로', code: '086520'},
    {name: '에코프로비엠', code: '247540'},
    {name: '포스코퓨처엠', code: '003670'},
    {name: '엘앤에프', code: '066970'},
    {name: '고려아연', code: '010130'},
    {name: '아모레퍼시픽', code: '090430'},
    {name: '한국전력', code: '015760'},
    {name: 'SK이노베이션', code: '096770'},
    {name: 'SK', code: '034730'},
    {name: 'LG', code: '003550'}
];

async function loadKoreanStocks() {
    const tbody = document.getElementById('koreanStocks');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">📊 실제 데이터 로딩중...</td></tr>';
    
    console.log('📈 Loading REAL Korean stocks...');
    
    const results = [];
    
    for (let i = 0; i < Math.min(KOREAN_STOCKS.length, 20); i++) {
        const stock = KOREAN_STOCKS[i];
        
        try {
            const url = `${PROXY}${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.code}.KS?interval=1d&range=1d`)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const meta = data.chart.result[0].meta;
                const price = meta.regularMarketPrice;
                const previousClose = meta.chartPreviousClose;
                const change = price - previousClose;
                const percent = (change / previousClose) * 100;
                
                results.push({
                    ...stock,
                    price: Math.round(price),
                    percent: percent.toFixed(2),
                    isPositive: percent >= 0
                });
                
                console.log(`✅ ${stock.name}: ${Math.round(price).toLocaleString()}원 (${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%)`);
            }
        } catch (error) {
            console.log(`Skip ${stock.name}`);
        }
        
        await sleep(300);
    }
    
    if (results.length > 0) {
        let html = '';
        results.forEach((stock, i) => {
            const color = stock.isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
            
            html += `
                <tr onclick="openNaverStock('${stock.code}', '${stock.name}')">
                    <td style="font-weight: 700; font-family: var(--font-display);">${i + 1}</td>
                    <td style="font-weight: 700;">${stock.name}</td>
                    <td style="font-family: var(--font-display); color: #8fa3bf;">${stock.code}</td>
                    <td style="font-weight: 700; font-family: var(--font-display);">${stock.price.toLocaleString()}원</td>
                    <td style="font-weight: 700; color: ${color};">${stock.isPositive ? '+' : ''}${stock.percent}%</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        console.log(`✅ ${results.length}개 한국 주식 로드 완료!`);
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</td></tr>';
    }
}

// ==========================================
// 미국 주식 실제 데이터 로드
// ==========================================
const US_STOCKS = [
    {name: '애플', ticker: 'AAPL'},
    {name: '마이크로소프트', ticker: 'MSFT'},
    {name: '엔비디아', ticker: 'NVDA'},
    {name: '테슬라', ticker: 'TSLA'},
    {name: '아마존', ticker: 'AMZN'},
    {name: '메타', ticker: 'META'},
    {name: '알파벳', ticker: 'GOOGL'},
    {name: 'AMD', ticker: 'AMD'},
    {name: '넷플릭스', ticker: 'NFLX'},
    {name: '디즈니', ticker: 'DIS'},
    {name: '나이키', ticker: 'NKE'},
    {name: '스타벅스', ticker: 'SBUX'},
    {name: '코카콜라', ticker: 'KO'},
    {name: '맥도날드', ticker: 'MCD'},
    {name: '비자', ticker: 'V'},
    {name: '월마트', ticker: 'WMT'},
    {name: '제이피모건', ticker: 'JPM'},
    {name: '뱅크오브아메리카', ticker: 'BAC'},
    {name: '인텔', ticker: 'INTC'},
    {name: 'IBM', ticker: 'IBM'},
    {name: '오라클', ticker: 'ORCL'},
    {name: '시스코', ticker: 'CSCO'},
    {name: 'Adobe', ticker: 'ADBE'},
    {name: 'Salesforce', ticker: 'CRM'},
    {name: 'Qualcomm', ticker: 'QCOM'},
    {name: 'PayPal', ticker: 'PYPL'},
    {name: 'Uber', ticker: 'UBER'},
    {name: 'Airbnb', ticker: 'ABNB'},
    {name: 'Moderna', ticker: 'MRNA'},
    {name: 'Pfizer', ticker: 'PFE'}
];

async function loadUSStocks() {
    const tbody = document.getElementById('usStocks');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">📊 실제 데이터 로딩중...</td></tr>';
    
    console.log('📈 Loading REAL US stocks...');
    
    const results = [];
    
    for (let i = 0; i < Math.min(US_STOCKS.length, 20); i++) {
        const stock = US_STOCKS[i];
        
        try {
            const url = `${PROXY}${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.ticker}?interval=1d&range=1d`)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const meta = data.chart.result[0].meta;
                const price = meta.regularMarketPrice;
                const previousClose = meta.chartPreviousClose;
                const change = price - previousClose;
                const percent = (change / previousClose) * 100;
                
                results.push({
                    ...stock,
                    price: price.toFixed(2),
                    percent: percent.toFixed(2),
                    isPositive: percent >= 0
                });
                
                console.log(`✅ ${stock.name}: $${price.toFixed(2)} (${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%)`);
            }
        } catch (error) {
            console.log(`Skip ${stock.name}`);
        }
        
        await sleep(300);
    }
    
    if (results.length > 0) {
        let html = '';
        results.forEach((stock, i) => {
            const color = stock.isPositive ? 'var(--accent-success)' : 'var(--accent-danger)';
            
            html += `
                <tr onclick="openYahooStock('${stock.ticker}', '${stock.name}')">
                    <td style="font-weight: 700; font-family: var(--font-display);">${i + 1}</td>
                    <td style="font-weight: 700;">${stock.name}</td>
                    <td style="font-family: var(--font-display); color: #8fa3bf;">${stock.ticker}</td>
                    <td style="font-weight: 700; font-family: var(--font-display);">$${stock.price}</td>
                    <td style="font-weight: 700; color: ${color};">${stock.isPositive ? '+' : ''}${stock.percent}%</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        console.log(`✅ ${results.length}개 미국 주식 로드 완료!`);
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</td></tr>';
    }
}

// ==========================================
// 검색 기능 (모든 주식)
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
    KOREAN_STOCKS.forEach(stock => {
        if (stock.name.toLowerCase().includes(query) || 
            stock.code.includes(query)) {
            results.push({type: 'korean', ...stock});
        }
    });
    
    // 미국 주식 검색
    US_STOCKS.forEach(stock => {
        if (stock.name.toLowerCase().includes(query) || 
            stock.ticker.toLowerCase().includes(query)) {
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
    window.open(`https://finance.naver.com/item/board.naver?code=${code}`, '_blank');
}

function openYahooStock(ticker, name) {
    window.open(`https://finance.yahoo.com/quote/${ticker}`, '_blank');
}

// ==========================================
// 유틸리티
// ==========================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 초기화
// ==========================================
async function init() {
    console.log('🚀 Initializing STOCKHUB with REAL DATA...');
    console.log('⏳ 실제 데이터 로딩에는 시간이 걸릴 수 있습니다...');
    
    await loadIndices();
    await loadKoreanStocks();
    await loadUSStocks();
    
    console.log('✅ STOCKHUB Ready with REAL DATA!');
}

// 페이지 로드 시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('STOCKHUB Loaded! 🎯');
console.log('💡 실제 Yahoo Finance API 데이터를 CORS 프록시를 통해 가져옵니다.');

