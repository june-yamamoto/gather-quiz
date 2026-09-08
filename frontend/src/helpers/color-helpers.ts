// 白い文字の可読性を確保し、共通テーマに馴染む落ち着いた色を使う。
const GENRE_COLORS = [
  '#874B61', '#715579', '#5F587C', '#4A5C7C',
  '#3D6476', '#3C6970', '#376B66', '#32634F',
  '#526942', '#64683B', '#786334', '#88602D',
  '#96582F', '#A65029',
];

/**
 * ジャンル名から色を取得する
 * 同じジャンル名からは常に同じ色が返るようにする
 */
export const getGenreColor = (genre: string): string => {
  let hash = 0;
  for (let i = 0; i < genre.length; i++) {
    hash = genre.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 負の数になるのを防ぐ
  hash = Math.abs(hash);
  
  return GENRE_COLORS[hash % GENRE_COLORS.length];
};
