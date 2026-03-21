// ========================================
// 실제 데이터 연동 설정
// ========================================

// API Keys (무료 API 사용)
const API_CONFIG = {
    // Alpha Vantage (주식 데이터) - 무료 키
    alphaVantage: 'demo', // 실제 사용시 https://www.alphavantage.co/support/#api-key 에서 무료 키 발급
    // 한국투자증권 오픈 API는 인증 필요, 여기서는 Yahoo Finance 사용
};

// 현재 시간 업데이트
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

// 초기 시간 설정 및 1초마다 업데이트
updateTime();
setInterval(updateTime, 1000);

// ========================================
// 실시간 시장 지수 데이터 (Yahoo Finance API 사용)
// ========================================

async function fetchMarketIndices() {
    try {
        // Yahoo Finance API를 통한 실시간 데이터
        const symbols = [
            { id: 'kospi', symbol: '^KS11', name: '코스피' },
            { id: 'kosdaq', symbol: '^KQ11', name: '코스닥' },
            { id: 'sp500', symbol: '^GSPC', name: 'S&P 500' },
            { id: 'nasdaq', symbol: '^IXIC', name: '나스닥' }
        ];

        for (const item of symbols) {
            try {
                // Yahoo Finance Query API
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}?interval=1d&range=1d`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.chart && data.chart.result && data.chart.result[0]) {
                    const result = data.chart.result[0];
                    const meta = result.meta;
                    const quote = result.indicators.quote[0];
                    
                    const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
                    const previousClose = meta.previousClose;
                    const change = currentPrice - previousClose;
                    const changePercent = (change / previousClose) * 100;
                    
                    updateIndexDisplay(item.id, currentPrice, change, changePercent);
                }
            } catch (error) {
                console.error(`Error fetching ${item.name}:`, error);
            }
        }
    } catch (error) {
        console.error('Error fetching market indices:', error);
    }
}

function updateIndexDisplay(id, price, change, changePercent) {
    const priceElement = document.getElementById(id);
    const card = priceElement?.closest('.index-card');
    
    if (priceElement) {
        // 가격 포맷팅
        const formattedPrice = price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        animateValue(priceElement, parseFloat(priceElement.textContent.replace(/,/g, '') || 0), price, 1000);
    }
    
    if (card) {
        const changeElement = card.querySelector('.index-change');
        if (changeElement) {
            const isPositive = change >= 0;
            const arrow = isPositive ? '▲' : '▼';
            const sign = isPositive ? '+' : '';
            
            changeElement.className = `index-change ${isPositive ? 'positive' : 'negative'}`;
            changeElement.innerHTML = `
                <span>${arrow} ${Math.abs(change).toFixed(2)}</span>
                <span>(${sign}${changePercent.toFixed(2)}%)</span>
            `;
        }
    }
}

// ========================================
// 한국 주식 데이터 (네이버 금융 크롤링)
// ========================================

async function fetchKoreanStocks(type = 'hot') {
    try {
        // 네이버 금융 API (비공식이지만 작동)
        const stocks = await fetchNaverStocks(type);
        return stocks;
    } catch (error) {
        console.error('Error fetching Korean stocks:', error);
        return getFallbackStocks(type);
    }
}

async function fetchNaverStocks(type) {
    // 실제 구현에서는 CORS 프록시 또는 백엔드 서버 필요
    // 여기서는 네이버 금융 데이터를 JSON으로 가져오는 방식
    
    const categories = {
        hot: '상승률',
        recommend: '거래상위',
        theme: '시가총액'
    };
    
    try {
        // 공개 API endpoint (예시 - 실제로는 프록시 서버 필요)
        const response = await fetch(`https://m.stock.naver.com/api/stocks/rise?page=1&pageSize=5`);
        const data = await response.json();
        
        if (data && data.stocks) {
            return data.stocks.map((stock, index) => ({
                rank: index + 1,
                name: stock.stockName,
                code: stock.stockCode,
                price: `${parseInt(stock.closePrice).toLocaleString()}원`,
                change: `${stock.compareToPreviousClosePrice >= 0 ? '+' : ''}${stock.fluctuationsRatio.toFixed(2)}%`,
                isPositive: stock.compareToPreviousClosePrice >= 0
            }));
        }
    } catch (error) {
        console.log('Using fallback data');
        return getFallbackStocks(type);
    }
    
    return getFallbackStocks(type);
}

function getFallbackStocks(type) {
    const stockData = {
        hot: [
            { rank: 1, name: '삼성전자', code: '005930', price: '72,300원', change: '+3.2%', isPositive: true },
            { rank: 2, name: 'SK하이닉스', code: '000660', price: '185,500원', change: '+5.7%', isPositive: true },
            { rank: 3, name: 'LG에너지솔루션', code: '373220', price: '428,000원', change: '+2.1%', isPositive: true },
            { rank: 4, name: '현대차', code: '005380', price: '234,500원', change: '-1.3%', isPositive: false },
            { rank: 5, name: 'POSCO홀딩스', code: '005490', price: '287,000원', change: '+1.8%', isPositive: true }
        ],
        recommend: [
            { rank: 1, name: 'NAVER', code: '035420', price: '215,500원', change: '+2.4%', isPositive: true },
            { rank: 2, name: '카카오', code: '035720', price: '52,800원', change: '+1.9%', isPositive: true },
            { rank: 3, name: '셀트리온', code: '068270', price: '198,700원', change: '+3.5%', isPositive: true },
            { rank: 4, name: '삼성바이오로직스', code: '207940', price: '856,000원', change: '+1.2%', isPositive: true },
            { rank: 5, name: '기아', code: '000270', price: '112,300원', change: '-0.5%', isPositive: false }
        ],
        theme: [
            { rank: 1, name: '에코프로비엠', code: '247540', price: '325,000원', change: '+7.8%', isPositive: true },
            { rank: 2, name: '포스코퓨처엠', code: '003670', price: '287,500원', change: '+6.2%', isPositive: true },
            { rank: 3, name: '엘앤에프', code: '066970', price: '198,500원', change: '+4.9%', isPositive: true },
            { rank: 4, name: '에코프로', code: '086520', price: '124,800원', change: '+5.3%', isPositive: true },
            { rank: 5, name: '천보', code: '278280', price: '78,900원', change: '+3.7%', isPositive: true }
        ]
    };
    
    return stockData[type] || stockData.hot;
}

// ========================================
// 실시간 뉴스 데이터 (NewsAPI 사용)
// ========================================

async function fetchFinancialNews() {
    try {
        // NewsAPI - 무료 티어 사용 가능 (https://newsapi.org/)
        // 또는 Google News RSS 사용
        const response = await fetch('https://newsapi.org/v2/top-headlines?country=kr&category=business&apiKey=demo');
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            const newsHtml = data.articles.slice(0, 3).map(article => {
                const category = categorizeNews(article.title);
                const timeAgo = getTimeAgo(new Date(article.publishedAt));
                
                return `
                    <article class="news-item">
                        <div class="news-category">${category}</div>
                        <h3 class="news-title">${article.title}</h3>
                        <p class="news-summary">${article.description || article.content?.substring(0, 150) + '...' || ''}</p>
                        <div class="news-meta">
                            <span class="news-time">${timeAgo}</span>
                            <span class="news-source">${article.source.name}</span>
                        </div>
                    </article>
                `;
            }).join('');
            
            const newsList = document.querySelector('.news-list');
            if (newsList) {
                newsList.innerHTML = newsHtml;
            }
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        // 기본 뉴스 유지
    }
}

function categorizeNews(title) {
    if (title.includes('금리') || title.includes('연준') || title.includes('기준금리')) return '금리정책';
    if (title.includes('반도체') || title.includes('AI') || title.includes('배터리')) return '산업동향';
    if (title.includes('환율') || title.includes('달러') || title.includes('원화')) return '환율';
    if (title.includes('주가') || title.includes('증시')) return '증시';
    return '경제일반';
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
}

// ========================================
// 환율 정보 (exchangerate-api 사용)
// ========================================

async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data.rates && data.rates.KRW) {
            const usdToKrw = data.rates.KRW;
            console.log(`USD/KRW: ${usdToKrw.toFixed(2)}`);
            
            // 환율 정보를 시장 현황에 추가할 수 있음
            updateExchangeRateDisplay(usdToKrw);
        }
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
    }
}

function updateExchangeRateDisplay(rate) {
    // 필요시 UI에 환율 정보 표시
    const statusItems = document.querySelector('.market-status');
    if (statusItems && !document.querySelector('.exchange-rate-item')) {
        const exchangeItem = document.createElement('div');
        exchangeItem.className = 'status-item exchange-rate-item';
        exchangeItem.innerHTML = `
            <span class="status-label">USD/KRW</span>
            <span class="status-value">${rate.toFixed(2)}원</span>
        `;
        statusItems.appendChild(exchangeItem);
    }
}

// ========================================
// 암호화폐 데이터 (CoinGecko API - 무료)
// ========================================

async function fetchCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=krw&include_24hr_change=true');
        const data = await response.json();
        
        console.log('Crypto prices:', data);
        // 필요시 암호화폐 섹션 추가 가능
    } catch (error) {
        console.error('Error fetching crypto data:', error);
    }
}

// ========================================
// UI 업데이트 함수들
// ========================================

// 지수 값 애니메이션 (숫자가 올라가는 효과)
function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, 16);
}

// 탭 버튼 클릭 이벤트
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', async () => {
        // 모든 탭 비활성화
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // 클릭한 탭 활성화
        button.classList.add('active');
        
        // 데이터 업데이트
        const tab = button.dataset.tab;
        const stocks = await fetchKoreanStocks(tab);
        updateStocksList(stocks);
    });
});

// 주식 목록 업데이트
function updateStocksList(stocks) {
    const stocksList = document.getElementById('stocksList');
    if (!stocksList || !stocks) return;
    
    stocksList.innerHTML = stocks.map(stock => `
        <div class="stock-item">
            <div class="stock-rank">${stock.rank}</div>
            <div class="stock-info">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-code">${stock.code}</div>
            </div>
            <div class="stock-price">${stock.price}</div>
            <div class="stock-change ${stock.isPositive ? 'positive' : 'negative'}">${stock.change}</div>
        </div>
    `).join('');
    
    // 애니메이션 효과
    const items = stocksList.querySelectorAll('.stock-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// 섹션 새로고침
async function refreshSection(section) {
    const button = event.currentTarget;
    button.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
        button.style.transform = 'rotate(0deg)';
    }, 500);
    
    // 실제 데이터 새로고침
    console.log(`Refreshing ${section} section...`);
    
    if (section === 'market') {
        await fetchMarketIndices();
    }
    
    // 시각적 피드백
    const card = button.closest('.card');
    card.style.opacity = '0.7';
    setTimeout(() => {
        card.style.opacity = '1';
    }, 300);
}

// ========================================
// 페이지 초기화
// ========================================

async function initializeDashboard() {
    console.log('🚀 Initializing Stock Dashboard...');
    
    try {
        // 1. 시장 지수 로드
        console.log('📊 Loading market indices...');
        await fetchMarketIndices();
        
        // 2. 주식 데이터 로드
        console.log('📈 Loading stock data...');
        const hotStocks = await fetchKoreanStocks('hot');
        updateStocksList(hotStocks);
        
        // 3. 뉴스 로드
        console.log('📰 Loading financial news...');
        await fetchFinancialNews();
        
        // 4. 환율 로드
        console.log('💱 Loading exchange rates...');
        await fetchExchangeRate();
        
        // 5. 암호화폐 데이터 로드 (선택사항)
        // await fetchCryptoData();
        
        console.log('✅ Dashboard initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
    }
}

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    initializeDashboard();
    
    // 정기적인 데이터 업데이트 (5분마다)
    setInterval(() => {
        console.log('🔄 Refreshing data...');
        fetchMarketIndices();
        fetchFinancialNews();
        fetchExchangeRate();
    }, 5 * 60 * 1000); // 5분
    
    // 시장 지수만 더 자주 업데이트 (1분마다)
    setInterval(() => {
        fetchMarketIndices();
    }, 60 * 1000); // 1분
});

// ========================================
// UI 이벤트 핸들러
// ========================================

// 스크롤 시 카드 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

// 전략 카드 호버 효과
const strategyCards = document.querySelectorAll('.strategy-card');
strategyCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// 뉴스 아이템 클릭 시 확장
const newsItems = document.querySelectorAll('.news-item');
newsItems.forEach(item => {
    item.addEventListener('click', () => {
        item.style.transform = 'translateX(8px) scale(1.02)';
        setTimeout(() => {
            item.style.transform = 'translateX(8px)';
        }, 200);
    });
});

// 학습 태그 클릭 이벤트
const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        console.log('Learning resource clicked:', tag.textContent);
        
        // 시각적 피드백
        tag.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tag.style.transform = 'scale(1)';
        }, 100);
    });
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R: 전체 새로고침
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        location.reload();
    }
    
    // 숫자 키 1-6: 해당 섹션으로 스크롤
    if (e.key >= '1' && e.key <= '6') {
        const section = document.querySelector(`[data-section="${e.key}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

console.log('Stock Dashboard loaded! 🚀');
console.log('Keyboard shortcuts:');
console.log('- 1-6: Jump to section');
console.log('- Ctrl/Cmd + R: Refresh page');

// 주식 데이터 시뮬레이션 (실제로는 API에서 가져와야 함)
const stockData = {
    hot: [
        { rank: 1, name: '삼성전자', code: '005930', price: '72,300원', change: '+3.2%', isPositive: true },
        { rank: 2, name: 'SK하이닉스', code: '000660', price: '185,500원', change: '+5.7%', isPositive: true },
        { rank: 3, name: 'LG에너지솔루션', code: '373220', price: '428,000원', change: '+2.1%', isPositive: true },
        { rank: 4, name: '현대차', code: '005380', price: '234,500원', change: '-1.3%', isPositive: false },
        { rank: 5, name: 'POSCO홀딩스', code: '005490', price: '287,000원', change: '+1.8%', isPositive: true }
    ],
    recommend: [
        { rank: 1, name: 'NAVER', code: '035420', price: '215,500원', change: '+2.4%', isPositive: true },
        { rank: 2, name: '카카오', code: '035720', price: '52,800원', change: '+1.9%', isPositive: true },
        { rank: 3, name: '셀트리온', code: '068270', price: '198,700원', change: '+3.5%', isPositive: true },
        { rank: 4, name: '삼성바이오로직스', code: '207940', price: '856,000원', change: '+1.2%', isPositive: true },
        { rank: 5, name: '기아', code: '000270', price: '112,300원', change: '-0.5%', isPositive: false }
    ],
    theme: [
        { rank: 1, name: '에코프로비엠', code: '247540', price: '325,000원', change: '+7.8%', isPositive: true },
        { rank: 2, name: '포스코퓨처엠', code: '003670', price: '287,500원', change: '+6.2%', isPositive: true },
        { rank: 3, name: '엘앤에프', code: '066970', price: '198,500원', change: '+4.9%', isPositive: true },
        { rank: 4, name: '에코프로', code: '086520', price: '124,800원', change: '+5.3%', isPositive: true },
        { rank: 5, name: '천보', code: '278280', price: '78,900원', change: '+3.7%', isPositive: true }
    ]
};

// 탭 버튼 클릭 이벤트
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 모든 탭 비활성화
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // 클릭한 탭 활성화
        button.classList.add('active');
        
        // 데이터 업데이트
        const tab = button.dataset.tab;
        updateStocksList(tab);
    });
});

// 주식 목록 업데이트
function updateStocksList(tab) {
    const stocksList = document.getElementById('stocksList');
    const stocks = stockData[tab];
    
    stocksList.innerHTML = stocks.map(stock => `
        <div class="stock-item">
            <div class="stock-rank">${stock.rank}</div>
            <div class="stock-info">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-code">${stock.code}</div>
            </div>
            <div class="stock-price">${stock.price}</div>
            <div class="stock-change ${stock.isPositive ? 'positive' : 'negative'}">${stock.change}</div>
        </div>
    `).join('');
    
    // 애니메이션 효과
    const items = stocksList.querySelectorAll('.stock-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// 섹션 새로고침
function refreshSection(section) {
    const button = event.currentTarget;
    button.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
        button.style.transform = 'rotate(0deg)';
    }, 500);
    
    // 실제로는 여기서 API 호출을 통해 데이터를 새로고침
    console.log(`Refreshing ${section} section...`);
    
    // 시각적 피드백
    const card = button.closest('.card');
    card.style.opacity = '0.7';
    setTimeout(() => {
        card.style.opacity = '1';
    }, 300);
}

// 지수 값 애니메이션 (숫자가 올라가는 효과)
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, 16);
}

// 페이지 로드 시 지수 값 애니메이션
window.addEventListener('load', () => {
    const kospi = document.getElementById('kospi');
    const kosdaq = document.getElementById('kosdaq');
    const sp500 = document.getElementById('sp500');
    const nasdaq = document.getElementById('nasdaq');
    
    if (kospi) animateValue(kospi, 2600, 2645.27, 1000);
    if (kosdaq) animateValue(kosdaq, 750, 785.43, 1000);
    if (sp500) animateValue(sp500, 5200, 5234.18, 1000);
    if (nasdaq) animateValue(nasdaq, 16200, 16315.70, 1000);
});

// 스크롤 시 카드 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

// 전략 카드 호버 효과
const strategyCards = document.querySelectorAll('.strategy-card');
strategyCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// 실시간 데이터 업데이트 시뮬레이션 (5초마다)
setInterval(() => {
    // 실제로는 웹소켓이나 API를 통해 실시간 데이터를 받아옴
    const indices = ['kospi', 'kosdaq', 'sp500', 'nasdaq'];
    indices.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const currentValue = parseFloat(element.textContent.replace(/,/g, ''));
            const change = (Math.random() - 0.5) * 10;
            const newValue = currentValue + change;
            animateValue(element, currentValue, newValue, 500);
        }
    });
}, 5000);

// 뉴스 아이템 클릭 시 확장
const newsItems = document.querySelectorAll('.news-item');
newsItems.forEach(item => {
    item.addEventListener('click', () => {
        item.style.transform = 'translateX(8px) scale(1.02)';
        setTimeout(() => {
            item.style.transform = 'translateX(8px)';
        }, 200);
    });
});

// 학습 태그 클릭 이벤트
const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        // 실제로는 해당 학습 자료로 이동
        console.log('Learning resource clicked:', tag.textContent);
        
        // 시각적 피드백
        tag.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tag.style.transform = 'scale(1)';
        }, 100);
    });
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R: 전체 새로고침
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        location.reload();
    }
    
    // 숫자 키 1-6: 해당 섹션으로 스크롤
    if (e.key >= '1' && e.key <= '6') {
        const section = document.querySelector(`[data-section="${e.key}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// 포트폴리오 값 실시간 업데이트 시뮬레이션
setInterval(() => {
    const portfolioValues = document.querySelectorAll('.portfolio-value');
    portfolioValues.forEach((value, index) => {
        if (index === 0) {
            // 총 평가액
            const currentValue = parseInt(value.textContent.replace(/[^0-9]/g, ''));
            const change = Math.floor((Math.random() - 0.5) * 100000);
            const newValue = currentValue + change;
            value.textContent = newValue.toLocaleString() + '원';
        } else if (index === 1) {
            // 수익률
            const currentRate = parseFloat(value.textContent.replace(/[^0-9.-]/g, ''));
            const change = (Math.random() - 0.5) * 0.5;
            const newRate = (currentRate + change).toFixed(1);
            value.textContent = (newRate >= 0 ? '+' : '') + newRate + '%';
            value.className = newRate >= 0 ? 'portfolio-value positive' : 'portfolio-value negative';
        }
    });
}, 3000);

console.log('Stock Dashboard initialized successfully! 🚀');
console.log('Keyboard shortcuts:');
console.log('- 1-6: Jump to section');
console.log('- Ctrl/Cmd + R: Refresh page');
