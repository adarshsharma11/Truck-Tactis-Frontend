export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/mock',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB-pA5Nt6YDa1-7hZwcd278jnHRqGntAzs',
  webhookNext3Url: import.meta.env.VITE_WEBHOOK_NEXT3_URL || 'https://example.com/whatsapp-stub',
  featureFlags: JSON.parse(
    import.meta.env.VITE_FEATURE_FLAGS || '{"overtimeModal":true,"whatsappStub":true,"heatmap":true}'
  ) as {
    overtimeModal: boolean;
    whatsappStub: boolean;
    heatmap: boolean;
  },
};
