import yahooFinance from 'yahoo-finance2';

export async function GET(request, { params }) {
  const { symbol } = params;

  try {
    // Fetch quote data for the symbol
    const queryOptions = { modules: ['price', 'summaryDetail'] };
    const data = await yahooFinance.quote(symbol, queryOptions);

    if (!data) {
      return new Response(JSON.stringify({ error: 'No data found' }), { status: 404 });
    }

    // Return the fetched data as JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
