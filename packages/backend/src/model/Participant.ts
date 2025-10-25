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
   * @param {Participant} data - PrismaのParticipantモデルのデータ
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
   * 関連モデル（Quiz）も含めて、JSONシリアライズ可能なオブジェクトに変換します。
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
