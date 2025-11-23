import { describe, it, expect } from 'vitest';
import {
  pathToServiceTop,
  pathToTournamentCreation,
  pathToTournamentCreationComplete,
  pathToTournamentEdit,
  pathToTournamentPortal,
  pathToTournamentRegisterParticipant,
  pathToOrganizerDashboard,
  pathToQuizBoard,
  pathToQuizCreator,
  pathToParticipantDashboard,
  pathToQuizDisplay,
  pathToAnswerDisplay,
  pathToErrorPage,
} from './route-helpers';

describe('パス生成ヘルパー', () => {
  it('サービスTOPページへの正しいパスを返すこと', () => {
    expect(pathToServiceTop()).toBe('/gather');
  });

  it('大会作成ページへの正しいパスを返すこと', () => {
    expect(pathToTournamentCreation()).toBe('/gather/tournaments/new');
  });

  it('大会作成完了ページへの正しいパスを返すこと', () => {
    const id = 'test-id';
    expect(pathToTournamentCreationComplete(id)).toBe(`/gather/tournaments/${id}/created`);
  });

  it('大会編集ページへの正しいパスを返すこと', () => {
    const tournamentId = 'test-tournament-id';
    expect(pathToTournamentEdit(tournamentId)).toBe(`/gather/tournaments/${tournamentId}/edit`);
  });

  it('大会ポータルページへの正しいパスを返すこと', () => {
    const id = 'test-id';
    expect(pathToTournamentPortal(id)).toBe(`/gather/tournaments/${id}`);
  });

  it('参加者登録ページへの正しいパスを返すこと', () => {
    const id = 'test-id';
    expect(pathToTournamentRegisterParticipant(id)).toBe(`/gather/tournaments/${id}/register`);
  });

  it('主催者ダッシュボードへの正しいパスを返すこと', () => {
    const tournamentId = 'test-tournament-id';
    expect(pathToOrganizerDashboard(tournamentId)).toBe(`/gather/tournaments/${tournamentId}/admin`);
  });

  it('問題選択ボードページへの正しいパスを返すこと', () => {
    const tournamentId = 'test-tournament-id';
    expect(pathToQuizBoard(tournamentId)).toBe(`/gather/tournaments/${tournamentId}/board`);
  });

  it('問題作成ページへの正しいパスを返すこと', () => {
    const tournamentId = 'test-tournament-id';
    const participantId = 'test-participant-id';
    expect(pathToQuizCreator(tournamentId, participantId)).toBe(
      `/gather/tournaments/${tournamentId}/participants/${participantId}/quizzes/new`
    );
  });

  it('参加者ダッシュボードへの正しいパスを返すこと', () => {
    const tournamentId = 'test-tournament-id';
    const participantId = 'test-participant-id';
    expect(pathToParticipantDashboard(tournamentId, participantId)).toBe(
      `/gather/tournaments/${tournamentId}/participants/${participantId}`
    );
  });

  it('問題表示ページへの正しいパスを返すこと', () => {
    const quizId = 'test-quiz-id';
    expect(pathToQuizDisplay(quizId)).toBe(`/gather/quizzes/${quizId}`);
  });

  it('解答表示ページへの正しいパスを返すこと', () => {
    const quizId = 'test-quiz-id';
    expect(pathToAnswerDisplay(quizId)).toBe(`/gather/quizzes/${quizId}/answer`);
  });

  it('エラーページへの正しいパスを返すこと', () => {
    expect(pathToErrorPage()).toBe('*');
  });
});
