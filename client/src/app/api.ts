"use client";

import axios from "axios";
import { io } from "socket.io-client";

export const sid = Math.random().toString(36);

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5000/";
const SESSION_ID_HEADER_NAME = "Magic8SessionId";
const same_origin = Boolean(process.env.NEXT_PUBLIC_SAME_ORIGIN);

// Urg, forces the account to be created
await fetch(SERVER_URL + "api/");

export const socket = io(SERVER_URL, {
  withCredentials: !same_origin,
  extraHeaders: {
    [SESSION_ID_HEADER_NAME]: sid,
  },
  path: "/api/socket.io/",
});

let setIsReady: (value: void) => void;
const isReady = new Promise((resolve) => {
  setIsReady = resolve;
});

socket.on("connection:ready", () => {
  setIsReady();
});

export const restApi = axios.create({
  baseURL: SERVER_URL + "api/",
  headers: {
    [SESSION_ID_HEADER_NAME]: sid,
  },
  withCredentials: !same_origin,
});

restApi.interceptors.request.use(async (config) => {
  await isReady;
  return config;
});
