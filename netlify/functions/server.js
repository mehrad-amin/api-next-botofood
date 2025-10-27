const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// ساده‌سازی CORS (تا وابستگی به cors باعث مشکل نشه)
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.end();
  next();
});

server.use(middlewares);
server.use(router);

// Netlify Function export
exports.handler = async (event, context) => {
  const handler = server.handle.bind(server);
  return new Promise((resolve) => {
    const req = {
      method: event.httpMethod,
      url:
        (event.rawUrl || event.path || "").replace(
          "/.netlify/functions/server",
          ""
        ) || "/",
      headers: event.headers || {},
      body: event.body || null,
    };
    const res = {
      statusCode: 200,
      headers: {},
      body: "",
      setHeader(name, value) {
        this.headers[name] = value;
      },
      end(body) {
        this.body = body;
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
    };
    // handle the request using json-server express handler
    handler(req, res);
  });
};
