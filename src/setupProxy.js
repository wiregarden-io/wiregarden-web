const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://wiregarden.io',
      //target: 'http://10.234.236.2',
      //pathRewrite: {
        //'^/api/': '/',
      //},
      changeOrigin: true,
    })
  );
};
