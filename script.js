// Cryptocurrency Trading App - Main JavaScript
class CryptoTradingApp {
    constructor() {
        this.apiKey = null; // Using free tier of CoinGecko API (no key required)
        this.baseUrl = 'https://api.coingecko.com/api/v3';
        this.selectedCrypto = 'bitcoin';
        this.chart = null;
        this.portfolioData = this.loadPortfolio();
        this.marketData = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.showLoadingOverlay();
        
        try {
            await Promise.all([
                this.loadMarketOverview(),
                this.loadCryptoList(),
                this.loadSelectedCryptoData()
            ]);
            this.initializeChart();
            this.hideLoadingOverlay();
            this.showToast('Market data loaded successfully!', 'success');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hideLoadingOverlay();
            this.showToast('Failed to load market data. Please refresh the page.', 'error');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.getAttribute('href').substring(1));
            });
        });

        // Crypto selector
        const cryptoSelector = document.getElementById('crypto-selector');
        if (cryptoSelector) {
            cryptoSelector.addEventListener('change', (e) => {
                this.selectedCrypto = e.target.value;
                this.loadSelectedCryptoData();
            });
        }

        // Trading tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Trading forms
        document.querySelectorAll('.trading-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTrade(e.target);
            });
        });

        // Buy amount input
        const buyAmountInput = document.getElementById('buy-amount');
        if (buyAmountInput) {
            buyAmountInput.addEventListener('input', () => {
                this.calculateEstimatedCoins();
            });
        }

        // Sell amount input
        const sellAmountInput = document.getElementById('sell-amount');
        if (sellAmountInput) {
            sellAmountInput.addEventListener('input', () => {
                this.calculateEstimatedUSD();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('crypto-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCryptoTable(e.target.value);
            });
        }

        // Timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadChartData(e.target.dataset.timeframe);
            });
        });
    }

    async loadMarketOverview() {
        try {
            const response = await fetch(`${this.baseUrl}/global`);
            const data = await response.json();
            
            if (data && data.data) {
                this.updateMarketOverview(data.data);
            }
        } catch (error) {
            console.error('Failed to load market overview:', error);
        }
    }

    updateMarketOverview(data) {
        const totalMarketCapEl = document.getElementById('total-market-cap');
        const activeCryptosEl = document.getElementById('active-cryptos');
        const btcDominanceEl = document.getElementById('btc-dominance');

        if (totalMarketCapEl && data.total_market_cap) {
            totalMarketCapEl.textContent = this.formatCurrency(data.total_market_cap.usd);
        }

        if (activeCryptosEl && data.active_cryptocurrencies) {
            activeCryptosEl.textContent = data.active_cryptocurrencies.toLocaleString();
        }

        if (btcDominanceEl && data.market_cap_percentage) {
            btcDominanceEl.textContent = `${data.market_cap_percentage.btc.toFixed(2)}%`;
        }
    }

    async loadCryptoList() {
        try {
            const response = await fetch(`${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`);
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                this.marketData = data;
                this.renderCryptoTable(data);
            }
        } catch (error) {
            console.error('Failed to load crypto list:', error);
        }
    }

    renderCryptoTable(cryptos) {
        const tableBody = document.getElementById('crypto-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = cryptos.map((crypto, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="crypto-name">
                        <div class="crypto-icon" style="background: linear-gradient(135deg, #${this.generateColor(crypto.symbol)}, #${this.generateColor(crypto.symbol, true)});">
                            ${crypto.symbol.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div>${crypto.name}</div>
                            <div class="crypto-symbol">${crypto.symbol.toUpperCase()}</div>
                        </div>
                    </div>
                </td>
                <td>$${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                <td>
                    <span class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.price_change_percentage_24h >= 0 ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%
                    </span>
                </td>
                <td>$${this.formatCurrency(crypto.market_cap)}</td>
                <td>$${this.formatCurrency(crypto.total_volume)}</td>
                <td>
                    <button class="trade-btn" onclick="app.selectCryptoForTrading('${crypto.id}')">
                        Trade
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadSelectedCryptoData() {
        try {
            const response = await fetch(`${this.baseUrl}/coins/${this.selectedCrypto}`);
            const data = await response.json();
            
            if (data && data.market_data) {
                this.updateTradingPanelPrices(data.market_data.current_price.usd);
            }
            
            await this.loadChartData('1D');
        } catch (error) {
            console.error('Failed to load selected crypto data:', error);
        }
    }

    async loadChartData(timeframe) {
        try {
            const days = this.getChartDays(timeframe);
            const response = await fetch(`${this.baseUrl}/coins/${this.selectedCrypto}/market_chart?vs_currency=usd&days=${days}`);
            const data = await response.json();
            
            if (data && data.prices) {
                this.updateChart(data.prices, timeframe);
            }
        } catch (error) {
            console.error('Failed to load chart data:', error);
        }
    }

    getChartDays(timeframe) {
        switch (timeframe) {
            case '1H': return 0.04; // ~1 hour
            case '4H': return 0.17; // ~4 hours
            case '1D': return 1;
            case '1W': return 7;
            default: return 1;
        }
    }

    initializeChart() {
        const ctx = document.getElementById('price-chart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price (USD)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            displayFormats: {
                                hour: 'HH:mm',
                                day: 'MMM DD',
                                week: 'MMM DD'
                            }
                        },
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    updateChart(priceData, timeframe) {
        if (!this.chart) return;

        const labels = priceData.map(point => new Date(point[0]));
        const prices = priceData.map(point => point[1]);

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = prices;
        this.chart.update();
    }

    updateTradingPanelPrices(price) {
        const buyPriceInput = document.getElementById('buy-price');
        const sellPriceInput = document.getElementById('sell-price');

        if (buyPriceInput) {
            buyPriceInput.value = price.toFixed(8);
        }
        if (sellPriceInput) {
            sellPriceInput.value = price.toFixed(8);
        }

        this.calculateEstimatedCoins();
        this.calculateEstimatedUSD();
    }

    calculateEstimatedCoins() {
        const buyAmount = parseFloat(document.getElementById('buy-amount')?.value || 0);
        const buyPrice = parseFloat(document.getElementById('buy-price')?.value || 0);
        const estimatedCoinsInput = document.getElementById('estimated-coins');

        if (estimatedCoinsInput && buyAmount > 0 && buyPrice > 0) {
            const coins = buyAmount / buyPrice;
            estimatedCoinsInput.value = coins.toFixed(8);
        }
    }

    calculateEstimatedUSD() {
        const sellAmount = parseFloat(document.getElementById('sell-amount')?.value || 0);
        const sellPrice = parseFloat(document.getElementById('sell-price')?.value || 0);
        const estimatedUSDInput = document.getElementById('estimated-usd');

        if (estimatedUSDInput && sellAmount > 0 && sellPrice > 0) {
            const usd = sellAmount * sellPrice;
            estimatedUSDInput.value = usd.toFixed(2);
        }
    }

    handleTrade(form) {
        const isSubmitDisabled = this.isLoading;
        if (isSubmitDisabled) return;

        const isBuyForm = form.closest('#buy-tab');
        const tradeType = isBuyForm ? 'buy' : 'sell';
        
        if (tradeType === 'buy') {
            const amount = parseFloat(document.getElementById('buy-amount')?.value || 0);
            const price = parseFloat(document.getElementById('buy-price')?.value || 0);
            const coins = parseFloat(document.getElementById('estimated-coins')?.value || 0);
            
            if (amount > 0 && price > 0 && coins > 0) {
                this.executeTrade(tradeType, amount, price, coins);
            } else {
                this.showToast('Please enter a valid amount', 'error');
            }
        } else {
            const coins = parseFloat(document.getElementById('sell-amount')?.value || 0);
            const price = parseFloat(document.getElementById('sell-price')?.value || 0);
            const usd = parseFloat(document.getElementById('estimated-usd')?.value || 0);
            
            if (coins > 0 && price > 0 && usd > 0) {
                this.executeTrade(tradeType, usd, price, coins);
            } else {
                this.showToast('Please enter a valid amount', 'error');
            }
        }
    }

    executeTrade(type, amount, price, coins) {
        // Simulate trade execution
        const cryptoName = this.selectedCrypto.charAt(0).toUpperCase() + this.selectedCrypto.slice(1);
        
        // Update portfolio
        if (type === 'buy') {
            this.addToPortfolio(this.selectedCrypto, coins, price);
            this.showToast(`Successfully bought ${coins.toFixed(8)} ${cryptoName} for $${amount.toFixed(2)}`, 'success');
        } else {
            this.removeFromPortfolio(this.selectedCrypto, coins, price);
            this.showToast(`Successfully sold ${coins.toFixed(8)} ${cryptoName} for $${amount.toFixed(2)}`, 'success');
        }

        // Clear form
        const form = document.querySelector(`#${type}-tab .trading-form`);
        if (form) {
            form.reset();
            this.calculateEstimatedCoins();
            this.calculateEstimatedUSD();
        }

        // Update portfolio display
        this.updatePortfolioDisplay();
    }

    addToPortfolio(cryptoId, amount, price) {
        if (!this.portfolioData[cryptoId]) {
            this.portfolioData[cryptoId] = { amount: 0, avgPrice: 0 };
        }

        const current = this.portfolioData[cryptoId];
        const totalValue = (current.amount * current.avgPrice) + (amount * price);
        const totalAmount = current.amount + amount;

        this.portfolioData[cryptoId] = {
            amount: totalAmount,
            avgPrice: totalValue / totalAmount
        };

        this.savePortfolio();
    }

    removeFromPortfolio(cryptoId, amount, price) {
        if (this.portfolioData[cryptoId] && this.portfolioData[cryptoId].amount >= amount) {
            this.portfolioData[cryptoId].amount -= amount;
            
            if (this.portfolioData[cryptoId].amount <= 0) {
                delete this.portfolioData[cryptoId];
            }
        }

        this.savePortfolio();
    }

    updatePortfolioDisplay() {
        const portfolioHoldings = document.getElementById('portfolio-holdings');
        if (!portfolioHoldings) return;

        const holdings = Object.entries(this.portfolioData).map(([cryptoId, data]) => {
            const marketCrypto = this.marketData.find(crypto => crypto.id === cryptoId);
            const currentPrice = marketCrypto ? marketCrypto.current_price : data.avgPrice;
            const value = data.amount * currentPrice;
            const pnl = ((currentPrice - data.avgPrice) / data.avgPrice) * 100;

            return {
                name: cryptoId,
                amount: data.amount,
                avgPrice: data.avgPrice,
                currentPrice,
                value,
                pnl
            };
        });

        portfolioHoldings.innerHTML = holdings.map(holding => `
            <div class="portfolio-holding">
                <div class="holding-name">${holding.name.toUpperCase()}</div>
                <div class="holding-amount">${holding.amount.toFixed(8)}</div>
                <div class="holding-value">$${holding.value.toFixed(2)}</div>
                <div class="holding-pnl ${holding.pnl >= 0 ? 'positive' : 'negative'}">
                    ${holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(2)}%
                </div>
            </div>
        `).join('');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    selectCryptoForTrading(cryptoId) {
        this.selectedCrypto = cryptoId;
        const cryptoSelector = document.getElementById('crypto-selector');
        if (cryptoSelector) {
            cryptoSelector.value = cryptoId;
        }
        this.loadSelectedCryptoData();
        this.showToast(`Selected ${cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)} for trading`, 'info');
    }

    filterCryptoTable(query) {
        const filteredData = this.marketData.filter(crypto => 
            crypto.name.toLowerCase().includes(query.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(query.toLowerCase())
        );
        this.renderCryptoTable(filteredData);
    }

    handleNavigation(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${section}"]`).classList.add('active');

        // Show/hide sections
        document.querySelectorAll('section').forEach(sec => {
            sec.style.display = 'none';
        });

        if (section === 'portfolio') {
            document.querySelector('.portfolio-section').style.display = 'block';
            this.updatePortfolioDisplay();
        } else {
            document.querySelector('.market-overview').style.display = 'block';
            document.querySelector('.trading-section').style.display = 'block';
            document.querySelector('.market-data').style.display = 'block';
        }
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        this.isLoading = true;
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.isLoading = false;
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    }

    generateColor(text, variant = false) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = Math.abs(hash).toString(16).substring(0, 6);
        return variant ? this.adjustBrightness(color, 20) : color.padEnd(6, '0');
    }

    adjustBrightness(hex, amount) {
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    formatCurrency(value) {
        if (value >= 1e12) {
            return (value / 1e12).toFixed(2) + 'T';
        } else if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(2) + 'K';
        }
        return value.toFixed(2);
    }

    loadPortfolio() {
        try {
            const saved = localStorage.getItem('cryptoPortfolio');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    savePortfolio() {
        try {
            localStorage.setItem('cryptoPortfolio', JSON.stringify(this.portfolioData));
        } catch (error) {
            console.error('Failed to save portfolio:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CryptoTradingApp();
});

// Auto-refresh market data every 30 seconds
setInterval(() => {
    if (window.app && !window.app.isLoading) {
        window.app.loadMarketOverview();
        window.app.loadCryptoList();
    }
}, 30000);
