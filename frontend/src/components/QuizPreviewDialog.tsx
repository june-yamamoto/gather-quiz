import { Dialog, IconButton, Box, Typography, CircularProgress, Container } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { quizApiClient } from '../api/QuizApiClient';
import { QuizDisplayContainer } from './QuizDisplayContainer';
import { AnswerDisplayContainer } from './AnswerDisplayContainer';

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
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, color: 'text.primary' }}
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
          <Container
            maxWidth={false}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              p: 0,
              paddingLeft: '0',
              paddingRight: '0',
              height: '100%',
            }}
          >
            {mode === 'question' ? (
              // 問題表示プレビュー
              <QuizDisplayContainer quiz={quiz} showButton={false} />
            ) : (
              // 解答表示プレビュー
              <AnswerDisplayContainer quiz={quiz} showButton={false} />
            )}
          </Container>
        )}
      </Box>
    </Dialog>
  );
};
