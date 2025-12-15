import { Box, Typography } from '@mui/material';
import { Quiz } from '../models/Quiz';
import { Button } from './design-system/Button/Button';
import { getGenreColor } from '../helpers/color-helpers';

type QuizDisplayContainerProps = {
  quiz: Quiz;
  onButtonClick?: () => void;
  buttonText?: string;
  showButton?: boolean;
};

export const QuizDisplayContainer = ({
  quiz,
  onButtonClick,
  buttonText = '正解を見る',
  showButton = true,
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
        border: '1vmin solid',
        borderColor: 'primary.main',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2vmin' }}>
        <Box>
          {quiz.genre && (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                bgcolor: getGenreColor(quiz.genre),
                px: '3vmin',
                py: '1vmin',
                borderRadius: '0 0 2vmin 0',
                mt: '-2vmin',
                ml: '-2vmin',
                boxShadow: '0.2vmin 0.2vmin 0.5vmin rgba(0,0,0,0.2)',
                fontSize: '4vmin',
              }}
            >
              {quiz.genre}
            </Typography>
          )}
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            bgcolor: 'primary.main',
            px: '3vmin',
            py: '1vmin',
            borderRadius: '0 0 0 2vmin', // Decorative shape
            mt: '-2vmin', // Pull up to attach to top border
            mr: '-2vmin', // Pull right to attach to right border
            fontSize: '4vmin',
          }}
        >
          {quiz.point}点問題
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
        {quiz.participantName && (
          <Typography
            variant="h6"
            align="center"
            sx={{
              color: 'text.secondary',
              mb: '2vmin',
              fontWeight: 'bold',
              fontSize: '2.5vmin',
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
            fontSize: '4vmin',
            mb: '4vmin',
            px: '4vmin',
            textShadow: '0.1vmin 0.1vmin 0.2vmin rgba(0,0,0,0.1)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.2,
            maxHeight: quiz.questionImage ? '70%' : '90%',
          }}
        >
          Q. {quiz.questionText}
        </Typography>

        {quiz.questionImage && (
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
              src={quiz.questionImage}
              alt="問題画像"
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

        {quiz.questionLink && (
          <Typography variant="h6" align="center" sx={{ mt: '2vmin', fontSize: '2.5vmin' }}>
            参考リンク:{' '}
            <a
              href={quiz.questionLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00529B', textDecoration: 'underline' }}
            >
              {quiz.questionLink}
            </a>
          </Typography>
        )}
      </Box>

      {showButton && (
        <Box sx={{ mt: '2vmin', textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onButtonClick}
            sx={{
              minWidth: '20vmin',
              fontSize: '2.5vmin',
              borderRadius: '4vmin',
              boxShadow: '0 0.5vmin 0.8vmin rgba(0,0,0,0.2)',
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
