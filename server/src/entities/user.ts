import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity()
export class DbUser {
  @PrimaryKey({ type: "uuid" })
  id = v4();

  @Property({ type: "uuid" })
  @Unique()
  token = v4();

  @Property()
  counter = 0;
}
