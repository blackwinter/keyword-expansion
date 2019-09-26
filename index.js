/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Ci } = require("chrome");
let events = require("sdk/system/events");

let listener = require("./lib/keyword-expansion").httpRequestListener(events,
  function(subject) { return subject.QueryInterface(Ci.nsIHttpChannel).URI; });

exports.main     = listener.on;
exports.onUnload = listener.off;
