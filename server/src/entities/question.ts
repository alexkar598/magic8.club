import { Entity, Enum, ManyToOne } from "@mikro-orm/better-sqlite";
import { PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { QuestionState } from "../public_types/question.ts";
import { DbUser } from "./user.ts";

@Entity()
export class DbQuestion {
  // Unique
  @PrimaryKey({ type: "uuid" })
  id = v4();

  // Props
  @Property()
  text: string;

  @Enum()
  state = QuestionState.Unclaimed;

  // Owning relations
  @ManyToOne()
  author: DbUser;

  //Code

  constructor(text: string, author: DbUser) {
    this.text = text;
    this.author = author;
  }
}
