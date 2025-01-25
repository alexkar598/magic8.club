import KeyvSqlite from "@keyv/sqlite";
import Keyv from "keyv";

const keyvSqlite = new KeyvSqlite("sqlite://data/keyv.sqlite");

export default {
  // Meta key -> Meta data
  meta: new Keyv({ store: keyvSqlite, namespace: "_meta" }),
  // User token -> User Id
  tokens: new Keyv({ store: keyvSqlite, namespace: "tokens" }),
  // Question Id -> Question Data
  questions: new Keyv({ store: keyvSqlite, namespace: "questions" }),

  // Testing namespace
  test: new Keyv({ store: keyvSqlite, namespace: "test" }),
};
