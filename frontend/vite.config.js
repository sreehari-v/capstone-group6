import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const useHttps = env.VITE_DEV_HTTPS === "1";

  const server = {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
  };

  if (useHttps) {
    const keyFile = resolve(__dirname, "certs/dev-key.pem");
    const certFile = resolve(__dirname, "certs/dev-cert.pem");
    server.https = {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
    };
  }

  console.log(`>> Vite dev using ${useHttps ? "HTTPS" : "HTTP"}`);
  return {
    plugins: [react()],
    server,
  };
});
