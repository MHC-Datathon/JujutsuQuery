import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { event, properties } = body;

    // Analytics event tracking
    const analyticsData = {
      timestamp: new Date().toISOString(),
      event,
      properties: {
        ...properties,
        user_agent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        session_id: properties.session_id || 'anonymous'
      }
    };

    // Send to multiple analytics services
    const promises = [];

    // Google Analytics 4
    if (process.env.PUBLIC_GOOGLE_ANALYTICS_ID) {
      promises.push(sendToGA4(analyticsData));
    }

    // Microsoft Clarity
    if (process.env.PUBLIC_MICROSOFT_CLARITY_ID) {
      promises.push(sendToClarity(analyticsData));
    }

    // Custom analytics storage
    promises.push(storeAnalytics(analyticsData));

    await Promise.allSettled(promises);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(
      JSON.stringify({ error: 'Analytics tracking failed' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

async function sendToGA4(data: any) {
  const GA_MEASUREMENT_ID = process.env.PUBLIC_GOOGLE_ANALYTICS_ID;
  const GA_API_SECRET = process.env.GA4_API_SECRET;

  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) return;

  const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: data.properties.session_id,
      events: [{
        name: data.event,
        params: {
          engagement_time_msec: '100',
          ...data.properties
        }
      }]
    })
  });

  return response.ok;
}

async function sendToClarity(data: any) {
  // Microsoft Clarity custom events
  // Note: Clarity primarily works client-side, this is for completeness
  try {
    const response = await fetch('https://www.clarity.ms/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: data.event,
        properties: data.properties,
        timestamp: data.timestamp
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Clarity tracking error:', error);
    return false;
  }
}

async function storeAnalytics(data: any) {
  // Store in your own analytics database
  // This could be Supabase, PlanetScale, or any other database

  try {
    // Example with fetch to your own analytics endpoint
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      const response = await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`
        },
        body: JSON.stringify(data)
      });
      return response.ok;
    }

    // Alternative: Log to file or console for development
    console.log('Analytics Event:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Custom analytics storage error:', error);
    return false;
  }
}

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      message: 'Analytics endpoint active',
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};