import { Box, Paper, Typography } from '@mui/material';

const guides = [
  { title: '主催者：大会を作る', steps: [
    ['大会を作成', '「クイズ大会を新しく作成する」から、大会名と管理用パスワードを入力します。パスワードは手元に控えてください。'],
    ['問題の枠を決める', '1人あたりの問題数、各問題の配点・ラベル・通常問題／選択問題を指定します。例：声優10点、音楽20点。選択問題の択数は問題を作る人が決めます。'],
    ['参加者を招待', '作成完了画面の大会URLを共有します。参加者には問題を作成してもらい、主催者の管理画面で作成状況を確認します。'],
    ['大会を開始', '問題とルールが揃ったら管理画面で当日の参加チーム数・チーム名を設定し、開始ボタンで確定します。問題ボードのカードを開き、回答が揃ったら「正解を見る」で解答を表示します。'],
  ] },
  { title: '参加者：問題を作る', steps: [
    ['共有URLから登録', '大会ページで表示名・ID・パスワードを登録します。再ログインに使うIDとパスワードを控えてください。入力条件は登録欄の下に表示されます。'],
    ['割り当てられた問題を開く', '自分の問題一覧から「作成する」を選びます。配点・ラベル・出題形式は主催者が指定しています。'],
    ['問題と解答を入力', '問題文と解答文を入力し、必要なら画像・動画・音声を添付します。選択問題は2〜20択を選び、各100文字以内の選択肢と正解を設定します。解答文に解説も書けます。'],
    ['保存してプレビュー', '保存後に「問題確認」で投影時の見え方を確認します。誤字や正解、添付の再生を確認し、必要なら「編集」から修正します。'],
  ] },
];

/** 主催者と問題作成者が、それぞれの操作順をトップから確認できるようにする。 */
export const GettingStarted = () => (
  <Box component="section" id="getting-started" aria-labelledby="getting-started-title" sx={{ mt: 5, textAlign: 'left', scrollMarginTop: 24 }}>
    <Typography id="getting-started-title" variant="h4" component="h2" gutterBottom>はじめての使い方</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>まず主催者が大会を用意し、共有URLから参加者が問題を持ち寄ります。</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      {guides.map(guide => <Paper variant="outlined" key={guide.title} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom>{guide.title}</Typography>
        <Box component="ol" sx={{ pl: 3, mb: 0, '& li': { mb: 2 }, '& li::marker': { color: 'primary.main', fontWeight: 800 } }}>
          {guide.steps.map(([title, description]) => <li key={title}>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{description}</Typography>
          </li>)}
        </Box>
      </Paper>)}
    </Box>
  </Box>
);
