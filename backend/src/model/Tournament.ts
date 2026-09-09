import { readTeams, type Team } from '../team-scoring';
import { Participant } from './Participant';
import { Quiz } from './Quiz';
import { readQuestionSlots, type QuestionSlot } from '../question-slots';

/**
 * 大会モデル
 */
export class Tournament {
  /** 問題順ごとのラベルと出題形式。 */
  questionSlots: QuestionSlot[];
  /** 作問者とは独立した参加チーム。 */
  teams: Team[];
  /**
   * 大会ID
   * @type {string}
   */
  id: string;

  /**
   * 大会名
   * @type {string}
   */
  name: string;

  /**
   * 管理用パスワード
   * @type {string}
   */
  password: string;

  /**
   * 参加者1人あたりの問題作成数
   * @type {number}
   */
  questionsPerParticipant: number;

  /**
   * 各問題の配点 (カンマ区切り)
   * @type {string}
   */
  points: string;

  /**
   * レギュレーション
   * @type {string | null}
   */
  regulation: string | null;

  /**
   * ジャンル (カンマ区切り)
   * @type {string | null}
   */
  genres: string | null;

  /**
   * 大会の状態
   * @type {string}
   */
  status: string;

  /**
   * 作成日時
   * @type {Date}
   */
  createdAt: Date;

  /**
   * 更新日時
   * @type {Date}
   */
  updatedAt: Date;

  /**
   * 参加者リスト
   * @type {Participant[]}
   */
  participants?: Participant[];

  /**
   * クイズリスト
   * @type {Quiz[]}
   */
  quizzes?: Quiz[];

  /**
   * @constructor
   * @param {Tournament} data - PrismaのTournamentモデルのデータ
   */
  constructor(data: {
    questionSlots?: string | null;
    teams?: string;
    id: string;
    name: string;
    password: string;
    questionsPerParticipant: number;
    points: string;
    regulation: string | null;
    genres: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    participants?: Participant[];
    quizzes?: Quiz[];
  }) {
    this.id = data.id;
    this.teams = readTeams(data.teams);
    this.questionSlots = readQuestionSlots(data.questionSlots);
    this.name = data.name;
    this.password = data.password;
    this.questionsPerParticipant = data.questionsPerParticipant;
    this.points = data.points;
    this.regulation = data.regulation;
    this.genres = data.genres;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.participants = data.participants;
    this.quizzes = data.quizzes;
  }

  /**
   * 関連モデル（Participant, Quiz）も含めて、JSONシリアライズ可能なオブジェクトに変換します。
   * @returns {object} プレーンなオブジェクト
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      password: this.password,
      questionsPerParticipant: this.questionsPerParticipant,
      points: this.points,
      questionSlots: this.questionSlots,
      teams: this.teams,
      regulation: this.regulation,
      genres: this.genres,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      participants: this.participants?.map((p) => p.toJSON()),
      quizzes: this.quizzes?.map((q) => q.toJSON()),
    };
  }
}
