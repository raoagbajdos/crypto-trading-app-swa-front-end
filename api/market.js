const { app } = require('@azure/functions');

app.http('market', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Market data request processed for url "${request.url}"`);

        // This is a simple mock API endpoint
        // In a production app, you might cache CoinGecko data here
        // or implement additional data processing
        
        try {
            // Mock market statistics
            const marketStats = {
                totalMarketCap: 1250000000000, // $1.25T
                totalVolume: 89000000000, // $89B
                btcDominance: 42.5,
                activeCryptocurrencies: 2847,
                markets: 8923,
                marketCapChange24h: 2.34,
                trending: [
                    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
                    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
                    { id: 'solana', name: 'Solana', symbol: 'SOL' }
                ],
                timestamp: new Date().toISOString()
            };

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=60' // Cache for 1 minute
                },
                jsonBody: {
                    success: true,
                    data: marketStats,
                    source: 'Azure Static Web Apps API'
                }
            };
        } catch (error) {
            context.log.error('Error processing market data:', error);
            
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: 'Failed to retrieve market data',
                    message: error.message
                }
            };
        }
    }
});
