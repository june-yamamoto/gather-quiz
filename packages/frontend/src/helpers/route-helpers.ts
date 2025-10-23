/**
 * アプリケーションのルートパス
 */
const ROOT_PATH = '/gather';

// パスセグメントを定数として定義
const SEGMENTS = {
  TOURNAMENTS: 'tournaments',
  NEW: 'new',
  CREATED: 'created',
  EDIT: 'edit',
  REGISTER: 'register',
  ADMIN: 'admin',
  BOARD: 'board',
  PARTICIPANTS: 'participants',
  QUIZZES: 'quizzes',
  ANSWER: 'answer',
};

/**
 * サービスTOPページへのパスを返します。
 * @returns {string} サービスTOPページへのパス
 */
export const pathToServiceTop = () => ROOT_PATH;

/**
 * 大会作成ページへのパスを返します。
 * @returns {string} 大会作成ページへのパス
 */
export const pathToTournamentCreation = () => [ROOT_PATH, SEGMENTS.TOURNAMENTS, SEGMENTS.NEW].join('/');

/**
 * 大会作成完了ページへのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} 大会作成完了ページへのパス
 */
export const pathToTournamentCreationComplete = (id: string) =>
  [ROOT_PATH, SEGMENTS.TOURNAMENTS, id, SEGMENTS.CREATED].join('/');

/**
 * 大会編集ページへのパスを返します。
 * @param {string} tournamentId - 大会ID
 * @returns {string} 大会編集ページへのパス
 */
export const pathToTournamentEdit = (tournamentId: string) =>
  [ROOT_PATH, SEGMENTS.TOURNAMENTS, tournamentId, SEGMENTS.EDIT].join('/');

/**
 * 大会ポータルページへのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} 大会ポータルページへのパス
 */
export const pathToTournamentPortal = (id: string) => [ROOT_PATH, SEGMENTS.TOURNAMENTS, id].join('/');

/**
 * 参加者登録ページへのパスを返します。
 * @param {string} id - 大会ID
 * @returns {string} 参加者登録ページへのパス
 */
export const pathToTournamentRegisterParticipant = (id: string) =>
  [ROOT_PATH, SEGMENTS.TOURNAMENTS, id, SEGMENTS.REGISTER].join('/');

/**
 * 主催者ダッシュボードへのパスを返します。
 * @param {string} tournamentId - 大会ID
 * @returns {string} 主催者ダッシュボードへのパス
 */
export const pathToOrganizerDashboard = (tournamentId: string) =>
  [ROOT_PATH, SEGMENTS.TOURNAMENTS, tournamentId, SEGMENTS.ADMIN].join('/');

/**
 * 問題選択ボードページへのパスを返します。
 * @param {string} tournamentId - 大会ID
 * @returns {string} 問題選択ボードページへのパス
 */
export const pathToQuizBoard = (tournamentId: string) =>
  [ROOT_PATH, SEGMENTS.TOURNAMENTS, tournamentId, SEGMENTS.BOARD].join('/');

/**
 * 問題作成ページへのパスを返します。
 * @param {string} tournamentId - 大会ID
 * @param {string} participantId - 参加者ID
 * @returns {string} 問題作成ページへのパス
 */
export const pathToQuizCreator = (tournamentId: string, participantId: string) =>
  [
    ROOT_PATH,
    SEGMENTS.TOURNAMENTS,
    tournamentId,
    SEGMENTS.PARTICIPANTS,
    participantId,
    SEGMENTS.QUIZZES,
    SEGMENTS.NEW,
  ].join('/');

/**
 * 参加者ダッシュボードへのパスを返します。
 * @param {string} tournamentId - 大会ID
 * @param {string} participantId - 参加者ID
 * @returns {string} 参加者ダッシュボードへのパス
 */
export const pathToParticipantDashboard = (tournamentId: string, participantId: string) =>
  [ROOT_PATH, SEGMENTS.TOURNAMENTS, tournamentId, SEGMENTS.PARTICIPANTS, participantId].join('/');

/**
 * 問題表示ページへのパスを返します。
 * @param {string} quizId - クイズID
 * @returns {string} 問題表示ページへのパス
 */
export const pathToQuizDisplay = (quizId: string) => [ROOT_PATH, SEGMENTS.QUIZZES, quizId].join('/');

/**
 * 解答表示ページへのパスを返します。
 * @param {string} quizId - クイズID
 * @returns {string} 解答表示ページへのパス
 */
export const pathToAnswerDisplay = (quizId: string) => [ROOT_PATH, SEGMENTS.QUIZZES, quizId, SEGMENTS.ANSWER].join('/');

/**
 * エラーページ（キャッチオールルート）へのパスを返します。
 * @returns {string} エラーページへのパス
 */
export const pathToErrorPage = () => `*`;
