/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let url   = require("sdk/url"),
    tabs  = require("sdk/tabs"),
    prefs = require("sdk/simple-prefs");

let KeywordExpansion = {

  /***************************************************************************/
  /* settings                                                                */
  /***************************************************************************/

  defaultOptions: { escape: true, fallback: "origin" },

  patterns: { main: "%\\{ke:([a-z]+)(:[a-z=,]+)?\\}", compat: "%([sS])" },

  /***************************************************************************/
  /* external methods                                                        */
  /***************************************************************************/

  pattern: function(enableCompat = prefs.prefs.enableCompat) {
    let pattern = this.patterns.main;

    if (enableCompat) {
      pattern += "|" + this.patterns.compat;
    }

    return new RegExp(pattern, 'g');
  },

  expandUrl: function(aUrl, aText, aLoc) {
    let ret = function(value) { ret.value = value; }, res = aUrl.replace(
      this.pattern(), this.replaceDirective(aUrl, aText, aLoc, ret));

    return ret.value || res;
  },

  isExpandableUrl: function(aUrl) {
    return this.pattern().test(aUrl);
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
      return this[backup].apply(this, callback.apply(this, arguments));
    };
  },

  /***************************************************************************/
  /* internal methods                                                        */
  /***************************************************************************/

  parseOptions: function(options) {
    let optionsHash = Object.create(this.defaultOptions);

    if (options) {
      options.substr(1).split(",").forEach(function(i) {
        let o = i.split("=");
        optionsHash[o[0]] = o[1] || true;
      });
    }

    return optionsHash;
  },

  replaceDirective: function(aUrl, aText, aLoc, ret) {
    let tab = url.URL(aLoc || tabs.activeTab.url), ke = this,
        log = function(msg) { console.log(msg + " in " + aUrl); },
        dir = function(arg) { return arg.pathname.replace(/[^\/]+$/, ""); };

    return function(match, directive, options, compat) {
      if (ret.value) {
        return;
      }

      let opt = ke.parseOptions(options), res = function(value) {
        res.value = opt.escape.toString() === "false" ?
          value : encodeURIComponent(value);
      };

      if (compat) {
        directive = "selection";
        opt.escape = compat === "s";
      }

      switch (directive) {
        case "selection":
          aText ? res(aText.trim().replace(/\s+/g, " ")) :
            ke.selectionFallback(aUrl, opt.fallback, dir, ret);

          break;
        case "location":
          res(tab.href);
          break;
        case "origin":
          res(tab.origin);
          break;
        case "domain":
          res(tab.hostname);
          break;
        case "host":
          /* Does not include port in Firefox 36.0.1, contrary to documentation
             https://developer.mozilla.org/en-US/docs/Web/API/URLUtils/host */

          let host = tab.host, port = tab.port;

          if (port !== "" && host.indexOf(':') === -1) {
            host += ":" + port;
          }

          res(host);
          break;
        case "path":
          res(tab.pathname);
          break;
        case "query":
          res(tab.search);
          break;
        case "directory":
          res(dir(tab));
          break;
        default:
          log("Invalid directive `" + directive + "'");
          break;
      }

      return res.value || "";
    };
  },

  selectionFallback: function(aUrl, fallback, dir, ret) {
    let oUrl = url.URL(aUrl.replace(this.pattern(), ""));

    switch (fallback) {
      case "origin":
        ret(oUrl.origin);
        break;
      case "path":
        ret(oUrl.origin + oUrl.pathname);
        break;
      case "directory":
        ret(oUrl.origin + dir(oUrl));
        break;
      default:
        log("Invalid fallback option `" + fallback + "'");
        break;
    }
  }

};

Object.keys(KeywordExpansion).forEach(function(i) {
  exports[i] = KeywordExpansion[i];
});
