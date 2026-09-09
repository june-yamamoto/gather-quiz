export const imageFixture = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" fill="#E4EFE9"/><circle cx="300" cy="180" r="100" fill="#205649"/><text x="300" y="205" font-size="72" fill="white" text-anchor="middle">?</text></svg>');

export const quizFixture = {
  id: 'q-1', tournamentId: 't-1', participantId: 'p-1', participantName: 'あおい',
  point: 10, order: 0, isOpened: false, genre: 'ことば',
  questionText: '「一期一会」という言葉が生まれた、日本の伝統文化は何でしょう？',
  answerText: '茶道', questionImage: null, answerImage: null, questionLink: null, answerLink: null,
};
export const participantFixture = {
  id: 'p-1', loginId: 'aoi', tournamentId: 't-1', name: 'あおい', created: 1, required: 3, quizzes: [quizFixture],
};
export const tournamentFixture = {
  id: 't-1', name: '週末の持ち寄りクイズ大会', questionsPerParticipant: 3, points: '10,20,30',
  genres: 'ことば,科学,旅と暮らし', regulation: 'ひとり3問ずつ持ち寄りましょう。\n解答は相談してから、代表者がお答えください。',
  status: 'preparing', createdAt: '2026-09-01T00:00:00.000Z',
  participants: [participantFixture, { ...participantFixture, id: 'p-2', name: 'はる', created: 0, quizzes: [] }],
};
export const statusFixture = {
  tournamentName: tournamentFixture.name, status: tournamentFixture.status, participants: tournamentFixture.participants,
};
export const dashboardFixture = {
  participantName: participantFixture.name, tournamentPoints: '10,20,30',
  createdQuizzes: [quizFixture], remainingQuestions: 2,
};

export const mobile = { viewport: { defaultViewport: 'mobile' } };
