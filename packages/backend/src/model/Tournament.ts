import { Participant } from './Participant';
import { Quiz } from './Quiz';

/**
 * 大会モデル
 */
export class Tournament {
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
   * @param {object} data - 大会データ
   * @param {string} data.id - 大会ID
   * @param {string} data.name - 大会名
   * @param {string} data.password - 管理用パスワード
   * @param {number} data.questionsPerParticipant - 参加者1人あたりの問題作成数
   * @param {string} data.points - 各問題の配点
   * @param {string | null} data.regulation - レギュレーション
   * @param {string} data.status - 大会の状態
   * @param {Date} data.createdAt - 作成日時
   * @param {Date} data.updatedAt - 更新日時
   * @param {Participant[]} [data.participants] - 参加者リスト
   * @param {Quiz[]} [data.quizzes] - クイズリスト
   */
  constructor(data: {
    id: string;
    name: string;
    password: string;
    questionsPerParticipant: number;
    points: string;
    regulation: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    participants?: Participant[];
    quizzes?: Quiz[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.password = data.password;
    this.questionsPerParticipant = data.questionsPerParticipant;
    this.points = data.points;
    this.regulation = data.regulation;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.participants = data.participants;
    this.quizzes = data.quizzes;
  }

  /**
   * JSONシリアライズ用
   * @returns {object} プレーンなオブジェクト
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      password: this.password,
      questionsPerParticipant: this.questionsPerParticipant,
      points: this.points,
      regulation: this.regulation,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      participants: this.participants?.map((p) => p.toJSON()),
      quizzes: this.quizzes?.map((q) => q.toJSON()),
    };
  }
}
