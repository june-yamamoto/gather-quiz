import { Quiz } from './Quiz';

/**
 * 参加者情報を表現するクラス
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
   * 参加者が設定したログインID
   * @type {string | undefined}
   */
  loginId?: string;

  /**
   * 紐づく大会のID
   * @type {string}
   */
  tournamentId: string;

  /**
   * 作成済みの問題数
   * @type {number}
   */
  created: number;

  /**
   * 作成が要求されている問題数
   * @type {number}
   */
  required: number;

  /**
   * 作成したクイズのリスト
   * @type {Quiz[]}
   */
  quizzes: Quiz[];

  constructor(data: {
    id: string;
    name: string;
    loginId?: string;
    tournamentId: string;
    created: number;
    required: number;
    quizzes: Quiz[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.loginId = data.loginId;
    this.tournamentId = data.tournamentId;
    this.created = data.created;
    this.required = data.required;
    this.quizzes = data.quizzes;
  }

  /**
   * APIから取得したデータを元にParticipantインスタンスを生成します。
   * @param {unknown} data - APIから取得したデータ
   * @returns {Participant} Participantインスタンス
   * @throws {Error} APIのデータ形式が不正な場合にエラーをスローします。
   */
  public static fromApi(data: unknown): Participant {
    if (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      'name' in data &&
      typeof data.name === 'string' &&
      'tournamentId' in data &&
      typeof data.tournamentId === 'string' &&
      ('loginId' in data && data.loginId != null ? typeof data.loginId === 'string' : true) &&
      ('created' in data ? typeof data.created === 'number' : true) && // created is optional
      ('required' in data ? typeof data.required === 'number' : true) && // required is optional
      ('quizzes' in data ? Array.isArray(data.quizzes) : true) // quizzes is optional
    ) {
      const participantData = {
        id: data.id,
        name: data.name,
        loginId: 'loginId' in data && typeof data.loginId === 'string' ? data.loginId : undefined,
        tournamentId: data.tournamentId,
        created: 'created' in data ? (data.created as number) : 0,
        required: 'required' in data ? (data.required as number) : 0,
        quizzes: 'quizzes' in data ? (data.quizzes as unknown[]).map(Quiz.fromApi) : [],
      };
      return new Participant(participantData);
    }
    throw new Error('Invalid participant data format from API');
  }
}
