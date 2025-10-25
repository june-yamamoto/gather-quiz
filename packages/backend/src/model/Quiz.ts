/**
 * クイズモデル
 */
export class Quiz {
  /**
   * クイズID
   * @type {string}
   */
  id: string;

  /**
   * 配点
   * @type {number}
   */
  point: number;

  /**
   * 問題文
   * @type {string | null}
   */
  questionText: string | null;

  /**
   * 問題画像URL
   * @type {string | null}
   */
  questionImage: string | null;

  /**
   * 問題参考リンク
   * @type {string | null}
   */
  questionLink: string | null;

  /**
   * 解答文
   * @type {string | null}
   */
  answerText: string | null;

  /**
   * 解答画像URL
   * @type {string | null}
   */
  answerImage: string | null;

  /**
   * 解答参考リンク
   * @type {string | null}
   */
  answerLink: string | null;

  /**
   * 紐づく大会のID
   * @type {string}
   */
  tournamentId: string;

  /**
   * 紐づく参加者のID
   * @type {string}
   */
  participantId: string;

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
   * @constructor
   * @param {Quiz} data - PrismaのQuizモデルのデータ
   */
  constructor(data: {
    id: string;
    point: number;
    questionText: string | null;
    questionImage: string | null;
    questionLink: string | null;
    answerText: string | null;
    answerImage: string | null;
    answerLink: string | null;
    tournamentId: string;
    participantId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.point = data.point;
    this.questionText = data.questionText;
    this.questionImage = data.questionImage;
    this.questionLink = data.questionLink;
    this.answerText = data.answerText;
    this.answerImage = data.answerImage;
    this.answerLink = data.answerLink;
    this.tournamentId = data.tournamentId;
    this.participantId = data.participantId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * 自身のプロパティをJSONシリアライズ可能なオブジェクトに変換します。
   * @returns {object} プレーンなオブジェクト
   */
  toJSON() {
    return {
      id: this.id,
      point: this.point,
      questionText: this.questionText,
      questionImage: this.questionImage,
      questionLink: this.questionLink,
      answerText: this.answerText,
      answerImage: this.answerImage,
      answerLink: this.answerLink,
      tournamentId: this.tournamentId,
      participantId: this.participantId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
