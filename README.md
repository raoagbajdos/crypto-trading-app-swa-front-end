# CryptoTrader Pro - Azure Static Web App

A modern, responsive cryptocurrency trading application built for Azure Static Web Apps. This app provides real-time cryptocurrency market data, interactive charts, and a simulated trading interface.

## 🚀 Features

- **Real-time Market Data**: Live cryptocurrency prices and market statistics
- **Interactive Trading Interface**: Buy/sell simulation with portfolio tracking
- **Price Charts**: Dynamic charts with multiple timeframes (1H, 4H, 1D, 1W)
- **Portfolio Management**: Track your simulated cryptocurrency holdings
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Beautiful dark theme with gradient backgrounds and animations

## 🛠 Technologies Used

- **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript
- **Charts**: Chart.js for interactive price visualization
- **Icons**: Font Awesome for professional iconography
- **Fonts**: Google Fonts (Inter) for modern typography
- **API**: CoinGecko API for real-time cryptocurrency data
- **Deployment**: Azure Static Web Apps

## 📋 Prerequisites

- Node.js and npm installed
- Azure Static Web Apps CLI
- Git (for deployment)

## 🏃‍♂️ Quick Start

### Local Development

1. **Clone and navigate to the project**:
   ```bash
   cd azure-static-web-app-crypto-trading-app
   ```

2. **Install Azure Static Web Apps CLI** (if not already installed):
   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

3. **Start the local development server**:
   ```bash
   npx swa start
   ```

4. **Open your browser** and navigate to the URL provided by the CLI (typically `http://localhost:4280`)

### Build and Deploy

1. **Build the application**:
   ```bash
   npx swa build
   ```

2. **Deploy to Azure**:
   ```bash
   npx swa deploy --env production
   ```

## 🎯 App Functionality

### Market Overview
- Total market capitalization
- Number of active cryptocurrencies
- Bitcoin dominance percentage
- Real-time updates every 30 seconds

### Trading Interface
- **Buy Orders**: Enter USD amount to purchase cryptocurrency
- **Sell Orders**: Enter cryptocurrency amount to sell
- **Market/Limit Orders**: Different order types (UI simulation)
- **Real-time Price Updates**: Current market prices for all cryptocurrencies

### Portfolio Management
- Track simulated holdings
- View profit/loss for each position
- Portfolio value calculation
- Persistent storage using localStorage

### Market Data Table
- Top 50 cryptocurrencies by market cap
- Real-time prices and 24h changes
- Search functionality
- Quick trade actions

## 🔧 Configuration

### API Configuration
The app uses the free tier of the CoinGecko API, which doesn't require an API key. The endpoints used are:

- `/global` - Global market statistics
- `/coins/markets` - Cryptocurrency market data
- `/coins/{id}` - Individual cryptocurrency data
- `/coins/{id}/market_chart` - Historical price data

### Environment Variables
No environment variables are required for the basic functionality.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full trading interface with side-by-side panels
- **Tablet**: Stacked layout with maintained functionality
- **Mobile**: Optimized navigation and condensed information display

## 🎨 UI Components

### Color Scheme
- **Primary**: Blue gradient (`#3b82f6` to `#2563eb`)
- **Success**: Green (`#10b981`)
- **Danger**: Red (`#ef4444`)
- **Background**: Dark theme with gradient overlays

### Interactive Elements
- Hover effects on cards and buttons
- Smooth transitions and animations
- Loading states and progress indicators
- Toast notifications for user feedback

## 🔄 Data Flow

1. **App Initialization**: Load market overview, crypto list, and chart data
2. **Real-time Updates**: Refresh market data every 30 seconds
3. **User Interactions**: Handle trading actions, navigation, and filtering
4. **Portfolio Updates**: Save transactions to localStorage
5. **UI Updates**: Reflect changes in real-time across all components

## 🛡 Security & Best Practices

- No sensitive data stored or transmitted
- Client-side only implementation
- Rate limiting awareness for API calls
- Error handling and graceful degradation
- Input validation for trading forms

## 📊 Performance Features

- **Lazy Loading**: Charts loaded only when needed
- **Debounced Search**: Optimized filtering performance
- **Efficient DOM Updates**: Minimal re-renders
- **Caching**: localStorage for portfolio persistence

## 🚀 Deployment to Azure

This application is configured for Azure Static Web Apps with:
- Automatic builds from Git repository
- Global CDN distribution
- Custom domain support
- SSL certificates
- Pull request previews

### Deployment Configuration
The `swa-cli.config.json` file contains the deployment configuration:
- **App location**: Root directory
- **Build output**: Same directory (static files)
- **No API backend required**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **CoinGecko**: Free cryptocurrency API
- **Chart.js**: Beautiful chart library
- **Font Awesome**: Professional icons
- **Azure Static Web Apps**: Hosting platform

## 📞 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include browser and device information
4. Provide steps to reproduce any bugs

---

Built with ❤️ for Azure Static Web Apps
