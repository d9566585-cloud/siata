import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route: Proxy directo al dataset oficial del SIATA (EntregaData1)
  app.get("/api/siata/pm25_last", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    const url = "https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json";
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SIATA-Student-Evaluation/1.0",
          "Accept": "application/json"
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      res.json({
        success: true,
        latencyMs: Date.now() - startTime,
        source: url,
        ...data
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
        latencyMs: Date.now() - startTime,
        source: url
      });
    }
  });

  // API Route: Proxy / Live probe para la API del SIATA
  app.get("/api/siata/probe", async (req, res) => {
    const targetUrl = (req.query.url as string) || "http://siata.gov.co:8089/estaciones/calidadAire";
    const apiKey = (req.headers["authorization"] as string) || (req.query.apiKey as string) || "";
    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        "User-Agent": "SIATA-Monitor-App/1.0 (Valle de Aburrá; Universidad Evaluacion)",
        "Accept": "application/json"
      };
      if (apiKey) {
        headers["Authorization"] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
      }

      // Intentar conexión a la URL provista con timeout de 6 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const contentType = response.headers.get("content-type") || "";

      let data;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { textResponse: text.slice(0, 1000) };
        }
      }

      res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        latencyMs,
        endpoint: targetUrl,
        headers: {
          "content-type": contentType,
          "server": response.headers.get("server") || "SIATA-Gateway"
        },
        data
      });
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      res.status(200).json({
        success: false,
        status: 504,
        statusText: "Gateway Timeout / Remote Host Unreachable",
        latencyMs,
        endpoint: targetUrl,
        error: error.message || "No fue posible conectar con el servidor remoto del SIATA",
        fallbackAvailable: true
      });
    }
  });

  // API Route: Proxy para WAQI (World Air Quality Index) Feed
  app.get("/api/waqi/feed", async (req, res) => {
    const city = (req.query.city as string) || "caldas";
    const token = (req.query.token as string) || process.env.WAQI_TOKEN || "demo";
    const startTime = Date.now();
    const endpoint = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "WAQI-Colab-Replica/1.0"
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const json = await response.json();

      res.json({
        success: json.status === "ok",
        latencyMs,
        endpoint,
        data: json
      });
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      res.json({
        success: false,
        latencyMs,
        endpoint,
        error: error.message || "No se pudo conectar con el servidor de WAQI",
        fallback: true
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
