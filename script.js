// ========================================
// 실시간 주식 대시보드 - 실제 데이터 연동
// ========================================

console.log('🚀 Loading REAL market data...');

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
// 실제 API 데이터 가져오기
// ========================================

// 1. 미국 지수 실시간 데이터 (Yahoo Finance - 안정적)
async function fetchUSIndices() {
    console.log('📊 Fetching US indices...');
    
    // S&P 500
    try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d');
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const meta = data.chart.result[0].meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const change = price - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            updateIndexDisplay('sp500', { price, change, changePercent });
            console.log(`✅ S&P 500: ${price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        }
    } catch (error) {
        console.error('S&P 500 조회 실패:', error);
    }
    
    await sleep(300);
    
    // 나스닥
    try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1d&range=1d');
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const meta = data.chart.result[0].meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const change = price - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            updateIndexDisplay('nasdaq', { price, change, changePercent });
            console.log(`✅ 나스닥: ${price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        }
    } catch (error) {
        console.error('나스닥 조회 실패:', error);
    }
}

// 2. 코스피/코스닥 (Yahoo Finance Korea)
async function fetchKoreanIndices() {
    console.log('📊 Fetching Korean indices...');
    
    // 코스피
    try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11?interval=1d&range=1d');
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const meta = data.chart.result[0].meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const change = price - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            updateIndexDisplay('kospi', { price, change, changePercent });
            console.log(`✅ 코스피: ${price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        }
    } catch (error) {
        console.error('코스피 조회 실패:', error);
    }
    
    await sleep(300);
    
    // 코스닥
    try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EKQ11?interval=1d&range=1d');
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const meta = data.chart.result[0].meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const change = price - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            updateIndexDisplay('kosdaq', { price, change, changePercent });
            console.log(`✅ 코스닥: ${price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        }
    } catch (error) {
        console.error('코스닥 조회 실패:', error);
    }
}

// 3. 한국 주식 실시간 데이터
async function fetchKoreanStocks() {
    console.log('📈 Fetching Korean stocks...');
    
    const stocks = [
        { code: '005930', name: '삼성전자', symbol: '005930.KS' },
        { code: '000660', name: 'SK하이닉스', symbol: '000660.KS' },
        { code: '373220', name: 'LG에너지솔루션', symbol: '373220.KS' },
        { code: '035420', name: 'NAVER', symbol: '035420.KS' },
        { code: '035720', name: '카카오', symbol: '035720.KS' }
    ];
    
    for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];
        
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=1d`);
            const data = await response.json();
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const meta = data.chart.result[0].meta;
                const price = meta.regularMarketPrice;
                const previousClose = meta.chartPreviousClose;
                const change = price - previousClose;
                const changePercent = (change / previousClose) * 100;
                
                updateStockDisplay(i, stock.code, stock.name, price, changePercent);
                console.log(`✅ ${stock.name}: ${Math.round(price).toLocaleString()}원 (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
            }
        } catch (error) {
            console.error(`${stock.name} 조회 실패:`, error);
        }
        
        await sleep(200);
    }
}

// ========================================
// UI 업데이트 함수
// ========================================

function updateIndexDisplay(id, data) {
    // 지수 카드의 부모 컨테이너 찾기
    const container = document.querySelector('[style*="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))"]');
    if (!container) return;
    
    const cards = container.querySelectorAll('[style*="padding: 1.5rem"]');
    
    cards.forEach(card => {
        const nameDiv = card.querySelector('div[style*="color: #8fa3bf"]');
        if (!nameDiv) return;
        
        const text = nameDiv.textContent.trim();
        const shouldUpdate = 
            (id === 'kospi' && text === '코스피') ||
            (id === 'kosdaq' && text === '코스닥') ||
            (id === 'sp500' && text === 'S&P 500') ||
            (id === 'nasdaq' && text === '나스닥');
        
        if (shouldUpdate) {
            // 가격 업데이트
            const priceDiv = card.querySelector('div[style*="font-size: 1.8rem"]');
            if (priceDiv) {
                priceDiv.textContent = data.price.toFixed(2);
            }
            
            // 등락 업데이트
            const changeDiv = card.querySelector('div[style*="margin-top: 0.5rem"]');
            if (changeDiv) {
                const isPositive = data.change >= 0;
                const arrow = isPositive ? '▲' : '▼';
                const sign = isPositive ? '+' : '';
                changeDiv.textContent = `${arrow} ${Math.abs(data.change).toFixed(2)} (${sign}${data.changePercent.toFixed(2)}%)`;
                
                // 색상 변경
                if (isPositive) {
                    changeDiv.style.color = 'var(--accent-success)';
                    card.style.background = 'rgba(0, 255, 136, 0.1)';
                    card.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                } else {
                    changeDiv.style.color = 'var(--accent-danger)';
                    card.style.background = 'rgba(255, 51, 102, 0.1)';
                    card.style.borderColor = 'rgba(255, 51, 102, 0.3)';
                }
            }
        }
    });
}

function updateStockDisplay(index, code, name, price, changePercent) {
    // 종목 리스트 컨테이너 찾기
    const stockList = document.querySelector('[style*="display: flex; flex-direction: column"]');
    if (!stockList) return;
    
    const stockItems = stockList.querySelectorAll('[onclick*="finance.naver.com"]');
    
    if (stockItems[index]) {
        const item = stockItems[index];
        
        // 가격 업데이트
        const priceDiv = item.querySelector('div[style*="font-size: 1.2rem"]');
        if (priceDiv) {
            priceDiv.textContent = `${Math.round(price).toLocaleString()}원`;
        }
        
        // 등락률 업데이트
        const changeDivs = item.querySelectorAll('div[style*="padding: 0.5rem"]');
        const changeDiv = changeDivs[changeDivs.length - 1]; // 마지막 div가 등락률
        
        if (changeDiv) {
            const isPositive = changePercent >= 0;
            changeDiv.textContent = `${isPositive ? '+' : ''}${changePercent.toFixed(1)}%`;
            
            if (isPositive) {
                changeDiv.style.background = 'rgba(0,255,136,0.1)';
                changeDiv.style.color = 'var(--accent-success)';
            } else {
                changeDiv.style.background = 'rgba(255,51,102,0.1)';
                changeDiv.style.color = 'var(--accent-danger)';
            }
        }
    }
}

// ========================================
// 주식 검색
// ========================================
function searchStock() {
    const query = document.getElementById('stockSearch').value.trim();
    if (query) {
        window.open(`https://finance.naver.com/search/searchList.naver?query=${encodeURIComponent(query)}`, '_blank');
    } else {
        alert('종목명 또는 종목코드를 입력하세요.');
    }
}

// Enter 키로 검색
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('stockSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchStock();
        });
    }
});

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
    console.log('🚀 Initializing Dashboard with REAL DATA...');
    
    try {
        // 순차적으로 데이터 로드
        await fetchUSIndices();
        await fetchKoreanIndices();
        await fetchKoreanStocks();
        
        console.log('✅ All REAL data loaded successfully!');
        console.log('💡 모든 가격은 Yahoo Finance API에서 실시간으로 가져옵니다.');
        
    } catch (error) {
        console.error('초기화 에러:', error);
    }
}

// 페이지 로드 시 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// 자동 갱신 (1분마다)
setInterval(() => {
    console.log('🔄 Auto-refreshing real data...');
    fetchUSIndices();
    fetchKoreanIndices();
    fetchKoreanStocks();
}, 60000);

console.log('📊 Stock Dashboard Ready!');
console.log('🔄 실시간 데이터는 1분마다 자동 갱신됩니다.');
