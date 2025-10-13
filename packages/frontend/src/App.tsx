import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ServiceTopPage from './pages/ServiceTopPage';
import TournamentCreationPage from './pages/TournamentCreationPage';
import TournamentCreationCompletePage from './pages/TournamentCreationCompletePage';
import TournamentPortalPage from './pages/TournamentPortalPage';
import ParticipantRegistrationPage from './pages/ParticipantRegistrationPage';
import QuizCreatorPage from './pages/QuizCreatorPage';
import ParticipantDashboardPage from './pages/ParticipantDashboardPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ServiceTopPage />} />
        <Route path="/tournaments/new" element={<TournamentCreationPage />} />
        <Route path="/tournaments/:id/created" element={<TournamentCreationCompletePage />} />
        <Route path="/tournaments/:id/register" element={<ParticipantRegistrationPage />} />
        <Route path="/tournaments/:id" element={<TournamentPortalPage />} />
        <Route path="/tournaments/:tournamentId/quizzes/new" element={<QuizCreatorPage />} />
        <Route path="/tournaments/:tournamentId/participants/:participantId" element={<ParticipantDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
