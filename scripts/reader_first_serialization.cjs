/* Preserve the Python-rendered text entity convention on independent pages.
 * Work on a clone: the caller's document and evidence snapshots remain untouched.
 * Raw-text elements must never be HTML-escaped (especially executable scripts).
 */
'use strict';
function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
function serializeBody(body) {
  if (!body || body.nodeType !== 1 || body.localName !== 'body') {
    throw new TypeError('A body element is required');
  }
  const original = body.outerHTML;
  let prefix = 'CTD_READER_SERIALIZED_TEXT_';
  while (original.includes(prefix)) prefix += '_';
  const clone = body.cloneNode(true), values = [];
  const rawText = new Set(['script', 'style', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext']);
  function visit(element) {
    if (rawText.has(element.localName)) return;
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === 3) {
        const id = values.length;
        values.push(escapeText(child.data));
        child.data = prefix + id + '_END';
      } else if (child.nodeType === 1) {
        visit(child);
      }
    }
  }
  visit(clone);
  return clone.outerHTML.replace(new RegExp(prefix + '(\\d+)_END', 'g'), (_, id) => values[Number(id)]);
}
module.exports = {serializeBody, escapeText};
if (require.main === module) {
  const assert = require('node:assert/strict');
  const {parseHTML} = require('linkedom');
  const raw = '<!DOCTYPE html><html lang="en"><head></head><body><main><p>Today&#x27;s &quot;round&quot; &amp; evidence &lt; 3 &gt; 1.</p><pre>&lt;script&gt;not executable&lt;/script&gt;</pre><p>CTD_READER_SERIALIZED_TEXT_0_END</p></main><script>window.example = "O\'Brien < 3 & > 1";</script><style>p::after {content:"a & b"}</style></body></html>';
  const {document} = parseHTML(raw);
  const before = document.body.outerHTML, result = serializeBody(document.body);
  assert.equal(document.body.outerHTML, before, 'Serialization mutated the source DOM');
  assert.ok(result.includes('Today&#x27;s &quot;round&quot; &amp; evidence &lt; 3 &gt; 1.'));
  assert.ok(result.includes('<script>window.example = "O\'Brien < 3 & > 1";</script>'));
  assert.ok(result.includes('<style>p::after {content:"a & b"}</style>'));
  const restored = parseHTML('<html><head></head>' + result + '</html>').document;
  assert.equal(restored.body.textContent, document.body.textContent, 'Visible or raw text changed');
  assert.equal(serializeBody(restored.body), result, 'Serialization is not idempotent');
  assert.equal(restored.querySelectorAll('script').length, 1, 'Escaped code became executable markup');
  assert.throws(() => serializeBody(null), TypeError);
  console.log('READER_SERIALIZATION_TESTS_PASSED: entities, evidence, raw scripts, collisions, idempotence');
}
