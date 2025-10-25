import { Quiz } from './Quiz';

/**
 * 参加者モデル
 */
export class Participant {
  /**
   * 参加者ID
   * @type {string}
   */
  id: string;

  /**
   * 参加者名
   * @type {string}
   */
  name: string;

  /**
   * 参加者ごとのパスワード
   * @type {string}
   */
  password: string;

  /**
   * 紐づく大会のID
   * @type {string}
   */
  tournamentId: string;

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
   * 作成したクイズのリスト
   * @type {Quiz[]}
   */
  quizzes?: Quiz[];

  /**
   * @constructor
   * @param {object} data - 参加者データ
   * @param {string} data.id - 参加者ID
   * @param {string} data.name - 参加者名
   * @param {string} data.password - パスワード
   * @param {string} data.tournamentId - 紐づく大会のID
   * @param {Date} data.createdAt - 作成日時
   * @param {Date} data.updatedAt - 更新日時
   * @param {Quiz[]} [data.quizzes] - 作成したクイズのリスト
   */
  constructor(data: {
    id: string;
    name: string;
    password: string;
    tournamentId: string;
    createdAt: Date;
    updatedAt: Date;
    quizzes?: Quiz[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.password = data.password;
    this.tournamentId = data.tournamentId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
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
      tournamentId: this.tournamentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      quizzes: this.quizzes?.map((q) => q.toJSON()),
    };
  }
}
