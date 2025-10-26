import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ServiceTopPage from './pages/ServiceTopPage';
import TournamentCreationPage from './pages/TournamentCreationPage';
import TournamentCreationCompletePage from './pages/TournamentCreationCompletePage';
import TournamentPortalPage from './pages/TournamentPortalPage';
import ParticipantRegistrationPage from './pages/ParticipantRegistrationPage';
import QuizCreatorPage from './pages/QuizCreatorPage';
import ParticipantDashboardPage from './pages/ParticipantDashboardPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import QuizBoardPage from './pages/QuizBoardPage';
import QuizDisplayPage from './pages/QuizDisplayPage';
import AnswerDisplayPage from './pages/AnswerDisplayPage';
import ErrorPage from './pages/ErrorPage';
import { Layout } from './components/Layout';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import {
  pathToServiceTop,
  pathToTournamentCreation,
  pathToTournamentCreationComplete,
  pathToTournamentRegisterParticipant,
  pathToQuizCreator,
  pathToParticipantDashboard,
  pathToOrganizerDashboard,
  pathToTournamentEdit,
  pathToQuizBoard,
  pathToQuizDisplay,
  pathToAnswerDisplay,
  pathToTournamentPortal,
} from './helpers/route-helpers';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to={pathToServiceTop()} replace />} />
        <Route path={pathToServiceTop()} element={<ServiceTopPage />} />
        <Route path={pathToTournamentCreation()} element={<TournamentCreationPage />} />
        <Route path={pathToTournamentCreationComplete(':id')} element={<TournamentCreationCompletePage />} />
        <Route path={pathToTournamentRegisterParticipant(':id')} element={<ParticipantRegistrationPage />} />
        <Route path={pathToQuizCreator(':tournamentId', ':participantId')} element={<QuizCreatorPage />} />
        <Route
          path={pathToParticipantDashboard(':tournamentId', ':participantId')}
          element={<ParticipantDashboardPage />}
        />
        <Route path={pathToOrganizerDashboard(':tournamentId')} element={<OrganizerDashboardPage />} />
        <Route path={pathToTournamentEdit(':tournamentId')} element={<TournamentCreationPage />} />
        <Route path={pathToQuizBoard(':tournamentId')} element={<QuizBoardPage />} />
        <Route path={pathToQuizDisplay(':quizId')} element={<QuizDisplayPage />} />
        <Route path={pathToAnswerDisplay(':quizId')} element={<AnswerDisplayPage />} />
        <Route path={pathToTournamentPortal(':id')} element={<TournamentPortalPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
};

export default App;
