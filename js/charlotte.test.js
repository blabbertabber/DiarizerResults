const imports = require('./charlotte');

test('newlinesToHTMLBreaks', () => {
    expect(imports.newlinesToHTMLBreaks('I love my dog\nI love my cat')).toBe('I love my dog<br/>I love my cat<br/>');
});

test('millisecondsToString', () => {
    expect(imports.millisecondsToString(5000)).toBe(' 5 seconds');
    expect(imports.millisecondsToString(120000)).toBe(' 2 minutes');
    expect(imports.millisecondsToString(125000)).toBe(' 2 minutes 5 seconds');
    expect(imports.millisecondsToString(3725000)).toBe(' 1 hour 2 minutes 5 seconds');
    expect(imports.millisecondsToString(36125000)).toBe(' 10 hours 2 minutes 5 seconds');
});