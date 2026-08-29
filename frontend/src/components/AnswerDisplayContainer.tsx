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
        bgcolor: '#FFF5F5', // Light reddish background for answer
        p: '2vmin',
        boxSizing: 'border-box',
        // Decorative frame
        border: '1vmin solid',
        borderColor: 'error.main', // Red border for answer
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
            fontSize: '2vmin',
            height: '100%',
            paddingBottom: '8px',
            paddingTop: '8px',
          }}
        >
          Q. {quiz.questionText}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          width: '100%',
        }}
      >
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: '4vmin',
            mb: '4vmin',
            px: '4vmin',
            color: 'error.main',
            textShadow: '0.1vmin 0.1vmin 0.2vmin rgba(0,0,0,0.1)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.2,
            maxHeight: quiz.answerImage ? '70%' : '90%',
          }}
        >
          A. {quiz.answerText}
        </Typography>

        {quiz.answerImage && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              overflow: 'hidden',
              p: '2vmin',
            }}
          >
            <img
              src={quiz.answerImage}
              alt="解答画像"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                minHeight: '20%',
                objectFit: 'contain',
                borderRadius: '1vmin',
                boxShadow: '0 0.5vmin 1.5vmin rgba(0,0,0,0.15)',
              }}
            />
          </Box>
        )}

        {quiz.answerLink && (
          <Typography variant="h6" align="center" sx={{ mt: '2vmin', fontSize: '2.5vmin' }}>
            参考リンク:{' '}
            <a
              href={quiz.answerLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#d32f2f', textDecoration: 'underline' }}
            >
              {quiz.answerLink}
            </a>
          </Typography>
        )}
      </Box>

      {showButton && (
        <Box sx={{ mt: '2vmin', textAlign: 'center', pb: '2vmin' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onButtonClick}
            sx={{
              minWidth: '20vmin',
              fontSize: '2.5vmin',
              borderRadius: '4vmin',
              boxShadow: '0 0.5vmin 0.8vmin rgba(0,0,0,0.2)',
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
