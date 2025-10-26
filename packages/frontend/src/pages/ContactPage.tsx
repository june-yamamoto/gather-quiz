import { Typography, Container, Link } from '@mui/material';

/**
 * お問い合わせページ
 */
const ContactPage = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        お問い合わせ
      </Typography>
      <Typography variant="body1" paragraph>
        本サービスに関するお問い合わせは、以下の連絡先までお願いいたします。
      </Typography>
      <Typography variant="body1" paragraph>
        Email: <Link href="mailto:support@gather-quiz.example.com">support@gather-quiz.example.com</Link>
      </Typography>
      <Typography variant="body1" paragraph>
        （現在、電話でのお問い合わせは受け付けておりません。）
      </Typography>
    </Container>
  );
};

export default ContactPage;
