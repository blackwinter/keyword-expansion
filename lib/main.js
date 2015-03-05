/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Cu } = require("chrome");
Cu.import("resource:///modules/PlacesUIUtils.jsm");

let ke = require("./keyword-expansion"),
    selection = require("sdk/selection");

//require("./test-bookmarks").create();

try {
  ke.replaceFunction(PlacesUIUtils, "_openNodeIn", function() {
    let aNode = arguments[0], aWindow = arguments[2];

    ke.wrapExpandUrl(aNode, function(expandUrl) {
      ke.replaceFunction(aWindow, "openUILinkIn", function() {
        arguments[0] = expandUrl(arguments[0], selection.text);
        return arguments;
      });
    });

    return arguments;
  });
}
catch (e) {
  console.error(e);
}
