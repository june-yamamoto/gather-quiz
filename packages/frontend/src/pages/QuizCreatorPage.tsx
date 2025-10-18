import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const QuizCreatorPage = () => {
  const { tournamentId } = useParams();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('0');
  const [point, setPoint] = useState(10);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // TODO: Replace with the actual logged-in participant ID
    const participantId = 'clxza9vjm000111mndb1f42k5';

    const submission = {
      question,
      // Note: Storing options in the question field for now.
      // This should be normalized in the DB schema later.
      options: JSON.stringify(options),
      answer: options[parseInt(correctAnswer)],
      point,
      tournamentId,
      participantId,
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
      // TODO: Navigate to the quiz list page or clear the form
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
          label="問題文"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ mb: 3 }}
        />

        {options.map((option, index) => (
          <TextField
            key={index}
            label={`選択肢 ${index + 1}`}
            variant="outlined"
            fullWidth
            required
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            sx={{ mb: 2 }}
          />
        ))}

        <FormControl component="fieldset" sx={{ mt: 2, mb: 3 }}>
          <FormLabel component="legend">正解の選択肢</FormLabel>
          <RadioGroup
            row
            aria-label="correct-answer"
            name="correct-answer-group"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          >
            {options.map((_, index) => (
              <FormControlLabel
                key={index}
                value={index.toString()}
                control={<Radio />}
                label={`選択肢 ${index + 1}`}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          label="配点"
          variant="outlined"
          type="number"
          required
          value={point}
          onChange={(e) => setPoint(Number(e.target.value))}
          sx={{ mb: 3, width: '150px' }}
        />

        <Button type="submit" variant="contained" color="primary" size="large">
          この内容で問題を保存する
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default QuizCreatorPage;
