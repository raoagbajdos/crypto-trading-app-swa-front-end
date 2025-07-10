const { app } = require('@azure/functions');

app.http('portfolio', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const method = request.method;
        
        if (method === 'GET') {
            // Return user portfolio data
            // In a real app, this would come from a database
            return {
                status: 200,
                jsonBody: {
                    message: "Portfolio data retrieved successfully",
                    portfolio: {
                        totalValue: 8523.45,
                        holdings: [
                            {
                                symbol: "BTC",
                                name: "Bitcoin",
                                amount: 0.25,
                                value: 5000.00,
                                change24h: 2.34
                            },
                            {
                                symbol: "ETH",
                                name: "Ethereum",
                                amount: 1.5,
                                value: 3000.00,
                                change24h: -1.23
                            },
                            {
                                symbol: "ADA",
                                name: "Cardano",
                                amount: 1000,
                                value: 523.45,
                                change24h: 4.56
                            }
                        ],
                        lastUpdated: new Date().toISOString()
                    }
                }
            };
        } else if (method === 'POST') {
            // Save portfolio data
            const portfolioData = await request.json();
            
            // In a real app, you would save this to a database
            context.log('Portfolio data received:', portfolioData);
            
            return {
                status: 200,
                jsonBody: {
                    message: "Portfolio updated successfully",
                    timestamp: new Date().toISOString()
                }
            };
        }

        return {
            status: 405,
            jsonBody: {
                error: "Method not allowed"
            }
        };
    }
});
