# Keyword Expansion

Firefox add-on to expand keywords in bookmark URLs. Modern alternative to [KeywordSelection](http://dragtotab.mozdev.org/keywordselection/).


## Usage

Placeholder | Replacement
------------|-------------------------------------------
`%s`        | The currently selected text (escaped)
`%S`        | The currently selected text (unescaped)
`%l`        | The current tab's location URL (escaped)
`%L`        | The current tab's location URL (unescaped)

If no text is selected, bookmarks with `%s`/`%S` load the site's homepage.


## Examples

Bookmark                                 | Selection/Location | Result
-----------------------------------------|--------------------|------------------------------------
https://google.com/search?q=%s           | keyword            | https://google.com/search?q=keyword
https://google.com/search?q=%s           |                    | https://google.com
http://validator.w3.org/checklink?uri=%l | http://example.com | http://validator.w3.org/checklink?uri=http%3A%2F%2Fexample.com


## Links

* Download:    https://blackwinter.de/addons/keyword-expansion.xpi
* Source code: https://github.com/blackwinter/keyword-expansion

## Authors

* [Jens Wille](mailto:jens.wille@gmail.com)


## License and Copyright

Copyright (C) 2015 Jens Wille

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
