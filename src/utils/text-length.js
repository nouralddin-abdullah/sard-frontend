// User-perceived characters (extended grapheme clusters): what the API counts a gift message in (.NET's
// StringInfo.LengthInTextElements) and what Flutter's counter shows. An emoji, a flag or a letter with its tashkeel is
// one character, though it takes two or more UTF-16 units, which is what String.length counts.
const segmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

// Without Intl.Segmenter (older browsers): code points, where marks (tashkeel), variation selectors, skin tones and
// emoji tags belong to the character before them, a zero-width joiner joins the next one to it, and regional indicators
// pair into a flag. Close enough for a counter: the API has the last word.
const MARK = /^\p{M}$/u;
const ZERO_WIDTH_JOINER = "‍";

const extendsPrevious = (char, codePoint) =>
  MARK.test(char) ||
  codePoint === 0x200c || // zero-width non-joiner
  (codePoint >= 0xfe00 && codePoint <= 0xfe0f) || // variation selectors (the red heart's)
  (codePoint >= 0x1f3fb && codePoint <= 0x1f3ff) || // skin tones
  (codePoint >= 0xe0020 && codePoint <= 0xe007f) || // tags (the flags of England, Scotland and Wales)
  (codePoint >= 0xe0100 && codePoint <= 0xe01ef); // more variation selectors

const isRegionalIndicator = (codePoint) => codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff;

const countWithoutSegmenter = (text) => {
  let count = 0;
  let previous = "";
  let afterJoiner = false;
  let halfFlag = false;
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    const regional = isRegionalIndicator(codePoint);
    const joinsPrevious =
      count > 0 &&
      (afterJoiner ||
        char === ZERO_WIDTH_JOINER ||
        extendsPrevious(char, codePoint) ||
        (char === "\n" && previous === "\r") ||
        (regional && halfFlag));
    if (!joinsPrevious) {
      count++;
    }
    halfFlag = regional ? !halfFlag : false;
    afterJoiner = char === ZERO_WIDTH_JOINER;
    previous = char;
  }
  return count;
};

export const countCharacters = (text) => {
  if (!text) {
    return 0;
  }
  if (segmenter) {
    let count = 0;
    for (const _segment of segmenter.segment(text)) {
      count++;
    }
    return count;
  }
  return countWithoutSegmenter(text);
};
