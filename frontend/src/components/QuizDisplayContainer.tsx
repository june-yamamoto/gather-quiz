import { QuizMedia } from './QuizMedia';
import { QuizChoices } from './QuizChoices';
import { ExpandableQuizImage } from './ExpandableQuizImage';
import { Box, Typography } from '@mui/material';
import { Quiz } from '../models/Quiz';
import { Button } from './design-system/Button/Button';
import { getGenreColor } from '../helpers/color-helpers';

type QuizDisplayContainerProps = {
  quiz: Quiz;
  onButtonClick?: () => void;
  buttonText?: string;
  showButton?: boolean;
  onQuestionImageLoad?: () => void;
  onQuestionMediaPlayed?: () => void;
};

export const QuizDisplayContainer = ({
  quiz,
  onButtonClick,
  buttonText = '正解を見る',
  showButton = true,
  onQuestionImageLoad,
  onQuestionMediaPlayed,
}: QuizDisplayContainerProps) => {
  return (
    <Box
      sx={{
        pt: '24px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Changed from 100vh to 100% to fit in container
        width: '100%',
        bgcolor: 'background.paper',
        p: '2vmin',
        boxSizing: 'border-box',
        // Decorative frame
        border: '0.5vmin solid',
        borderColor: 'primary.main',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 1, mb: '2vmin', maxHeight: '35%', overflow: 'auto', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: '1 1 220px', minWidth: 0 }}>
          {quiz.label && <Typography component="p" sx={{ fontSize: 'clamp(16px, 2.5vmin, 32px)', fontWeight: 700, overflowWrap: 'anywhere', maxWidth: '100%', px: '2vmin', py: '1vmin', border: 1, borderColor: 'primary.main', borderRadius: 2 }}>{quiz.label}</Typography>}
          {quiz.genre && <Typography component="p" sx={{ fontSize: 'clamp(16px, 2.5vmin, 32px)', fontWeight: 700, overflowWrap: 'anywhere', maxWidth: '100%', color: 'white', bgcolor: getGenreColor(quiz.genre), px: '2vmin', py: '1vmin', borderRadius: 2 }}>{quiz.genre}</Typography>}
        </Box>
        <Typography component="p" sx={{ fontSize: 'clamp(16px, 2.5vmin, 32px)', fontWeight: 800, color: 'primary.contrastText', bgcolor: 'primary.main', px: '2vmin', py: '1vmin', borderRadius: 2, ml: 'auto', whiteSpace: 'nowrap' }}>{quiz.point}点問題</Typography>
      </Box>

      <Box role="region" aria-label="本文" tabIndex={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'safe center',
          minHeight: 0,
          '& > *': { flexShrink: 0 },
          overflowWrap: 'anywhere',
          overflow: 'auto',
          width: '100%',
        }}
      >
        {quiz.participantName && (
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: 'text.secondary',
              mb: '2vmin',
              fontWeight: 'bold',
              fontSize: 'clamp(16px, 2.5vmin, 32px)',
            }}
          >
            作成者: {quiz.participantName}
          </Typography>
        )}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: 'clamp(22px, 4vmin, 64px)',
            mb: '4vmin',
            px: '4vmin',

            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            maxWidth: '100%',
          }}
        >
          {quiz.questionText}
        </Typography>
        {quiz.choiceCount > 0 && <QuizChoices choices={quiz.choices} />}



        {quiz.questionLink && <QuizMedia url={quiz.questionLink} label="問題メディア" onPlayed={onQuestionMediaPlayed} />}
      </Box>

        {quiz.questionImage && (
          <Box sx={{ height: '35%', minHeight: 0, flexShrink: 0, display: 'flex', justifyContent: 'center', pt: 1 }}>
          <ExpandableQuizImage contained key={quiz.questionImage} src={quiz.questionImage} alt="問題画像" onLoad={onQuestionImageLoad} />
          </Box>
        )}

      {showButton && (
        <Box sx={{ mt: '2vmin', flexShrink: 0, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onButtonClick}
            sx={{
              minWidth: '20vmin',
              fontSize: 'clamp(16px, 2.5vmin, 32px)',
              borderRadius: '4vmin',

              py: '1vmin',
              px: '4vmin',
            }}
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </Box>
  );
};
