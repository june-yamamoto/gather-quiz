import type { ArgTypes } from '@storybook/react';
import { Quiz } from '../models/Quiz';
import type { QuestionSlot } from '../models/QuestionSlot';
import { quizFixture, tournamentFixture } from './fixtures';

export type QuizControls = {
  correctChoiceIndex: number | null;
  label: string; choiceCount: number; choices: string[];
  point: number; order: number; isOpened: boolean; genre: string; participantName: string;
  questionText: string; questionImage: string; questionLink: string;
  answerText: string; answerImage: string; answerLink: string;
};
export const quizArgs: QuizControls = {
  correctChoiceIndex: null,
  label: '', choiceCount: 0, choices: [],
  point: quizFixture.point, order: quizFixture.order, isOpened: false, genre: quizFixture.genre,
  participantName: quizFixture.participantName, questionText: quizFixture.questionText, answerText: quizFixture.answerText,
  questionImage: '', questionLink: '', answerImage: '', answerLink: '',
};
export const quizArgTypes: ArgTypes<QuizControls> = {
  correctChoiceIndex: { control: { type: 'number', min: 0, max: 19 }, description: '正解の選択肢（0始まり）。nullは未設定。', table: { category: '解答' } },
  label: { control: 'text', table: { category: '問題情報' } },
  choiceCount: { control: { type: 'number', min: 0, max: 20 }, table: { category: '問題情報' } },
  choices: { control: 'object', table: { category: '問題' } },
  point: { control: { type: 'number', min: 1 }, table: { category: '問題情報' } },
  order: { control: { type: 'number', min: 0 }, table: { category: '問題情報' } },
  isOpened: { control: 'boolean', table: { category: '問題情報' } },
  genre: { control: 'text', table: { category: '問題情報' } },
  participantName: { control: 'text', table: { category: '問題情報' } },
  questionText: { control: 'text', table: { category: '問題' } },
  questionImage: { control: 'text', description: '画像URL。空欄で非表示。', table: { category: '問題' } },
  questionLink: { control: 'text', table: { category: '問題' } },
  answerText: { control: 'text', table: { category: '解答' } },
  answerImage: { control: 'text', description: '画像URL。空欄で非表示。', table: { category: '解答' } },
  answerLink: { control: 'text', table: { category: '解答' } },
};

export type TournamentControls = {
  questionSlots: QuestionSlot[];
  tournamentName: string; points: string; regulation: string; genres: string;
  participantCount: number; createdQuestions: number;
};
export const tournamentArgs: TournamentControls = {
  questionSlots: [],
  tournamentName: tournamentFixture.name, points: tournamentFixture.points,
  regulation: tournamentFixture.regulation, genres: tournamentFixture.genres,
  participantCount: 2, createdQuestions: 1,
};
export const tournamentArgTypes: ArgTypes<TournamentControls> = {
  questionSlots: { control: 'object', description: '問題順にラベルを指定。出題形式は問題作成時に参加者が設定。', table: { category: '大会' } },
  tournamentName: { control: 'text', table: { category: '大会' } },
  points: { control: 'text', description: 'カンマ区切りの配点。問題数もこの数に合わせます。', table: { category: '大会' } },
  regulation: { control: 'text', table: { category: '大会' } },
  genres: { control: 'text', table: { category: '大会' } },
  participantCount: { control: { type: 'number', min: 1, max: 10 }, table: { category: '参加者' } },
  createdQuestions: { control: { type: 'number', min: 0, max: 10 }, table: { category: '参加者' } },
};

/** argsはシリアライズ可能な値だけとし、描画時にモデルへ変換する。 */
export const controlledQuiz = (args: Partial<QuizControls>) => new Quiz({
  ...quizFixture, ...args,
  questionImage: args.questionImage || null, questionLink: args.questionLink || null,
  answerImage: args.answerImage || null, answerLink: args.answerLink || null,
});
