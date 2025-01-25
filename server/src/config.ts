import fs from "fs";

export interface UserConfig {
  port?: number
}

export const config = Object.assign({
  port: 3000
}, JSON.parse(fs.readFileSync("config.json", "utf-8")) as UserConfig)