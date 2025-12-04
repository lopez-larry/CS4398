console.log('[TRACK] Tracking middleware triggered.');

function trackCookies(req, res, next) {
  console.log(`[TRACK] Triggered on ${req.method} ${req.path}`);

  const isProd = process.env.NODE_ENV === 'production';

  // Count page views
  const views = parseInt(req.cookies.pageViews || '0', 10) + 1;
  res.cookie('pageViews', views, {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: false,             // still accessible client-side (for demo/analytics)
    sameSite: isProd ? 'None' : 'Lax',
    secure: isProd               // must be true in prod (HTTPS only)
  });

  // Capture UTM source if present in query
  if (req.query.utm_source && !req.cookies.utm_source) {
    res.cookie('utm_source', req.query.utm_source, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: false,
      sameSite: isProd ? 'None' : 'Lax',
      secure: isProd
    });
  }

  next();
}

module.exports = trackCookies;
