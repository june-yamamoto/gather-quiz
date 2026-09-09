import { QuizChoices } from './QuizChoices';
import { QuizMedia } from './QuizMedia';
import { ExpandableQuizImage } from './ExpandableQuizImage';
import { Box, Typography } from '@mui/material';
import { Quiz } from '../models/Quiz';
import { Button } from './design-system/Button/Button';

type AnswerDisplayContainerProps = {
  quiz: Quiz;
  onButtonClick?: () => void;
  buttonText?: string;
  showButton?: boolean;
};

export const AnswerDisplayContainer = ({
  quiz,
  onButtonClick,
  buttonText = 'ボードに戻る',
  showButton = true,
}: AnswerDisplayContainerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Changed from 100vh to 100%
        width: '100%',
        bgcolor: 'background.paper',
        p: '2vmin',
        boxSizing: 'border-box',
        // Decorative frame
        border: '0.5vmin solid',
        borderColor: 'secondary.main', // Red border for answer
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          mb: '2vmin',
          display: 'flex',
          alignItems: 'center',
          maxHeight: '20%',
          overflow: 'auto',
          borderBottom: '0.2vmin solid #ccc',
        }}
      >
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            fontWeight: 'bold',
            pb: '1vmin',
            width: '100%',
            whiteSpace: 'pre-wrap',
            fontSize: 'clamp(16px, 2vmin, 28px)',
            height: '100%',
            paddingBottom: '8px',
            paddingTop: '8px',
          }}
        >
          {quiz.questionText}
        </Typography>
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
        {quiz.choiceCount > 0 && <QuizChoices choices={quiz.choices} correctChoiceIndex={quiz.correctChoiceIndex} />}
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: 'clamp(22px, 4vmin, 64px)',
            mb: '4vmin',
            px: '4vmin',
            color: 'secondary.main',

            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            maxWidth: '100%',
          }}
        >
          {quiz.answerText}
        </Typography>



        {quiz.answerLink && <QuizMedia url={quiz.answerLink} label="解答メディア" />}
      </Box>

        {quiz.answerImage && (
          <Box sx={{ height: '35%', minHeight: 0, flexShrink: 0, display: 'flex', justifyContent: 'center', pt: 1 }}>
          <ExpandableQuizImage contained key={quiz.answerImage} src={quiz.answerImage} alt="解答画像" />
          </Box>
        )}

      {showButton && (
        <Box sx={{ mt: '2vmin', flexShrink: 0, textAlign: 'center', pb: '2vmin' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onButtonClick}
            sx={{
              minWidth: '20vmin',
              fontSize: 'clamp(16px, 2.5vmin, 32px)',
              borderRadius: '4vmin',

              bgcolor: 'secondary.main', // Green button to go back
              '&:hover': {
                bgcolor: 'secondary.dark',
              },
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
