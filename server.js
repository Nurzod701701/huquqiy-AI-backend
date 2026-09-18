const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 8080;

function checkLexUz(callback) {
  const url = "https://lex.uz/docs/-104720";

  https.get(url, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      callback({
        success: true,
        status: response.statusCode,
        size: data.length
      });
    });

  }).on("error", (error) => {
    callback({
      success: false,
      error: error.message
    });
  });
}

const server = http.createServer((req, res) => {

  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8"
  });

  if (req.url === "/lexuz-test") {

    checkLexUz((result) => {

      if (result.success) {
        res.end(`
          <h1>LexUZ bilan aloqa sinovi</h1>

          <h2>🟢 Server LexUZdan javob oldi</h2>

          <p>HTTP holati: ${result.status}</p>

          <p>
            Olingan ma'lumot hajmi:
            ${result.size} belgi
          </p>
        `);

      } else {

        res.end(`
          <h1>LexUZ bilan aloqa sinovi</h1>

          <h2>🔴 LexUZga ulanish amalga oshmadi</h2>

          <p>${result.error}</p>
        `);
      }
    });

    return;
  }

  res.end(`
    <h1>⚖️ Huquqiy AI server</h1>

    <p>Server ishlayapti ✅</p>

    <p>
      <a href="/lexuz-test">
        🔎 LexUZ ulanishini tekshirish
      </a>
    </p>
  `);
});

server.listen(PORT, () => {
  console.log("Huquqiy AI server ishga tushdi");
  console.log("Port:", PORT);
});
