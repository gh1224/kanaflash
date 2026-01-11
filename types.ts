export type KanaType = 'hiragana' | 'katakana';
export type KanaCategory = 'basic' | 'dakuten' | 'youm';

export interface KanaItem {
  id: string;
  char: string;
  romaji: string;
  type: KanaType;
  category: KanaCategory;
}

export enum View {
  HOME = 'HOME',
  QUIZ = 'QUIZ',
  REVIEW = 'REVIEW',
  WRITING = 'WRITING',
  SUMMARY = 'SUMMARY'
}