const imports = require('./charlotte');

test('newlinesToHTMLBreaks', () => {
    expect(imports.newlinesToHTMLBreaks('I love my dog\nI love my cat')).toBe('I love my dog<br/>I love my cat<br/>');
});