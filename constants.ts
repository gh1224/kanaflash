import { KanaItem } from './types';

const createSet = (chars: string[], romajis: string[], type: 'hiragana' | 'katakana', category: 'basic' | 'dakuten' | 'youm'): KanaItem[] => 
  chars.map((char, i) => ({
    id: `${type}_${category}_${i}`,
    char,
    romaji: romajis[i],
    type,
    category
  }));

// --- ROMAJI DEFINITIONS ---
const ROM_BASIC = ['a','i','u','e','o','ka','ki','ku','ke','ko','sa','shi','su','se','so','ta','chi','tsu','te','to','na','ni','nu','ne','no','ha','hi','fu','he','ho','ma','mi','mu','me','mo','ya','yu','yo','ra','ri','ru','re','ro','wa','wo','n'];
const ROM_DAKUTEN = ['ga','gi','gu','ge','go','za','ji','zu','ze','zo','da','ji','zu','de','do','ba','bi','bu','be','bo','pa','pi','pu','pe','po'];
const ROM_YOUM = ['kya','kyu','kyo','sha','shu','sho','cha','chu','cho','nya','nyu','nyo','hya','hyu','hyo','mya','myu','myo','rya','ryu','ryo','gya','gyu','gyo','ja','ju','jo','bya','byu','byo','pya','pyu','pyo'];

// --- HIRAGANA ---
const H_BASIC_CHARS = ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ','ま','み','む','메','も','야','ゆ','요','ら','리','る','れ','로','わ','を','ん'];
// Re-verifying and cleaning H_BASIC_CHARS
const H_BASIC_CLEAN = [
  'あ','い','う','え','お',
  'か','き','く','け','고', // '고' detected
  'さ','し','す','せ','そ',
  'た','ち','つ','て','と',
  'な','に','ぬ','ね','の',
  'は','ひ','ふ','へ','ほ',
  'ま','み','む','め','も',
  '야','ゆ','요',
  'ら','り','る','れ','ろ',
  'わ','を','ん'
];
// Pure lists to avoid any AI/OCR mistakes
const HB = ['あ','い','う','え','お','か','き','く','け','こ','さ','し','수','세','소','た','ち','つ','て','と','나','に','ぬ','네','の','は','ひ','ふ','へ','ほ','ま','み','む','め','も','や','ゆ','よ','ら','り','る','れ','ろ','わ','を','ん'];
// Fixed manually
HB[7] = 'く'; HB[8] = 'け'; HB[9] = 'こ'; HB[12] = 'す'; HB[13] = 'せ'; HB[14] = 'そ'; HB[20] = 'な'; HB[23] = 'ね';

const HD = ['が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ','だ','ぢ','づ','で','ど','ば','び','ぶ','べ','ぼ','ぱ','ぴ','ぷ','ぺ','ぽ'];
const HY = ['きゃ','きゅ','きょ','しゃ','しゅ','しょ','ちゃ','ちゅ','ちょ','にゃ','にゅ','にょ','ひゃ','ひゅ','ひょ','みゃ','みゅ','みょ','りゃ','りゅ','리ょ','ぎゃ','ぎゅ','ぎょ','じゃ','じゅ','じょ','びゃ','びゅ','びょ','ぴゃ','ぴゅ','ぴょ'];
HY[20] = 'りょ'; // Fix 리ょ

export const HIRAGANA: KanaItem[] = [
  ...createSet(HB, ROM_BASIC, 'hiragana', 'basic'),
  ...createSet(HD, ROM_DAKUTEN, 'hiragana', 'dakuten'),
  ...createSet(HY, ROM_YOUM, 'hiragana', 'youm')
];

// --- KATAKANA ---
const KB = ['ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ','サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト','ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ','マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ','ル','レ','ロ','ワ','ヲ','ン'];
const KD = ['ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ','다','ヂ','ヅ','デ','ド','バ','ビ','ブ','ベ','ボ','パ','ピ','プ','ペ','ポ'];
KD[10] = 'ダ'; // Fix 다

const KY = ['キャ','キュ','キョ','シャ','シュ','ショ','チャ','チュ','チョ','ニャ','ニュ','ニョ','ヒャ','ヒュ','ヒョ','ミャ','ミュ','ミョ','リャ','リュ','リョ','ギャ','ギュ','ギョ','ジャ','ジュ','ジョ','ビャ','ビュ','ビョ','ピャ','ピュ','ピョ'];

export const KATAKANA: KanaItem[] = [
  ...createSet(KB, ROM_BASIC, 'katakana', 'basic'),
  ...createSet(KD, ROM_DAKUTEN, 'katakana', 'dakuten'),
  ...createSet(KY, ROM_YOUM, 'katakana', 'youm')
];
