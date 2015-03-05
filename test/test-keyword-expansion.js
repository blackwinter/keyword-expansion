let ke = require("./keyword-expansion"), testExpandUrl = function(name, array) {
  exports["test keyword-expansion expandUrl " + name] = function(assert) {
    array.forEach(function(i) {
      assert.strictEqual(ke.expandUrl(i[0], i[1]), i[2]);
      assert.strictEqual(ke.isExpandableUrl(i[0]), i[3]);
    });
  }
};

testExpandUrl("plain", [
  ["http://example.com/",            "test", "http://example.com/",            false],
  ["http://example.com/foo?bar=baz", "test", "http://example.com/foo?bar=baz", false],

  ["http://example.com/",            null,   "http://example.com",             false],
  ["http://example.com/foo?bar=baz", null,   "http://example.com",             false]
]);

testExpandUrl("selection simple", [
  ["http://example.com/%s",         "test", "http://example.com/test",         true],
  ["http://example.com/%S",         "test", "http://example.com/test",         true],

  ["http://example.com/foo?bar=%s", "test", "http://example.com/foo?bar=test", true],
  ["http://example.com/foo?bar=%S", "test", "http://example.com/foo?bar=test", true],
]);

testExpandUrl("selection simple whitespace", [
  ["http://example.com/%s",         "  test ", "http://example.com/test",         true],
  ["http://example.com/%S",         "  test ", "http://example.com/test",         true],

  ["http://example.com/foo?bar=%s", "  test ", "http://example.com/foo?bar=test", true],
  ["http://example.com/foo?bar=%S", "  test ", "http://example.com/foo?bar=test", true],
]);

testExpandUrl("selection special", [
  ["http://example.com/%s",         "te:t", "http://example.com/te%3At",         true],
  ["http://example.com/%S",         "te:t", "http://example.com/te:t",           true],

  ["http://example.com/foo?bar=%s", "te:t", "http://example.com/foo?bar=te%3At", true],
  ["http://example.com/foo?bar=%S", "te:t", "http://example.com/foo?bar=te:t",   true],
]);

testExpandUrl("selection special whitespace", [
  ["http://example.com/%s",         " t  e:t", "http://example.com/t%20e%3At",         true],
  ["http://example.com/%S",         " t  e:t", "http://example.com/t e:t",             true],

  ["http://example.com/foo?bar=%s", " t  e:t", "http://example.com/foo?bar=t%20e%3At", true],
  ["http://example.com/foo?bar=%S", " t  e:t", "http://example.com/foo?bar=t e:t",     true],
]);

testExpandUrl("no selection", [
  ["http://example.com/%s",         null, "http://example.com", true],
  ["http://example.com/%S",         null, "http://example.com", true],

  ["http://example.com/foo?bar=%s", null, "http://example.com", true],
  ["http://example.com/foo?bar=%S", null, "http://example.com", true],
]);

testExpandUrl("location", [
  ["http://example.com/%l",         null, "http://example.com/about%3Ablank",         true],
  ["http://example.com/%L",         null, "http://example.com/about:blank",           true],

  ["http://example.com/foo?bar=%l", null, "http://example.com/foo?bar=about%3Ablank", true],
  ["http://example.com/foo?bar=%L", null, "http://example.com/foo?bar=about:blank",   true],
]);

require("sdk/test").run(exports);
