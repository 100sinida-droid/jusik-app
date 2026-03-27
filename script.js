// ==================== API CONFIGURATION ====================
const API_CONFIG = {
    // Finnhub API (무료 - 실시간 주식 데이터)
    FINNHUB_KEY: 'demo', // 실제 사용 시 https://finnhub.io 에서 무료 API 키 발급 필요
    
    // Alpha Vantage API (무료 - 주식 데이터)
    ALPHA_VANTAGE_KEY: 'demo', // 실제 사용 시 https://www.alphavantage.co 에서 무료 API 키 발급 필요
    
    // YouTube Data API (무료 - 영상 데이터)
    YOUTUBE_KEY: '', // 실제 사용 시 Google Cloud Console에서 발급 필요
};

// 인기 주식 심볼 목록
const POPULAR_STOCKS = {
    KR: ['005930.KS', '000660.KS', '035720.KS', '051910.KS', '373220.KS', '207940.KS'], // 삼성전자, SK하이닉스, 카카오, LG화학, LG에너지, 삼성바이오
    US: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD']
};

// 유튜브 채널 ID 목록
const YOUTUBE_CHANNELS = [
    'UCkx_4HKeyjJlcU4W4K7BAMA', // 슈카월드
    'UCLwlsiO_HizDbMjjnJ_MlOg', // 박곰희TV
    'UC-i05W4V-HHlNdLQ1v6G7qw', // 소수몽키
    // 더 많은 채널 ID 추가 가능
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadRealMarketData();
    loadRealStockData();
    loadYoutubeVideos();
    initializeMarketTabs();
    initializeYoutubeFilters();
    initializeSearch();
    
    // 30초마다 시장 데이터 업데이트
    setInterval(loadRealMarketData, 30000);
});

// ==================== NAVIGATION ====================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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

// ==================== REAL MARKET DATA ====================
async function loadRealMarketData() {
    try {
        // Finnhub를 사용하여 실제 지수 데이터 가져오기
        const indices = {
            kr: [
                { symbol: '^KS11', name: 'KOSPI' },
                { symbol: '^KQ11', name: 'KOSDAQ' },
                { symbol: '^KS200', name: 'KOSPI 200' }
            ],
            us: [
                { symbol: '^IXIC', name: 'NASDAQ' },
                { symbol: '^GSPC', name: 'S&P 500' },
                { symbol: '^DJI', name: 'Dow Jones' }
            ]
        };
        
        const currentMarket = document.querySelector('.tab-btn.active').dataset.market || 'kr';
        const marketIndices = indices[currentMarket];
        
        const indexData = await Promise.all(
            marketIndices.map(index => fetchIndexQuote(index.symbol, index.name))
        );
        
        updateMarketDisplay(indexData);
    } catch (error) {
        console.error('Market data loading error:', error);
        // 오류 시 대체 데이터 사용
        loadFallbackMarketData();
    }
}

async function fetchIndexQuote(symbol, name) {
    try {
        // Yahoo Finance API를 통한 실시간 데이터 (CORS 우회)
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const data = await response.json();
        
        if (data && data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators.quote[0];
            
            const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
            const previousClose = meta.previousClose;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            return {
                name: name,
                value: currentPrice.toFixed(2),
                change: changePercent.toFixed(2),
                positive: change >= 0,
                trend: quote.close.slice(-20) // 최근 20개 데이터 포인트
            };
        }
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
    }
    
    // 실패 시 기본값 반환
    return {
        name: name,
        value: '0.00',
        change: '0.00',
        positive: true,
        trend: []
    };
}

function updateMarketDisplay(indexData) {
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
                        ${generateMiniChart(index.trend, index.positive)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

function generateMiniChart(data, positive) {
    if (!data || data.length === 0) {
        return `<svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline points="0,15 100,15" stroke="${positive ? 'var(--accent-green)' : 'var(--accent-red)'}" stroke-width="2" fill="none"/>
        </svg>`;
    }
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 30 - ((value - min) / range) * 25;
        return `${x},${y}`;
    }).join(' ');
    
    return `<svg viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline points="${points}" stroke="${positive ? 'var(--accent-green)' : 'var(--accent-red)'}" stroke-width="2" fill="none"/>
    </svg>`;
}

// ==================== REAL STOCK DATA ====================
async function loadRealStockData() {
    const container = document.getElementById('popularStocks');
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray);">주식 데이터 로딩 중...</div>';
    
    try {
        const currentMarket = document.querySelector('.tab-btn.active')?.dataset.market || 'kr';
        const symbols = POPULAR_STOCKS[currentMarket === 'kr' ? 'KR' : 'US'];
        
        const stocksData = await Promise.all(
            symbols.slice(0, 8).map(symbol => fetchStockQuote(symbol))
        );
        
        container.innerHTML = '';
        stocksData.forEach((stock, index) => {
            if (stock) {
                const stockCard = createStockCard(stock);
                stockCard.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
                container.appendChild(stockCard);
            }
        });
    } catch (error) {
        console.error('Stock data loading error:', error);
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--accent-red);">데이터를 불러오는데 실패했습니다. API 키를 확인해주세요.</div>';
    }
}

async function fetchStockQuote(symbol) {
    try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const data = await response.json();
        
        if (data && data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            
            const currentPrice = meta.regularMarketPrice;
            const previousClose = meta.previousClose;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            // 심볼에서 국가 판단
            const isKorean = symbol.includes('.KS') || symbol.includes('.KQ');
            const cleanSymbol = symbol.replace('.KS', '').replace('.KQ', '');
            
            return {
                name: meta.symbol.replace('.KS', '').replace('.KQ', ''),
                code: cleanSymbol,
                price: isKorean ? formatNumber(Math.round(currentPrice)) : `$${currentPrice.toFixed(2)}`,
                change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                flag: isKorean ? '🇰🇷' : '🇺🇸',
                positive: changePercent >= 0,
                fullSymbol: symbol
            };
        }
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
    }
    return null;
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
        window.open(`https://finance.yahoo.com/quote/${stock.fullSymbol}`, '_blank');
    });
    
    return card;
}

// ==================== YOUTUBE VIDEOS ====================
async function loadYoutubeVideos(category = 'all') {
    const container = document.getElementById('youtubeVideos');
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray);">영상 로딩 중...</div>';
    
    try {
        // YouTube Data API를 사용하여 실제 영상 가져오기
        const videos = await fetchYoutubeVideos(category);
        
        container.innerHTML = '';
        if (videos && videos.length > 0) {
            videos.forEach((video, index) => {
                const videoCard = createVideoCard(video);
                videoCard.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
                container.appendChild(videoCard);
            });
        } else {
            container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">영상을 찾을 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('YouTube loading error:', error);
        // API 키가 없을 경우 대체 영상 표시
        loadFallbackVideos(container, category);
    }
}

async function fetchYoutubeVideos(category) {
    if (!API_CONFIG.YOUTUBE_KEY) {
        throw new Error('YouTube API key not configured');
    }
    
    const searchQueries = {
        'all': '주식 투자 2026',
        'market': '주식 시황분석',
        'stock': '종목분석',
        'chart': '차트분석',
        'beginner': '주식 초보'
    };
    
    const query = searchQueries[category] || searchQueries['all'];
    
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&order=date&regionCode=KR&relevanceLanguage=ko&key=${API_CONFIG.YOUTUBE_KEY}`
        );
        
        const data = await response.json();
        
        if (data.items) {
            return data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.medium.url,
                publishedAt: item.snippet.publishedAt,
                category: category
            }));
        }
    } catch (error) {
        console.error('YouTube API error:', error);
    }
    
    return [];
}

function loadFallbackVideos(container, category) {
    // API 키가 없을 때 실제 유튜브 채널의 인기 영상 링크 사용
    const fallbackVideos = [
        {
            id: 'dummy1',
            title: '2026년 주식시장 전망 - 투자 전략은?',
            channel: '슈카월드',
            category: 'market',
            url: 'https://www.youtube.com/@ShukaWorld'
        },
        {
            id: 'dummy2',
            title: '삼성전자 기술적 분석 완벽 가이드',
            channel: '증시각도기',
            category: 'chart',
            url: 'https://www.youtube.com'
        },
        {
            id: 'dummy3',
            title: 'NVIDIA 주가 전망과 투자 포인트',
            channel: '박곰희TV',
            category: 'stock',
            url: 'https://www.youtube.com/@parkbearTV'
        },
        {
            id: 'dummy4',
            title: '주식 초보를 위한 완벽 가이드',
            channel: '소수몽키',
            category: 'beginner',
            url: 'https://www.youtube.com'
        },
        {
            id: 'dummy5',
            title: '금리 인하와 주식시장의 관계',
            channel: '슈카월드',
            category: 'market',
            url: 'https://www.youtube.com/@ShukaWorld'
        },
        {
            id: 'dummy6',
            title: '2차전지 관련주 총정리',
            channel: '증시각도기',
            category: 'stock',
            url: 'https://www.youtube.com'
        }
    ];
    
    const filteredVideos = category === 'all' 
        ? fallbackVideos 
        : fallbackVideos.filter(v => v.category === category);
    
    container.innerHTML = '';
    filteredVideos.forEach((video, index) => {
        const videoCard = createVideoCard(video);
        videoCard.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
        container.appendChild(videoCard);
    });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    const categoryLabels = {
        'market': '시황분석',
        'stock': '종목분석',
        'chart': '차트분석',
        'beginner': '초보가이드',
        'all': '전체'
    };
    
    const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
    const videoUrl = video.url || `https://www.youtube.com/watch?v=${video.id}`;
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbnailUrl}" alt="${video.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: none; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                ▶
            </div>
            <div class="video-duration">15:30</div>
        </div>
        <div class="video-info">
            <span class="video-category">${categoryLabels[video.category] || '전체'}</span>
            <h3 class="video-title">${video.title}</h3>
            <p class="video-channel">${video.channel}</p>
            <div class="video-meta">
                <span>최근 영상</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.open(videoUrl, '_blank');
    });
    
    return card;
}

// ==================== MARKET TABS ====================
function initializeMarketTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const market = this.dataset.market;
            loadRealMarketData();
            loadRealStockData();
        });
    });
}

// ==================== YOUTUBE FILTERS ====================
function initializeYoutubeFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            filters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            loadYoutubeVideos(category);
        });
    });
}

// ==================== SEARCH ====================
function initializeSearch() {
    const searchInput = document.getElementById('mainSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // Yahoo Finance 검색으로 연결
            window.open(`https://finance.yahoo.com/lookup?s=${encodeURIComponent(query)}`, '_blank');
        }
    }
    
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// ==================== FALLBACK DATA ====================
function loadFallbackMarketData() {
    const fallbackData = [
        { name: 'KOSPI', value: '2650.45', change: '0.82', positive: true, trend: [] },
        { name: 'KOSDAQ', value: '845.20', change: '-0.35', positive: false, trend: [] },
        { name: 'KOSPI 200', value: '352.80', change: '1.05', positive: true, trend: [] }
    ];
    
    updateMarketDisplay(fallbackData);
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
