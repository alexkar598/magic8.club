export const room = {
  user: (user_id: string) => `user:${user_id}`,
  user_session: (user_id: string, sid: string) =>
    `${room.user(user_id)}:${sid}`,
  question: (question_id: string) => `question:${question_id}`,
  question_asker: (question_id: string) =>
    `${room.question(question_id)}:asker`,
};
