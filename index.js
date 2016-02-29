/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Ci } = require("chrome");

let ke = require("./lib/keyword-expansion"),
    events = require("sdk/system/events");

let listener = ke.httpRequestListener(function(event) {
  return event.subject.QueryInterface(Ci.nsIHttpChannel).URI; });

exports.main = function() {
  events.on(ke.observeTopic, listener);
}

exports.onUnload = function() {
  events.off(ke.observeTopic, listener);
};

//require("./lib/test-bookmarks").create();
