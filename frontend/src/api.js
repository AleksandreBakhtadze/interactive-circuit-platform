/** Dev: Vite proxies /api → http://localhost:8080. Prod: set VITE_API_BASE or same-origin /api. */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
