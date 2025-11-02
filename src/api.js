import axios from 'axios';

const apiUrl = 'http://localhost:1212';

export const api = axios.create({baseURL: apiUrl});
