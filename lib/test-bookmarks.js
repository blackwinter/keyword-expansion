/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let TestBookmarks = {

  bookmarks: [
    ["Google",                     "https://google.de"],
    ["Google selection",           "https://google.de/search?hl=en&q=%{ke:selection}"],
    ["Google selection unescaped", "https://google.de/search?hl=en&q=%{ke:selection:escape=false}"],
    ["Google location",            "https://google.de/search?hl=en&q=%{ke:location}"],
    ["Google location unescaped",  "https://google.de/search?hl=en&q=%{ke:location:escape=false}"],
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
