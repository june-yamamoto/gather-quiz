import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { TextField, Button, Container, Typography, Box, Grid } from '@mui/material';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const QuizCreatorPage = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams();

  const [point, setPoint] = useState(10);
  const [questionText, setQuestionText] = useState('');
  const [questionLink, setQuestionLink] = useState('');

  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(null);

  const [answerText, setAnswerText] = useState('');
  const [answerLink, setAnswerLink] = useState('');

  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [answerImageUrl, setAnswerImageUrl] = useState<string | null>(null);

  // TODO: Implement edit mode logic if needed for quizzes

  const uploadImageToS3 = async (file: File): Promise<string | null> => {
    try {
      // 1. Get pre-signed URL from backend
      const getSignedUrlRes = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!getSignedUrlRes.ok) {
        throw new Error('Failed to get signed URL');
      }
      const { signedUrl, objectUrl } = await getSignedUrlRes.json();

      // 2. Upload image to S3 using the pre-signed URL
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to S3');
      }

      return objectUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('画像のアップロードに失敗しました。');
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let finalQuestionImageUrl = questionImageUrl;
    if (questionImageFile) {
      finalQuestionImageUrl = await uploadImageToS3(questionImageFile);
      if (!finalQuestionImageUrl) return; // Stop if upload failed
    }

    let finalAnswerImageUrl = answerImageUrl;
    if (answerImageFile) {
      finalAnswerImageUrl = await uploadImageToS3(answerImageFile);
      if (!finalAnswerImageUrl) return; // Stop if upload failed
    }

    const submission = {
      point,
      questionText,
      questionImage: finalQuestionImageUrl,
      questionLink,
      answerText,
      answerImage: finalAnswerImageUrl,
      answerLink,
      tournamentId,
      // TODO: Replace with actual participant ID from context/auth
      participantId: 'clxza9vjm000111mndb1f42k5',
    };

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error('問題の作成に失敗しました。');
      }

      alert('問題が作成されました！');
      // TODO: Navigate to the participant dashboard or clear the form
      navigate(`/tournaments/${tournamentId}/participants/clxza9vjm000111mndb1f42k5`);
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        問題作成・編集
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          label="配点"
          variant="outlined"
          type="number"
          required
          value={point}
          onChange={(e) => setPoint(Number(e.target.value))}
          sx={{ mb: 3, width: '150px' }}
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Section>
              <Typography variant="h6" gutterBottom>
                問題の作成
              </Typography>
              <TextField
                label="問題文"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                添付画像を選択
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setQuestionImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {questionImageFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {questionImageFile.name}
                </Typography>
              )}
              {questionImageUrl && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  アップロード済みURL: {questionImageUrl}
                </Typography>
              )}
              <TextField
                label="参考リンク"
                variant="outlined"
                fullWidth
                value={questionLink}
                onChange={(e) => setQuestionLink(e.target.value)}
              />
            </Section>
          </Grid>

          <Grid item xs={12} md={6}>
            <Section>
              <Typography variant="h6" gutterBottom>
                解答の作成
              </Typography>
              <TextField
                label="解答文"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                添付画像を選択
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setAnswerImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {answerImageFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {answerImageFile.name}
                </Typography>
              )}
              {answerImageUrl && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  アップロード済みURL: {answerImageUrl}
                </Typography>
              )}
              <TextField
                label="参考リンク"
                variant="outlined"
                fullWidth
                value={answerLink}
                onChange={(e) => setAnswerLink(e.target.value)}
              />
            </Section>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" size="large">
            この内容で問題を保存する
          </Button>
        </Box>
      </Box>
    </StyledContainer>
  );
};

export default QuizCreatorPage;
