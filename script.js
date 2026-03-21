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
