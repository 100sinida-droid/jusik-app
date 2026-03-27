// ==================== API CONFIGURATION ====================
const API_CONFIG = {
    // Finnhub API - 무료 API 키: https://finnhub.io/register
    FINNHUB_KEY: 'demo', // 'demo' 대신 실제 API 키 입력
};

// 주식 심볼 목록
const STOCK_SYMBOLS = {
    KR: [
        { symbol: 'SSNLF', name: '삼성전자', code: '005930' },
        { symbol: '000660.KS', name: 'SK하이닉스', code: '000660' },
        { symbol: 'KAKOF', name: '카카오', code: '035720' },
        { symbol: 'LGCHF', name: 'LG화학', code: '051910' },
        { symbol: 'NAVER', name: '네이버', code: '035420' },
        { symbol: 'SSNGY', name: '삼성바이오', code: '207940' }
    ],
    US: [
        { symbol: 'AAPL', name: 'Apple', code: 'AAPL' },
        { symbol: 'NVDA', name: 'NVIDIA', code: 'NVDA' },
        { symbol: 'TSLA', name: 'Tesla', code: 'TSLA' },
        { symbol: 'MSFT', name: 'Microsoft', code: 'MSFT' },
        { symbol: 'GOOGL', name: 'Google', code: 'GOOGL' },
        { symbol: 'AMZN', name: 'Amazon', code: 'AMZN' },
        { symbol: 'META', name: 'Meta', code: 'META' },
        { symbol: 'AMD', name: 'AMD', code: 'AMD' }
    ]
};

// 현재 시장 및 필터 상태
let currentMarket = 'kr';
let allStocks = [];
let currentVideoCategory = 'all';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('StockMind 초기화 시작...');
    
    initializeNavigation();
    loadMarketData();
    loadStockData();
    loadYoutubeVideos();
    
    // 30초마다 데이터 업데이트
    setInterval(() => {
        loadMarketData();
        loadStockData();
    }, 30000);
    
    console.log('StockMind 초기화 완료!');
});

// ==================== NAVIGATION ====================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
}
// ==================== MARKET DATA ====================
async function loadMarketData() {
    const container = document.getElementById('marketContent');
    
    try {
        console.log('시장 데이터 로딩 중...');
        
        const indices = currentMarket === 'kr' 
            ? [
                { symbol: '^KS11', name: 'KOSPI', exchange: 'KRX' },
                { symbol: '^KQ11', name: 'KOSDAQ', exchange: 'KRX' },
                { symbol: '^KS200', name: 'KOSPI 200', exchange: 'KRX' }
              ]
            : [
                { symbol: '^IXIC', name: 'NASDAQ', exchange: 'US' },
                { symbol: '^GSPC', name: 'S&P 500', exchange: 'US' },
                { symbol: '^DJI', name: 'Dow Jones', exchange: 'US' }
              ];
        
        // Finnhub API 사용
        const indexData = await Promise.all(
            indices.map(index => fetchFinnhubQuote(index.symbol, index.name))
        );
        
        displayMarketData(indexData);
        console.log('시장 데이터 로딩 완료');
        
    } catch (error) {
        console.error('시장 데이터 로딩 오류:', error);
        container.innerHTML = '<div class="loading">시장 데이터를 불러올 수 없습니다.</div>';
    }
}

async function fetchFinnhubQuote(symbol, name) {
    try {
        // Finnhub API 호출
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_CONFIG.FINNHUB_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.c) {
            const currentPrice = data.c; // current price
            const previousClose = data.pc; // previous close
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            return {
                name: name,
                value: currentPrice.toFixed(2),
                change: changePercent.toFixed(2),
                positive: change >= 0,
                trend: []
            };
        }
    } catch (error) {
        console.error(`${symbol} 데이터 오류:`, error);
    }
    
    // 실패 시 기본값
    return {
        name: name,
        value: '0.00',
        change: '0.00',
        positive: true,
        trend: []
    };
}

function displayMarketData(indexData) {
    const container = document.getElementById('marketContent');
    
    const html = `
        <div class="indices-grid">
            ${indexData.map(index => `
                <div class="index-card">
                    <div class="index-header">
                        <span class="index-name">${index.name}</span>
                        <span class="index-change ${index.positive ? 'positive' : 'negative'}">
                            ${index.positive ? '▲' : '▼'} ${Math.abs(index.change)}%
                        </span>
                    </div>
                    <div class="index-value">${formatNumber(index.value)}</div>
                    <div class="mini-chart" data-trend="${index.positive ? 'up' : 'down'}">
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                            <polyline points="0,${index.positive ? '20' : '10'} 25,${index.positive ? '18' : '12'} 50,${index.positive ? '15' : '15'} 75,${index.positive ? '12' : '18'} 100,${index.positive ? '8' : '22'}" 
                                stroke="${index.positive ? 'var(--accent-green)' : 'var(--accent-red)'}" 
                                stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

function switchMarket(market) {
    currentMarket = market;
    
    // 탭 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.market === market) {
            btn.classList.add('active');
        }
    });
    
    loadMarketData();
    loadStockData();
}
// ==================== STOCK DATA ====================
async function loadStockData() {
    const container = document.getElementById('popularStocks');
    container.innerHTML = '<div class="loading">주식 데이터 로딩 중...</div>';
    
    try {
        console.log('주식 데이터 로딩 중...');
        
        const symbols = STOCK_SYMBOLS[currentMarket === 'kr' ? 'KR' : 'US'];
        
        const stocksData = await Promise.all(
            symbols.map(stock => fetchStockQuote(stock))
        );
        
        allStocks = stocksData.filter(s => s !== null);
        displayStocks(allStocks);
        
        console.log('주식 데이터 로딩 완료:', allStocks.length);
        
    } catch (error) {
        console.error('주식 데이터 로딩 오류:', error);
        container.innerHTML = '<div class="loading">주식 데이터를 불러올 수 없습니다.</div>';
    }
}

async function fetchStockQuote(stock) {
    try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_CONFIG.FINNHUB_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.c) {
            const currentPrice = data.c;
            const previousClose = data.pc;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            const isKorean = currentMarket === 'kr';
            
            return {
                name: stock.name,
                code: stock.code,
                symbol: stock.symbol,
                price: isKorean ? formatNumber(Math.round(currentPrice * 1000)) : `$${currentPrice.toFixed(2)}`,
                rawPrice: currentPrice,
                change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                changeValue: changePercent,
                flag: isKorean ? '🇰🇷' : '🇺🇸',
                positive: changePercent >= 0,
                market: currentMarket
            };
        }
    } catch (error) {
        console.error(`${stock.symbol} 데이터 오류:`, error);
    }
    return null;
}

function displayStocks(stocks) {
    const container = document.getElementById('popularStocks');
    
    if (stocks.length === 0) {
        container.innerHTML = '<div class="loading">데이터가 없습니다.</div>';
        return;
    }
    
    container.innerHTML = '';
    stocks.forEach((stock, index) => {
        const card = createStockCard(stock);
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
        container.appendChild(card);
    });
}

function createStockCard(stock) {
    const card = document.createElement('div');
    card.className = 'stock-card';
    
    card.innerHTML = `
        <div class="stock-header">
            <div class="stock-info">
                <h3>${stock.name}</h3>
                <span class="stock-code">${stock.code}</span>
            </div>
            <span class="stock-flag">${stock.flag}</span>
        </div>
        <div class="stock-price">${stock.price}</div>
        <div class="stock-change ${stock.positive ? 'positive' : 'negative'}">
            ${stock.change}
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.open(`https://finnhub.io/quote/${stock.symbol}`, '_blank');
    });
    
    return card;
}
// ==================== FILTER FUNCTIONS ====================
function toggleFilters() {
    const panel = document.getElementById('filterPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function applyFilters() {
    const marketFilter = document.getElementById('filterMarket').value;
    const changeFilter = document.getElementById('filterChange').value;
    const sortFilter = document.getElementById('filterSort').value;
    
    console.log('필터 적용:', { marketFilter, changeFilter, sortFilter });
    
    let filtered = [...allStocks];
    
    // 시장 필터
    if (marketFilter !== 'all') {
        filtered = filtered.filter(stock => stock.market === marketFilter);
    }
    
    // 등락 필터
    if (changeFilter === 'up') {
        filtered = filtered.filter(stock => stock.positive);
    } else if (changeFilter === 'down') {
        filtered = filtered.filter(stock => !stock.positive);
    }
    
    // 정렬
    if (sortFilter === 'change') {
        filtered.sort((a, b) => b.changeValue - a.changeValue);
    } else if (sortFilter === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortFilter === 'price') {
        filtered.sort((a, b) => b.rawPrice - a.rawPrice);
    }
    
    displayStocks(filtered);
    console.log('필터 결과:', filtered.length, '개 종목');
}

function resetFilters() {
    document.getElementById('filterMarket').value = 'all';
    document.getElementById('filterChange').value = 'all';
    document.getElementById('filterSort').value = 'change';
    
    displayStocks(allStocks);
    console.log('필터 초기화');
}
// ==================== SEARCH FUNCTIONS ====================
function performSearch() {
    const query = document.getElementById('mainSearch').value.trim();
    
    if (!query) {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    console.log('검색 실행:', query);
    
    // 자체 검색 실행
    const results = searchStocks(query);
    
    // 검색 결과 페이지 표시
    showSearchResults(query, results);
}

function searchStocks(query) {
    const lowerQuery = query.toLowerCase();
    
    // 모든 주식에서 검색
    const allSymbols = [...STOCK_SYMBOLS.KR, ...STOCK_SYMBOLS.US];
    
    const results = allSymbols.filter(stock => {
        return stock.name.toLowerCase().includes(lowerQuery) ||
               stock.code.toLowerCase().includes(lowerQuery) ||
               stock.symbol.toLowerCase().includes(lowerQuery);
    });
    
    console.log('검색 결과:', results.length, '개');
    return results;
}

async function showSearchResults(query, results) {
    // 메인 컨텐츠 숨기기
    document.getElementById('mainContent').style.display = 'none';
    
    // 검색 결과 페이지 표시
    const searchPage = document.getElementById('searchResults');
    searchPage.style.display = 'block';
    
    // 검색어 표시
    document.getElementById('searchQuery').textContent = `"${query}" 검색 결과 (${results.length}개)`;
    
    // 결과 컨텐츠
    const container = document.getElementById('searchResultsContent');
    
    if (results.length === 0) {
        container.innerHTML = '<div class="loading">검색 결과가 없습니다.</div>';
        return;
    }
    
    container.innerHTML = '<div class="loading">데이터 로딩 중...</div>';
    
    // 각 결과에 대한 실시간 데이터 가져오기
    const stocksData = await Promise.all(
        results.map(stock => fetchStockQuote(stock))
    );
    
    const validStocks = stocksData.filter(s => s !== null);
    
    if (validStocks.length === 0) {
        container.innerHTML = '<div class="loading">데이터를 불러올 수 없습니다.</div>';
        return;
    }
    
    container.innerHTML = '';
    validStocks.forEach((stock, index) => {
        const card = createStockCard(stock);
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
        container.appendChild(card);
    });
}

function hideSearchResults() {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

// Enter 키 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});
// ==================== YOUTUBE VIDEOS ====================
const YOUTUBE_VIDEOS = [
    {
        title: '2026년 주식시장 전망 - 금리 인하 시대의 투자 전략',
        channel: '슈카월드',
        category: 'market',
        url: 'https://www.youtube.com/@ShukaWorld',
        thumbnail: 'https://i.ytimg.com/vi/placeholder1/mqdefault.jpg'
    },
    {
        title: '삼성전자 주가 분석 - 반도체 업황 회복 시그널',
        channel: '증시각도기',
        category: 'stock',
        url: 'https://www.youtube.com/@stockangle',
        thumbnail: 'https://i.ytimg.com/vi/placeholder2/mqdefault.jpg'
    },
    {
        title: 'NVIDIA 주가 전망 - AI 붐은 계속될까?',
        channel: '박곰희TV',
        category: 'stock',
        url: 'https://www.youtube.com/@parkbearTV',
        thumbnail: 'https://i.ytimg.com/vi/placeholder3/mqdefault.jpg'
    },
    {
        title: '차트 보는 법 완벽 가이드 - 캔들, 이동평균선, RSI',
        channel: '소수몽키',
        category: 'chart',
        url: 'https://www.youtube.com/@sosoomonkey',
        thumbnail: 'https://i.ytimg.com/vi/placeholder4/mqdefault.jpg'
    },
    {
        title: '주식 초보 필수 강의 - PER, PBR, ROE 완벽 이해',
        channel: '슈카월드',
        category: 'beginner',
        url: 'https://www.youtube.com/@ShukaWorld',
        thumbnail: 'https://i.ytimg.com/vi/placeholder5/mqdefault.jpg'
    },
    {
        title: '오늘의 시황 분석 - 코스피 2700 돌파 가능할까?',
        channel: '증시각도기',
        category: 'market',
        url: 'https://www.youtube.com/@stockangle',
        thumbnail: 'https://i.ytimg.com/vi/placeholder6/mqdefault.jpg'
    },
    {
        title: '2차전지 관련주 총정리 - 투자 포인트는?',
        channel: '박곰희TV',
        category: 'stock',
        url: 'https://www.youtube.com/@parkbearTV',
        thumbnail: 'https://i.ytimg.com/vi/placeholder7/mqdefault.jpg'
    },
    {
        title: '이동평균선 활용 전략 - 골든크로스와 데드크로스',
        channel: '소수몽키',
        category: 'chart',
        url: 'https://www.youtube.com/@sosoomonkey',
        thumbnail: 'https://i.ytimg.com/vi/placeholder8/mqdefault.jpg'
    }
];

function loadYoutubeVideos() {
    filterVideos('all');
}

function filterVideos(category) {
    currentVideoCategory = category;
    
    // 필터 버튼 활성화
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // 영상 필터링
    const filtered = category === 'all' 
        ? YOUTUBE_VIDEOS 
        : YOUTUBE_VIDEOS.filter(v => v.category === category);
    
    displayVideos(filtered);
}

function displayVideos(videos) {
    const container = document.getElementById('youtubeVideos');
    
    if (videos.length === 0) {
        container.innerHTML = '<div class="loading">해당 카테고리의 영상이 없습니다.</div>';
        return;
    }
    
    const categoryLabels = {
        'market': '시황분석',
        'stock': '종목분석',
        'chart': '차트분석',
        'beginner': '초보가이드'
    };
    
    container.innerHTML = '';
    videos.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                    ▶
                </div>
                <div class="video-duration">15:30</div>
            </div>
            <div class="video-info">
                <span class="video-category">${categoryLabels[video.category]}</span>
                <h3 class="video-title">${video.title}</h3>
                <p class="video-channel">${video.channel}</p>
                <div class="video-meta">
                    <span>최근 영상</span>
                </div>
            </div>
        `;
        
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
        
        card.addEventListener('click', () => {
            window.open(video.url, '_blank');
        });
        
        container.appendChild(card);
    });
}
// ==================== INFO PAGE ====================
function showInfoPage(type = 'news') {
    // 메인 컨텐츠 숨기기
    document.getElementById('mainContent').style.display = 'none';
    
    // 정보 페이지 표시
    const infoPage = document.getElementById('infoPage');
    infoPage.style.display = 'block';
    
    const titles = {
        'realtime': '실시간 시세 정보',
        'financial': '재무 분석 정보',
        'chart': '차트 분석 정보',
        'news': '뉴스 & 공시 정보'
    };
    
    const contents = {
        'realtime': `
            <div class="info-section">
                <h3>📊 실시간 시세</h3>
                <p>StockMind는 Finnhub API를 통해 실시간 주식 시세 정보를 제공합니다.</p>
                <p><strong>제공 정보:</strong></p>
                <ul>
                    <li>현재가 및 전일 대비 변동률</li>
                    <li>당일 고가 / 저가</li>
                    <li>거래량 및 거래대금</li>
                    <li>시가총액</li>
                    <li>외국인 및 기관 매매 동향</li>
                </ul>
            </div>
            <div class="info-section">
                <h3>🔄 업데이트 주기</h3>
                <p>실시간 데이터는 30초마다 자동으로 업데이트됩니다.</p>
                <p>한국 시장: 09:00 - 15:30 (KST)</p>
                <p>미국 시장: 23:30 - 06:00 다음날 (KST)</p>
            </div>
        `,
        'financial': `
            <div class="info-section">
                <h3>💰 재무 분석</h3>
                <p>기업의 재무 건전성과 수익성을 분석할 수 있는 다양한 지표를 제공합니다.</p>
                <p><strong>주요 지표:</strong></p>
                <ul>
                    <li><strong>PER (주가수익비율):</strong> 주가가 주당순이익의 몇 배인지 나타내는 지표</li>
                    <li><strong>PBR (주가순자산비율):</strong> 주가가 주당순자산의 몇 배인지 나타내는 지표</li>
                    <li><strong>EPS (주당순이익):</strong> 기업이 벌어들인 순이익을 주식수로 나눈 값</li>
                    <li><strong>ROE (자기자본이익률):</strong> 자기자본 대비 순이익 비율</li>
                    <li><strong>배당수익률:</strong> 주가 대비 배당금 비율</li>
                </ul>
            </div>
        `,
        'chart': `
            <div class="info-section">
                <h3>📈 차트 분석</h3>
                <p>기술적 분석을 위한 다양한 차트와 지표를 제공합니다.</p>
                <p><strong>제공 차트:</strong></p>
                <ul>
                    <li>캔들스틱 차트</li>
                    <li>이동평균선 (5일, 20일, 60일, 120일)</li>
                    <li>거래량 그래프</li>
                    <li>볼린저 밴드</li>
                </ul>
                <p><strong>기술적 지표:</strong></p>
                <ul>
                    <li><strong>RSI (상대강도지수):</strong> 과매수/과매도 판단</li>
                    <li><strong>MACD:</strong> 추세 전환점 포착</li>
                    <li><strong>스토캐스틱:</strong> 모멘텀 지표</li>
                </ul>
            </div>
        `,
        'news': `
            <div class="info-section">
                <h3>📰 뉴스 & 공시</h3>
                <p>종목 관련 최신 뉴스와 공시 정보를 실시간으로 제공합니다.</p>
                <p><strong>제공 정보:</strong></p>
                <ul>
                    <li>실시간 증권 뉴스</li>
                    <li>기업 공시 정보 (분기보고서, 사업보고서)</li>
                    <li>증권사 리서치 리포트</li>
                    <li>공매도 동향</li>
                    <li>외국인/기관 매매 동향</li>
                </ul>
            </div>
            <div class="info-section">
                <h3>🔔 알림 서비스</h3>
                <p>중요 공시 및 급등/급락 알림을 받을 수 있습니다. (곧 출시 예정)</p>
            </div>
        `
    };
    
    document.getElementById('infoPageTitle').textContent = titles[type] || titles['news'];
    document.getElementById('infoPageContent').innerHTML = contents[type] || contents['news'];
}

function hideInfoPage() {
    document.getElementById('infoPage').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

// ==================== UTILITY FUNCTIONS ====================
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
}

// ==================== ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
});

console.log('StockMind v1.0 - 모든 스크립트 로드 완료');
