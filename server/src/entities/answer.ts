import { Entity, ManyToOne } from "@mikro-orm/better-sqlite";
import { PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { DbQuestion } from "./question.js";
import { DbUser } from "./user.ts";

@Entity()
export class DbAnswer {
  // Unique
  @PrimaryKey({ type: "uuid" })
  id = v4();

  // Props
  @Property()
  text: string;
  @Property()
  answeredAt: Date = new Date();

  // Owning relations
  @ManyToOne()
  author: DbUser;
  @ManyToOne()
  question: DbQuestion;

  //Code
  constructor(text: string, author: DbUser, question: DbQuestion) {
    this.text = text;
    this.author = author;
    this.question = question;
  }
}
