import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { DbQuestion } from "./question.ts";

@Entity()
export class DbUser {
  // Unique
  @PrimaryKey({ type: "uuid" })
  id = v4();

  // Props
  @Property({ type: "uuid" })
  @Unique()
  token = v4();

  // Inverse relations
  @OneToMany(() => DbQuestion, (question) => question.author, {
    orphanRemoval: true,
  })
  questions = new Collection<DbQuestion>(this);

  // Testing
  @Property()
  counter = 0;

  //Code
  constructor() {}
}
