export const trackEvent = (eventName, parameters = {}) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
    console.log(`[Tracking] GA4 Event: ${eventName}`, parameters);
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
    console.log(`[Tracking] Meta Pixel Event: ${eventName}`, parameters);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, parameters);
    console.log(`[Tracking] TikTok Pixel Event: ${eventName}`, parameters);
  }
};

export const trackPageView = (url) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
    console.log(`[Tracking] GA4 PageView: ${url}`);
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
    console.log(`[Tracking] Meta Pixel PageView`);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track('Browse');
    console.log(`[Tracking] TikTok Pixel PageView`);
  }
};