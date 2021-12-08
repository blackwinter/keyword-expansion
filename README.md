# Keyword Expansion

Firefox [web extension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) to expand keywords in bookmark URLs. Modern alternative to [KeywordSelection](http://dragtotab.mozdev.org/keywordselection/).


## Usage

Embed directives of the form `$[ke:<keyword>[:<options>]]` in your bookmark URLs.

### Keywords

Possible keywords are:

Keyword     | Replacement
------------|------------
`selection` | The currently selected text (if no text is selected, the fallback option applies)
`location`  | The current tab's location URL
`origin`    | The current tab's [origin](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/origin)
`domain`    | The current tab's [domain](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/hostname)
`host`      | The current tab's [host](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/host)
`path`      | The current tab's [path](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/pathname)
`query`     | The current tab's [query](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/search)
`directory` | The current tab's path without the last component

### Options

Options are of the form `<option>[=<value>]`, where `<value>` defaults to `true`. Multiple options are separated by `,`.

Option     | Description
-----------|------------
`escape`   | Whether the replacement value should be [encoded as a URI component](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) (**default**, specify `escape=false` if you need the unescaped value)
`fallback` | Which page to load if no text is selected (only applies to the `selection` keyword); possible values are: [`origin`](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/origin) (the site's homepage, **default**), `path` (the URL without the query parameters), `directory` (the path without the last component), `basedir` (the path's first component only)

### Keyword searches compatibility

The following directives are supported for compatibility with [keyword searches](http://kb.mozillazine.org/Using_keyword_searches). Options are not allowed.

Directive | Equivalent
----------|-------------------------------------------
`%s`      | `$[ke:selection]`
`%S`      | `$[ke:selection:escape=false]`


## Examples

Bookmark                                                        | Selection/Location         | Result
----------------------------------------------------------------|----------------------------|-------
https://google.com/search?q=$[ke:selection]                     | keyword selection          | https://google.com/search?q=keyword%20selection
https://google.com/search?q=$[ke:selection:escape=false]        | keyword selection          | https://google.com/search?q=keyword selection
https://google.com/search?q=$[ke:selection]                     |                            | https://google.com
https://google.com/search?q=$[ke:selection:fallback=path]       |                            | https://google.com/search
https://google.com/search?q=%s                                  | keyword selection          | https://google.com/search?q=keyword%20selection
https://google.com/search?q=%S                                  | keyword selection          | https://google.com/search?q=keyword selection
https://google.com/search?q=%s                                  |                            | https://google.com
http://validator.w3.org/checklink?uri=$[ke:location]            | http://example.com/foo/bar | http://validator.w3.org/checklink?uri=http%3A%2F%2Fexample.com%2Ffoo%2Fbar
http://validator.w3.org/checklink?uri=$[ke:origin]              | http://example.com/foo/bar | http://validator.w3.org/checklink?uri=http%3A%2F%2Fexample.com
`$[ke:origin:escape=false]/robots.txt`                          | http://example.com/foo/bar | http://example.com/robots.txt
https://www.ssllabs.com/ssltest/analyze.html?d=$[ke:domain]     | http://example.com/foo/bar | https://www.ssllabs.com/ssltest/analyze.html?d=example.com
http://example2.com$[ke:path:escape=false]                      | http://example.com/foo/bar | http://example2.com/foo/bar
`$[ke:origin:escape=false]$[ke:directory:escape=false]`         | http://example.com/foo/bar | http://example.com/foo/
`$[ke:origin:escape=false]$[ke:directory:escape=false]`         | http://example.com/foo     | http://example.com/


## Installation

Open [keyword-expansion.xpi](https://blackwinter.de/addons/keyword-expansion.xpi) in Firefox.


## Versioning

This project adheres to the [Semantic Versioning Specification](http://semver.org/).


## Links

* Download:    https://blackwinter.de/addons/keyword-expansion.xpi
* Source code: https://github.com/blackwinter/keyword-expansion

## Authors

* [Jens Wille](mailto:jens.wille@gmail.com)


## License and Copyright

Copyright (C) 2015-2021 Jens Wille

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
