/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let TestBookmarks = {

  bookmarks: [
    ["Google",    "https://google.de"],
    ["Google %s", "https://google.de/search?hl=en&q=%s"],
    ["Google %S", "https://google.de/search?hl=en&q=%S"],
    ["Google %l", "https://google.de/search?hl=en&q=%l"],
    ["Google %L", "https://google.de/search?hl=en&q=%L"],
  ],

  create: function() {
    let { Bookmark, save, TOOLBAR } = require("sdk/places/bookmarks");

    this.bookmarks.forEach(function(i) {
      save(Bookmark({ title: i[0], url: i[1], group: TOOLBAR }));
    });
  }

};

exports.bookmarks = TestBookmarks.bookmarks;
exports.create    = TestBookmarks.create;
