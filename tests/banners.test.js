const test = require('node:test');
const assert = require('node:assert');
const B = require('../public/js/banners.js');

const ok = { headline: 'Big Sale', offer: '50% off', cta: 'Shop', color: '#0a5cff' };

test('valid input has no errors', () => assert.deepStrictEqual(B.validate(ok).errors, []));
test('missing headline is an error', () => assert.ok(B.validate({ ...ok, headline: '' }).errors.length > 0));
test('too long headline is an error', () => assert.ok(B.validate({ ...ok, headline: 'x'.repeat(41) }).errors.length > 0));
test('color outside palette is an error', () => assert.ok(B.validate({ ...ok, color: '#ff00ff' }).errors.length > 0));
test('contrast black vs white is 21', () => assert.strictEqual(Math.round(B.contrast('#000000', '#ffffff')), 21));
test('four standard ad sizes exist', () => assert.deepStrictEqual(B.SIZES.map((s) => s.id), ['300x250', '728x90', '160x600', '320x50']));
test('HTML export escapes input', () => assert.ok(!B.toHTML({ ...ok, headline: '<script>' }, B.SIZES[0]).includes('<script>')));
