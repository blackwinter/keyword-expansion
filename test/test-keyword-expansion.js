let ke = require("./keyword-expansion"), testExpandUrl = function(name, array) {
  let test = "test keyword-expansion " + name;

  exports[test] = function(assert) {
    let doit = function(url, text, turl, res1, res2) {
      assert.strictEqual(ke.expandUrl(url, text, turl), res1, test + "#expandUrl");
      assert.strictEqual(ke.isExpandableUrl(url), res2, test + "#isExpandableUrl");
    };

    array.forEach(function(i) {
      doit.apply(this, i);

      if (/%s/i.test(i[0])) {
        i[0] = i[0].replace(/%s/g, "%{ke:selection}");
        i[0] = i[0].replace(/%S/g, "%{ke:selection:escape=false}");

        doit.apply(this, i);
      }
    });
  }
};

testExpandUrl("plain", [
  ["http://example.com/",            "test", null, "http://example.com/",            false],
  ["http://example.com/foo?bar=baz", "test", null, "http://example.com/foo?bar=baz", false],

  ["http://example.com/",            null,   null, "http://example.com/",            false],
  ["http://example.com/foo?bar=baz", null,   null, "http://example.com/foo?bar=baz", false]
]);

testExpandUrl("selection simple", [
  ["http://example.com/%s",         "test", null, "http://example.com/test",         true],
  ["http://example.com/%S",         "test", null, "http://example.com/test",         true],

  ["http://example.com/foo?bar=%s", "test", null, "http://example.com/foo?bar=test", true],
  ["http://example.com/foo?bar=%S", "test", null, "http://example.com/foo?bar=test", true],
]);

testExpandUrl("selection simple whitespace", [
  ["http://example.com/%s",         "  test ", null, "http://example.com/test",         true],
  ["http://example.com/%S",         "  test ", null, "http://example.com/test",         true],

  ["http://example.com/foo?bar=%s", "  test ", null, "http://example.com/foo?bar=test", true],
  ["http://example.com/foo?bar=%S", "  test ", null, "http://example.com/foo?bar=test", true],
]);

testExpandUrl("selection special", [
  ["http://example.com/%s",         "te:t", null, "http://example.com/te%3At",         true],
  ["http://example.com/%S",         "te:t", null, "http://example.com/te:t",           true],

  ["http://example.com/foo?bar=%s", "te:t", null, "http://example.com/foo?bar=te%3At", true],
  ["http://example.com/foo?bar=%S", "te:t", null, "http://example.com/foo?bar=te:t",   true],
]);

testExpandUrl("selection special whitespace", [
  ["http://example.com/%s",         " t  e:t", null, "http://example.com/t%20e%3At",         true],
  ["http://example.com/%S",         " t  e:t", null, "http://example.com/t e:t",             true],

  ["http://example.com/foo?bar=%s", " t  e:t", null, "http://example.com/foo?bar=t%20e%3At", true],
  ["http://example.com/foo?bar=%S", " t  e:t", null, "http://example.com/foo?bar=t e:t",     true],
]);

testExpandUrl("no selection fallback default", [
  ["http://example.com/%s",         null, null, "http://example.com", true],
  ["http://example.com/%S",         null, null, "http://example.com", true],

  ["http://example.com/foo?bar=%s", null, null, "http://example.com", true],
  ["http://example.com/foo?bar=%S", null, null, "http://example.com", true],
]);

testExpandUrl("no selection fallback origin", [
  ["http://example.com/%{ke:selection:fallback=origin}",                      null, null, "http://example.com", true],
  ["http://example.com/%{ke:selection:escape=false,fallback=origin}",         null, null, "http://example.com", true],

  ["http://example.com/foo?bar=%{ke:selection:fallback=origin}",              null, null, "http://example.com", true],
  ["http://example.com/foo?bar=%{ke:selection:escape=false,fallback=origin}", null, null, "http://example.com", true],
]);

testExpandUrl("no selection fallback path", [
  ["http://example.com/%{ke:selection:fallback=path}",                      null, null, "http://example.com/", true],
  ["http://example.com/%{ke:selection:escape=false,fallback=path}",         null, null, "http://example.com/", true],

  ["http://example.com/foo?bar=%{ke:selection:fallback=path}",              null, null, "http://example.com/foo", true],
  ["http://example.com/foo?bar=%{ke:selection:escape=false,fallback=path}", null, null, "http://example.com/foo", true],
]);

testExpandUrl("no selection fallback directory", [
  ["http://example.com/%{ke:selection:fallback=directory}",                          null, null, "http://example.com/", true],
  ["http://example.com/%{ke:selection:escape=false,fallback=directory}",             null, null, "http://example.com/", true],

  ["http://example.com/foo?bar=%{ke:selection:fallback=directory}",                  null, null, "http://example.com/", true],
  ["http://example.com/foo?bar=%{ke:selection:escape=false,fallback=directory}",     null, null, "http://example.com/", true],

  ["http://example.com/foo/bar?baz=%{ke:selection:fallback=directory}",              null, null, "http://example.com/foo/", true],
  ["http://example.com/foo/bar?baz=%{ke:selection:escape=false,fallback=directory}", null, null, "http://example.com/foo/", true],
]);

let e = encodeURIComponent, t = {
  "hostname": "example.dev",
  "dirname":  "/foo/",
  "search":   "?baz=42"
};

t.host     = t.hostname + ":2323";
t.origin   = "http://" + t.host;
t.pathname = t.dirname + "bar";
t.href     = t.origin + t.pathname + t.search;

testExpandUrl("location", [
  ["http://example.com/%{ke:location}",                      null, t.href, "http://example.com/" + e(t.href),      true],
  ["http://example.com/%{ke:location:escape=false}",         null, t.href, "http://example.com/" + t.href,         true],

  ["http://example.com/foo?bar=%{ke:location}",              null, t.href, "http://example.com/foo?bar=" + e(t.href), true],
  ["http://example.com/foo?bar=%{ke:location:escape=false}", null, t.href, "http://example.com/foo?bar=" + t.href,    true],
]);

testExpandUrl("origin", [
  ["http://example.com/%{ke:origin}",                      null, t.href, "http://example.com/" + e(t.origin), true],
  ["http://example.com/%{ke:origin:escape=false}",         null, t.href, "http://example.com/" + t.origin,    true],

  ["http://example.com/foo?bar=%{ke:origin}",              null, t.href, "http://example.com/foo?bar=" + e(t.origin), true],
  ["http://example.com/foo?bar=%{ke:origin:escape=false}", null, t.href, "http://example.com/foo?bar=" + t.origin,    true],
]);

testExpandUrl("domain", [
  ["http://example.com/%{ke:domain}",                      null, t.href, "http://example.com/" + e(t.hostname), true],
  ["http://example.com/%{ke:domain:escape=false}",         null, t.href, "http://example.com/" + t.hostname,    true],

  ["http://example.com/foo?bar=%{ke:domain}",              null, t.href, "http://example.com/foo?bar=" + e(t.hostname), true],
  ["http://example.com/foo?bar=%{ke:domain:escape=false}", null, t.href, "http://example.com/foo?bar=" + t.hostname,    true],
]);

testExpandUrl("host", [
  ["http://example.com/%{ke:host}",                      null, t.href, "http://example.com/" + e(t.host), true],
  ["http://example.com/%{ke:host:escape=false}",         null, t.href, "http://example.com/" + t.host,    true],

  ["http://example.com/foo?bar=%{ke:host}",              null, t.href, "http://example.com/foo?bar=" + e(t.host), true],
  ["http://example.com/foo?bar=%{ke:host:escape=false}", null, t.href, "http://example.com/foo?bar=" + t.host,    true],
]);

testExpandUrl("path", [
  ["http://example.com/%{ke:path}",                      null, t.href, "http://example.com/" + e(t.pathname), true],
  ["http://example.com/%{ke:path:escape=false}",         null, t.href, "http://example.com/" + t.pathname,    true],

  ["http://example.com/foo?bar=%{ke:path}",              null, t.href, "http://example.com/foo?bar=" + e(t.pathname), true],
  ["http://example.com/foo?bar=%{ke:path:escape=false}", null, t.href, "http://example.com/foo?bar=" + t.pathname,    true],
]);

testExpandUrl("query", [
  ["http://example.com/%{ke:query}",                      null, t.href, "http://example.com/" + e(t.search), true],
  ["http://example.com/%{ke:query:escape=false}",         null, t.href, "http://example.com/" + t.search,    true],

  ["http://example.com/foo?bar=%{ke:query}",              null, t.href, "http://example.com/foo?bar=" + e(t.search), true],
  ["http://example.com/foo?bar=%{ke:query:escape=false}", null, t.href, "http://example.com/foo?bar=" + t.search,    true],
]);

testExpandUrl("directory", [
  ["http://example.com/%{ke:directory}",                      null, t.href, "http://example.com/" + e(t.dirname), true],
  ["http://example.com/%{ke:directory:escape=false}",         null, t.href, "http://example.com/" + t.dirname,    true],

  ["http://example.com/foo?bar=%{ke:directory}",              null, t.href, "http://example.com/foo?bar=" + e(t.dirname), true],
  ["http://example.com/foo?bar=%{ke:directory:escape=false}", null, t.href, "http://example.com/foo?bar=" + t.dirname,    true],
]);

require("sdk/test").run(exports);
