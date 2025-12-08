import {
  Dialog,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Container,
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
      // プレビューモードで取得 (既読フラグを更新しない)
      return quizApiClient.get(quizId, true);
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
          <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, height: '100%' }}>
            {mode === 'question' ? (
              // 問題表示プレビュー
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  bgcolor: 'background.paper',
                  p: 3,
                  boxSizing: 'border-box',
                  border: '8px solid',
                  borderColor: 'primary.main',
                  borderRadius: '0', // Dialog is full screen, maybe no radius or small radius? Let's keep consistent inner style
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" color="text.secondary">
                    {/* 左上スペース */}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      bgcolor: 'primary.main',
                      px: 3,
                      py: 1,
                      borderRadius: '0 0 0 16px',
                      mt: -3,
                      mr: -3,
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
                    overflow: 'hidden',
                    width: '100%',
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
                      px: 4,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    Q. {quiz.questionText}
                  </Typography>

                  {quiz.questionImage && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden', p: 2 }}>
                      <img
                        src={quiz.questionImage}
                        alt="問題画像"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      />
                    </Box>
                  )}

                  {quiz.questionLink && (
                    <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                      参考リンク:{' '}
                      <a href={quiz.questionLink} target="_blank" rel="noopener noreferrer" style={{ color: '#00529B', textDecoration: 'underline' }}>
                        {quiz.questionLink}
                      </a>
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              // 解答表示プレビュー
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  bgcolor: '#FFF5F5',
                  p: 3,
                  boxSizing: 'border-box',
                  border: '8px solid',
                  borderColor: 'error.main',
                  borderRadius: '0',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold', borderBottom: '2px solid #ccc', pb: 1, width: '100%', whiteSpace: 'pre-wrap' }}>
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
                    overflow: 'hidden',
                    width: '100%',
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
                      px: 4,
                      color: 'error.main',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    A. {quiz.answerText}
                  </Typography>

                  {quiz.answerImage && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden', p: 2 }}>
                      <img
                        src={quiz.answerImage}
                        alt="解答画像"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      />
                    </Box>
                  )}

                  {quiz.answerLink && (
                    <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                      参考リンク:{' '}
                      <a href={quiz.answerLink} target="_blank" rel="noopener noreferrer" style={{ color: '#d32f2f', textDecoration: 'underline' }}>
                        {quiz.answerLink}
                      </a>
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Container>
        )}
      </Box>
    </Dialog>
  );
};
