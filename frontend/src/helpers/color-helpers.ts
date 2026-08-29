// 鮮やかな色のパレット
const GENRE_COLORS = [
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#03A9F4', // Light Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
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
