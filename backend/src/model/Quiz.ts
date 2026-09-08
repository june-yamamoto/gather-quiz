/**
 * クイズモデル
 */
export class Quiz {
  /** 主催者が指定した問題枠のラベル。 */
  label: string;
  /** 0は通常問題、2以上は選択問題。 */
  choiceCount: number;
  /** 表示順の選択肢。 */
  choices: string[];
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
   * 問題順序
   * @type {number}
   */
  order: number;

  /**
   * 既読フラグ
   * @type {boolean}
   */
  isOpened: boolean;

  /**
   * ジャンル
   * @type {string | null}
   */
  genre: string | null;

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
   * 問題の動画・音声または参考リンクURL
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
   * 解答の動画・音声または参考リンクURL
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
   * 紐づく参加者の名前
   * @type {string | undefined}
   */
  participantName?: string;

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
    label?: string | null;
    choiceCount?: number;
    choices?: string;
    id: string;
    point: number;
    order: number;
    isOpened: boolean;
    genre: string | null;
    questionText: string | null;
    questionImage: string | null;
    questionLink: string | null;
    answerText: string | null;
    answerImage: string | null;
    answerLink: string | null;
    tournamentId: string;
    participantId: string;
    participant?: { name: string };
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.label = data.label || '';
    this.choiceCount = data.choiceCount || 0;
    this.choices = JSON.parse(data.choices || '[]');
    this.point = data.point;
    this.order = data.order;
    this.isOpened = data.isOpened;
    this.genre = data.genre;
    this.questionText = data.questionText;
    this.questionImage = data.questionImage;
    this.questionLink = data.questionLink;
    this.answerText = data.answerText;
    this.answerImage = data.answerImage;
    this.answerLink = data.answerLink;
    this.tournamentId = data.tournamentId;
    this.participantId = data.participantId;
    this.participantName = data.participant?.name;
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
      label: this.label,
      choiceCount: this.choiceCount,
      choices: this.choices,
      order: this.order,
      isOpened: this.isOpened,
      genre: this.genre,
      questionText: this.questionText,
      questionImage: this.questionImage,
      questionLink: this.questionLink,
      answerText: this.answerText,
      answerImage: this.answerImage,
      answerLink: this.answerLink,
      tournamentId: this.tournamentId,
      participantId: this.participantId,
      participantName: this.participantName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
