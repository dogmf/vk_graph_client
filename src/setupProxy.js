const { createProxyMiddleware } = require("http-proxy-middleware");
const { SERVICE_KEY } = require("./proxyConfig.json");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://api.vk.com",
      pathRewrite: function (path, req) {
        let newPath = path.replace("/api", "");
        if (/\?/.test(newPath))
          newPath = newPath.replace(/\?/, `?access_token=${SERVICE_KEY}&`);
        else newPath += `?access_token=${SERVICE_KEY}`;
        return newPath;
      },
      changeOrigin: true,
    })
  );
};
