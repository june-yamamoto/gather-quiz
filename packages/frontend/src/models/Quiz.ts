/**
 * クイズ情報を表現するクラス
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
   * @type {(string | null)}
   */
  questionText?: string | null;

  /**
   * 問題の画像URL
   * @type {(string | null)}
   */
  questionImage?: string | null;

  /**
   * 問題の参考リンク
   * @type {(string | null)}
   */
  questionLink?: string | null;

  /**
   * 解答文
   * @type {(string | null)}
   */
  answerText?: string | null;

  /**
   * 解答の画像URL
   * @type {(string | null)}
   */
  answerImage?: string | null;

  /**
   * 解答の参考リンク
   * @type {(string | null)}
   */
  answerLink?: string | null;

  /**
   * 紐づく大会のID
   * @type {string}
   */
  tournamentId: string;

  /**
   * 作成者のID
   * @type {string}
   */
  participantId: string;

  constructor(data: {
    id: string;
    point: number;
    questionText?: string | null;
    questionImage?: string | null;
    questionLink?: string | null;
    answerText?: string | null;
    answerImage?: string | null;
    answerLink?: string | null;
    tournamentId: string;
    participantId: string;
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
  }

  /**
   * APIから取得したデータを元にQuizインスタンスを生成します。
   * @param {unknown} data - APIから取得したデータ
   * @returns {Quiz} Quizインスタンス
   * @throws {Error} APIのデータ形式が不正な場合にエラーをスローします。
   */
  public static fromApi(data: unknown): Quiz {
    if (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      'point' in data &&
      typeof data.point === 'number' &&
      'tournamentId' in data &&
      typeof data.tournamentId === 'string' &&
      'participantId' in data &&
      typeof data.participantId === 'string'
    ) {
      return new Quiz(data as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    throw new Error('Invalid quiz data format from API');
  }

  /**
   * API送信用に、Quizインスタンスのデータをプレーンなオブジェクトに変換します。
   * @returns {object} API送信用オブジェクト
   */
  public toApi() {
    return {
      point: this.point,
      questionText: this.questionText,
      questionImage: this.questionImage,
      questionLink: this.questionLink,
      answerText: this.answerText,
      answerImage: this.answerImage,
      answerLink: this.answerLink,
      tournamentId: this.tournamentId,
      participantId: this.participantId,
    };
  }
}
