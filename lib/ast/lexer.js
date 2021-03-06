'use strict';

var keywords = [
  'call_import', 'call_indirect', 'addressof',
  'if', 'else', 'do', 'while', 'forever', 'continue', 'break', 'return',
  'switch', 'export', 'import'
];

var template =
    '\\s*' + // skip whitespace
    '(?:\\/\\/[^\\r\\n]*(?:[\\r\\n]+|$))*' + // skip comments
    '(?:' +
    '([\\.\\,{}\\(\\);=]|::)|' + // punctuation
    '(void|addr|i(?:32|64)|f(?:32|64))|' + // type
    '(' + keywords.join('|') + ')|' + // keyword
    '(' +
        '0x[a-fA-F0-9]+' + // hex literal
        '|' +
        '[+-]?[\\d_]+(?:\\.(?:[\\d_]*(?:e[+-]?\\d+)?)?)?' + // decimal literal
    ')|' +
    '([\\$a-z][\\$a-z\\d_]*)' + // identifier
    ')?';

function Lexer(source) {
  this.source = source.trim();
  this.length = this.source.length;
  this.re = new RegExp(template, 'gi');
}
module.exports = Lexer;

Lexer.create = function create(source) {
  return new Lexer(source);
};

Lexer.prototype.save = function save() {
  return this.re.lastIndex;
};

Lexer.prototype.restore = function restore(index) {
  this.re.lastIndex = index;
};

Lexer.prototype.next = function next() {
  while (true) {
    var prev = this.re.lastIndex;
    var out = this.re.exec(this.source);

    if (out === null || out[0].length === 0)
      throw new Error('Lexer failed at: ' + prev);
    if (prev + out[0].length !== this.re.lastIndex)
      throw new Error('Lexer failed at: ' + (prev + out[0].length));

    if (out[1] !== undefined)
      return { type: 'Punctuation', value: out[1] };
    else if (out[2] !== undefined)
      return { type: 'Type', value: out[2] };
    else if (out[3] !== undefined)
      return { type: 'Keyword', value: out[3] };
    else if (out[4] !== undefined)
      return { type: 'Literal', value: out[4] };
    else if (out[5] !== undefined)
      return { type: 'Identifier', value: out[5] };

    // Comment - loop
  }
};

Lexer.prototype.end = function end() {
  return this.re.lastIndex >= this.length;
};
