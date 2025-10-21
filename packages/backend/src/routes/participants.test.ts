import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import participantsRouter from './participants';
// テストデータ作成のために大会APIも利用する
import tournamentsRouter from './tournaments';
import { PrismaClient, Tournament, Participant, Quiz } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
// テスト対象のAPIエンドポイントをマウントする
app.use('/tournaments', tournamentsRouter);
app.use('/tournaments/:tournamentId/participants', participantsRouter);

describe('参加者API', () => {
  let tournament: Tournament;
  let participant: Participant;
  let quiz1: Quiz;
  let quiz2: Quiz;

  beforeEach(async () => {
    // 各テストの前に、テスト用の大会データを作成する
    tournament = await prisma.tournament.create({
      data: {
        name: 'Participant API Test Tournament',
        password: 'testpassword',
        questionsPerParticipant: 2,
        points: '10,20',
      },
    });

    // テスト用の参加者データを作成する
    participant = await prisma.participant.create({
      data: {
        name: 'Test Participant',
        password: 'participant_pw',
        tournamentId: tournament.id,
      },
    });

    // テスト用のクイズデータを作成する
    quiz1 = await prisma.quiz.create({
      data: {
        point: 10,
        questionText: 'Question 1',
        answerText: 'Answer 1',
        tournamentId: tournament.id,
        participantId: participant.id,
      },
    });

    quiz2 = await prisma.quiz.create({
      data: {
        point: 20,
        questionText: 'Question 2',
        answerText: 'Answer 2',
        tournamentId: tournament.id,
        participantId: participant.id,
      },
    });
  });

  afterEach(async () => {
    await prisma.quiz.deleteMany({ where: { participantId: participant.id } });
    await prisma.participant.deleteMany({ where: { id: participant.id } });
    await prisma.tournament.deleteMany({ where: { id: tournament.id } });
  });

  describe('GET /tournaments/:tournamentId/participants/:participantId/quizzes (参加者のクイズ取得)', () => {
    it('指定した参加者のクイズリストと作成状況が正しく取得されること', async () => {
      const res = await request(app).get(`/tournaments/${tournament.id}/participants/${participant.id}/quizzes`);

      expect(res.statusCode).toBe(200);
      expect(res.body.createdQuizzes).toHaveLength(2);
      expect(res.body.createdQuizzes[0].id).toBe(quiz1.id);
      expect(res.body.createdQuizzes[1].id).toBe(quiz2.id);
      expect(res.body.remainingQuestions).toBe(0);
      expect(res.body.requiredQuestions).toBe(2);
      expect(res.body.createdQuestionsCount).toBe(2);
    });

    it('存在しない参加者IDの場合、404エラーを返すこと', async () => {
      const res = await request(app).get(
        `/tournaments/${tournament.id}/participants/nonexistent_participant_id/quizzes`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Participant not found');
    });

    it('クイズがまだ作成されていない参加者の場合、空のリストと正しい作成状況を返すこと', async () => {
      const newParticipant = await prisma.participant.create({
        data: {
          name: 'New Participant',
          password: 'new_pw',
          tournamentId: tournament.id,
        },
      });

      const res = await request(app).get(`/tournaments/${tournament.id}/participants/${newParticipant.id}/quizzes`);

      expect(res.statusCode).toBe(200);
      expect(res.body.createdQuizzes).toHaveLength(0);
      expect(res.body.remainingQuestions).toBe(2);
      expect(res.body.requiredQuestions).toBe(2);
      expect(res.body.createdQuestionsCount).toBe(0);

      await prisma.participant.delete({ where: { id: newParticipant.id } });
    });
  });
});
