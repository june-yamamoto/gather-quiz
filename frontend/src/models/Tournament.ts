import { Participant } from './Participant';

/**
 * 大会情報を表現するクラス
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
   * 参加者1人あたりの問題作成数
   * @type {number}
   */
  questionsPerParticipant: number;

  /**
   * 各問題の配点（カンマ区切り）
   * @type {string}
   */
  points: string;

  /**
   * レギュレーション
   * @type {(string | null)}
   */
  regulation?: string | null;

  /**
   * ジャンル (カンマ区切り)
   * @type {(string | null)}
   */
  genres?: string | null;

  /**
   * 大会の状態
   * @type {string}
   */
  status: string;

  /**
   * 大会に参加している参加者のリスト
   * @type {Participant[]}
   */
  participants: Participant[];

  /**
   * 作成日時
   * @type {Date}
   */
  createdAt: Date;

  constructor(data: {
    id: string;
    name: string;
    questionsPerParticipant: number;
    points: string;
    regulation?: string | null;
    genres?: string | null;
    status: string;
    createdAt: Date;
    participants?: Participant[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.questionsPerParticipant = data.questionsPerParticipant;
    this.points = data.points;
    this.regulation = data.regulation;
    this.genres = data.genres;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.participants = data.participants || [];
  }

  /**
   * APIから取得したデータを元にTournamentインスタンスを生成します。
   * @param {unknown} data - APIから取得したデータ
   * @returns {Tournament} Tournamentインスタンス
   * @throws {Error} APIのデータ形式が不正な場合にエラーをスローします。
   */
  public static fromApi(data: unknown): Tournament {
    if (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      'name' in data &&
      typeof data.name === 'string' &&
      'questionsPerParticipant' in data &&
      typeof data.questionsPerParticipant === 'number' &&
      'points' in data &&
      typeof data.points === 'string' &&
      ('regulation' in data ? typeof data.regulation === 'string' || data.regulation === null : true) && // regulation is optional
      ('genres' in data ? typeof data.genres === 'string' || data.genres === null : true) && // genres is optional
      'status' in data &&
      typeof data.status === 'string' &&
      ('participants' in data ? Array.isArray(data.participants) : true) // participants is optional
    ) {
      const tournamentData = {
        id: data.id,
        name: data.name,
        questionsPerParticipant: data.questionsPerParticipant as number,
        points: data.points as string,
        regulation: 'regulation' in data ? (data.regulation as string | null) : null,
        genres: 'genres' in data ? (data.genres as string | null) : null,
        status: data.status as string,
        createdAt: new Date(data.createdAt as string),
        participants: 'participants' in data ? (data.participants as unknown[]).map(Participant.fromApi) : [],
      };
      return new Tournament(tournamentData);
    }
    throw new Error('Invalid tournament data format from API');
  }
}
