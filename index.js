const fs = require('fs');

function getFiles(dir, files_) {
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

function getRegexPattern() {
  const remMatch = /\[\d*(\.\d+)?rem\]/;
  const pxMatch = /\[\d*(\.\d+)?px\]/;
  const utilMatch = /\d+(?!\/)(\.\d+)?/;
  const sizeMatch = new RegExp(
    [remMatch, pxMatch, utilMatch].map((p) => '(' + p.source + ')').join('|')
  );
  const notAfterMatch = /(?<![\w])/; //cannot be preceeded by any word character
  const pMatch = /p[xytrbl]?/;
  const mMatch = /m[xytrbl]?/;
  const wMatch = /w/;
  const hMatch = /h/;
  const gapMatch = /gap/;
  const leadingMatch = /leading/;
  const textMatch = /text/;
  const allSelectors = [
    pMatch,
    mMatch,
    wMatch,
    hMatch,
    gapMatch,
    leadingMatch,
    textMatch,
  ];
  const allExpressions = allSelectors.map((selector) => {
    return RegExp(
      `${notAfterMatch.source}(${selector.source})-(${sizeMatch.source})`
    );
  });
  const allMatch = new RegExp(
    allExpressions.map((pattern) => pattern.source).join('|'),
    'gm'
  );
  console.log({ regex: allMatch });
  return allMatch;
}

function main() {
  const replace = require('replace-in-file');
  const remToRem = (x) => '[' + Number((1.6 * x).toFixed(2)) + 'rem' + ']';
  const pxToRem = (x) => '[' + Number((x / 10).toFixed(2)) + 'rem' + ']';
  const twUtilToRem = (x) =>
    '[' + Number(((x * 4) / 10).toFixed(2)) + 'rem' + ']';
  // const twUtilToRem = (x) => ((x * 4) / 1.6).toFixed(2);
  const isRem = (s) => s.endsWith('rem]');
  const isPx = (s) => s.endsWith('px]');
  const handleRem = (m) => {
    const beforeTheSlash = m.substring(0, m.indexOf('-'));
    const foundValue = /\d*(\.?\d+?)+/gm.exec(m)?.[0];
    const numValue = Number(foundValue);
    const newValue = remToRem(numValue);
    if (numValue === null || numValue === NaN) return m;
    return `${beforeTheSlash}-${newValue}`;
  };
  const handlePx = (m) => {
    const beforeTheSlash = m.substring(0, m.indexOf('-'));
    const foundValue = /\d*(\.?\d+?)+/gm.exec(m)?.[0];
    const numValue = Number(foundValue);
    const newValue = pxToRem(numValue);
    if (numValue === null || numValue === NaN) return m;
    return `${beforeTheSlash}-${newValue}`;
  };
  const handleUtil = (m) => {
    const beforeTheSlash = m.substring(0, m.indexOf('-'));
    const foundValue = /\d*(\.?\d+?)+/gm.exec(m)?.[0];
    const numValue = Number(foundValue);
    const newValue = twUtilToRem(numValue);
    if (numValue === null || numValue === NaN) return m;
    return `${beforeTheSlash}-${newValue}`;
  };
  const handleMatch = (m) => {
    if (isRem(m)) return handleRem(m);
    if (isPx(m)) return handlePx(m);
    return handleUtil(m);
  };
  const files = getFiles('/Users/samuelpetering/toolbox/gearfocus-web/src');
  // const files = getFiles('data');
  const options = {
    files: files,
    from: getRegexPattern(),
    to: (m) => handleMatch(m),
    countMatches: true,
    // dry: true,
  };
  try {
    const res = replace.sync(options);
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

main();
