import { MikroORM } from "@mikro-orm/better-sqlite";

const db = await MikroORM.init();

await db.schema.updateSchema();

export default db;
export const em = db.em;
