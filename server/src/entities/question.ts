import { Entity, ManyToOne } from "@mikro-orm/better-sqlite";
import { Collection, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";
import { QuestionState } from "../public_types/rest/question.ts";
import QuestionManager from "../QuestionManager.ts";
import { DbAnswer } from "./answer.js";
import { DbUser } from "./user.ts";

@Entity()
export class DbQuestion {
  // Unique
  @PrimaryKey({ type: "uuid" })
  id = v4();

  // Props
  @Property()
  text: string;
  @Property()
  askedAt: Date = new Date();

  // Owning relations
  @ManyToOne()
  author: DbUser;

  // Inverse relations
  @OneToMany(() => DbAnswer, (answer) => answer.question, {
    orphanRemoval: true,
  })
  answers = new Collection<DbAnswer>(this);

  // Virtual
  @Property({ persist: false })
  get state(): QuestionState {
    return QuestionManager.getQuestionState(this.id);
  }

  //Code
  constructor(text: string, author: DbUser) {
    this.text = text;
    this.author = author;
  }
}
