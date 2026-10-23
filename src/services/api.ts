import axios from 'axios';

export const API_BASE_URL = 'https://digi-api.com/api/v1';

/** Instância única do Axios usada por todos os serviços de dados. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});
