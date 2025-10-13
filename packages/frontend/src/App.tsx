
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ServiceTopPage from './pages/ServiceTopPage';
import TournamentCreationPage from './pages/TournamentCreationPage';
import TournamentCreationCompletePage from './pages/TournamentCreationCompletePage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ServiceTopPage />} />
        <Route path="/tournaments/new" element={<TournamentCreationPage />} />
        <Route path="/tournaments/:id/created" element={<TournamentCreationCompletePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
