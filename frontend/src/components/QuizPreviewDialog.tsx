import {
  Dialog,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Container,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { quizApiClient } from '../api/QuizApiClient';

type QuizPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  quizId: string;
  mode: 'question' | 'answer';
};

export const QuizPreviewDialog = ({ open, onClose, quizId, mode }: QuizPreviewDialogProps) => {
  const {
    data: quiz,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => {
      if (!quizId) throw new Error('Quiz ID is undefined');
      return quizApiClient.get(quizId);
    },
    enabled: open && !!quizId,
  });

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box sx={{ position: 'relative', height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error || !quiz ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="error">エラー: {error?.message || 'クイズの読み込みに失敗しました。'}</Typography>
          </Box>
        ) : (
          <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 4, height: '100%' }}>
            {mode === 'question' ? (
              // 問題表示プレビュー
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" color="text.secondary">
                    {/* 左上スペース */}
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
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
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                      mb: 4,
                    }}
                  >
                    Q. {quiz.questionText}
                  </Typography>

                  {quiz.questionImage && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
                      <img
                        src={quiz.questionImage}
                        alt="問題画像"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  )}

                  {quiz.questionLink && (
                    <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                      参考リンク:{' '}
                      <a href={quiz.questionLink} target="_blank" rel="noopener noreferrer">
                        {quiz.questionLink}
                      </a>
                    </Typography>
                  )}
                </Box>
              </>
            ) : (
              // 解答表示プレビュー
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="text.secondary">
                    Q. {quiz.questionText}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                      mb: 4,
                      color: 'error.main',
                    }}
                  >
                    A. {quiz.answerText}
                  </Typography>

                  {quiz.answerImage && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
                      <img
                        src={quiz.answerImage}
                        alt="解答画像"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  )}

                  {quiz.answerLink && (
                    <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                      参考リンク:{' '}
                      <a href={quiz.answerLink} target="_blank" rel="noopener noreferrer">
                        {quiz.answerLink}
                      </a>
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Container>
        )}
      </Box>
    </Dialog>
  );
};
