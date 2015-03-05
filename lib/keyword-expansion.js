/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let url = require("sdk/url"), tabs = require("sdk/tabs"), KeywordExpansion = {

  expandUrl: function(aUrl, aText) {
    if (/%l/i.test(aUrl)) {
      let loc = tabs.activeTab.url;

      // %{location}
      // %{location:unescaped}
      aUrl = aUrl.replace(/%l/g, encodeURIComponent(loc));
      aUrl = aUrl.replace(/%L/g, loc);
    }
    else if (aText) {
      aText = aText.replace(/^\s*/, "");
      aText = aText.replace(/\s*$/, "");
      aText = aText.replace(/\s+/g, " ");

      // %{selection}
      // %{selection:unescaped}
      aUrl = aUrl.replace(/%s/g, encodeURIComponent(aText));
      aUrl = aUrl.replace(/%S/g, aText);
    }
    else {
      aUrl = url.URL(aUrl).origin;
    }

    return aUrl;
  },

  isExpandableUrl: function(aUrl) {
    return /%[sl]/i.test(aUrl);
  },

  wrapExpandUrl: function(aNode, callback) {
    let currentUrl = aNode.uri, ke = this;

    if (this.isExpandableUrl(currentUrl)) {
      callback(function(aUrl, aText) {
        return aUrl === currentUrl ? ke.expandUrl(aUrl, aText) : aUrl;
      });
    }
  },

  replaceFunction: function(object, name, callback) {
    let backup = name + "KeywordExpansionOriginal";

    if (typeof object[backup] === "undefined") {
      object[backup] = object[name];
    }

    object[name] = function() {
      return object[backup].apply(this, callback.apply(this, arguments));
    };
  }

};

exports.expandUrl       = KeywordExpansion.expandUrl;
exports.isExpandableUrl = KeywordExpansion.isExpandableUrl;
exports.wrapExpandUrl   = KeywordExpansion.wrapExpandUrl;
exports.replaceFunction = KeywordExpansion.replaceFunction;
