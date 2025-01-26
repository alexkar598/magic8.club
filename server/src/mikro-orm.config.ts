// no need to specify the `driver` now, it will be inferred automatically
import { defineConfig } from "@mikro-orm/better-sqlite";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export default defineConfig({
  dbName: "data/db.sqlite",
  // folder-based discovery setup, using common filename suffix
  entities: ["dist/entities/**/*.js"],
  entitiesTs: ["src/entities/**/*.ts"],
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
});
