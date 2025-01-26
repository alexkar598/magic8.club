"use client";

import axios from "axios";
import { io } from "socket.io-client";

export const sid = Math.random().toString(36);

const SERVER_URL = "http://localhost:5000";
const SESSION_ID_HEADER_NAME = "Magic8SessionId";

export const socket = io(SERVER_URL, {
  withCredentials: true,
  extraHeaders: {
    [SESSION_ID_HEADER_NAME]: sid,
  },
});

const { promise: isReady, resolve: setIsReady } = Promise.withResolvers<void>();

socket.on("connection:ready", () => {
  setIsReady();
});

export const restApi = axios.create({
  baseURL: SERVER_URL,
  headers: {
    [SESSION_ID_HEADER_NAME]: sid,
  },
  withCredentials: true,
});

restApi.interceptors.request.use(async (config) => {
  await isReady;
  return config;
});
