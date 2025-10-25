import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { pathToOrganizerDashboard, pathToTournamentCreationComplete } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { TournamentForm, type TournamentFormData } from '../components/TournamentForm';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const TournamentCreationPage = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const isEditMode = !!tournamentId;

  const { data: tournamentData } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => {
      if (!tournamentId) {
        throw new Error('Tournament ID is not defined');
      }
      return tournamentApiClient.get(tournamentId);
    },
    enabled: isEditMode && !!tournamentId,
  });

  const handleSubmit = async (formData: TournamentFormData) => {
    try {
      if (isEditMode && tournamentId) {
        const tournament = await tournamentApiClient.update(tournamentId, formData);
        alert('大会情報が更新されました。');
        navigate(pathToOrganizerDashboard(tournament.id));
      } else {
        const tournament = await tournamentApiClient.create(formData);
        navigate(pathToTournamentCreationComplete(tournament.id), {
          state: { password: formData.password },
        });
      }
    } catch (error) {
      console.error(error);
      alert(isEditMode ? '更新に失敗しました。' : '作成に失敗しました。');
    }
  };

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? '大会概要を編集' : '新しいクイズ大会を作成'}
      </Typography>
      <TournamentForm tournament={tournamentData} onSubmit={handleSubmit} isEditMode={isEditMode} />
    </StyledContainer>
  );
};

export default TournamentCreationPage;
