/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let KeywordExpansion = {

  /***************************************************************************/
  /* settings                                                                */
  /***************************************************************************/

  patterns: { main: "%\\{ke:([a-z]+)(:[a-z=,]+)?\\}", compat: "%([sS])" },

  defaultOptions: { escape: true, fallback: "origin" },

  enableCompat: true, // TODO: options_ui

  blankUrl: "about:blank",

  activeTab: undefined,

  /***************************************************************************/
  /* external methods                                                        */
  /***************************************************************************/

  pattern: function() {
    let pattern = this.patterns.main;

    if (this.enableCompat) {
      pattern += "|" + this.patterns.compat;
    }

    return new RegExp(pattern, "g");
  },

  expandUrl: function(url, tabUrl, text) {
    let ret = function(value) { ret.value = value; }, res = url.replace(
      this.pattern(), this._replaceDirective(url, tabUrl, text, ret));

    return ret.value || res;
  },

  isExpandableUrl: function(url) {
    return this.pattern().test(url);
  },

  redirectListener: function(browser) {
    let ke = this;

    return function(request) {
      let url = request.url;

      try {
        if (ke.isExpandableUrl(url)) {
          let tabUrl = ke.blankUrl, text, redirect = function() {
            return { redirectUrl: ke.expandUrl(url, tabUrl, text) }; };

          let tabId = ke.activeTab;
          if (tabId === undefined) {
            return redirect();
          }

          return browser.tabs.get(tabId).then(
            function(tab) {
              tabUrl = tab.url;

              return browser.tabs.sendMessage(tabId, {}).then(
                function(res) {
                  text = res.selection.trim().replace(/\s+/g, " ");
                  return redirect();
                },
                function(e) { console.error(e); return redirect(); }
              );
            },
            function(e) { console.error(e); return redirect(); }
          );
        }
      }
      catch (e) {
        console.error(e);
      }

      return; // no redirect
    };
  },

  /***************************************************************************/
  /* internal methods                                                        */
  /***************************************************************************/

  _parseOptions: function(options) {
    let optionsHash = Object.create(this.defaultOptions);

    if (options) {
      options.substr(1).split(",").forEach(function(i) {
        let o = i.split("=");
        optionsHash[o[0]] = o[1] || true;
      });
    }

    return optionsHash;
  },

  _replaceDirective: function(url, tabUrl, text, ret) {
    let tab = new URL(tabUrl), ke = this,
        log = function(msg) { console.log(msg + " in " + url); },
        dir = function(arg) { return arg.pathname.replace(/[^\/]+$/, ""); };

    return function(match, directive, options, compat) {
      if (ret.value) {
        return;
      }

      let opt = ke._parseOptions(options), res = function(value) {
        res.value = opt.escape.toString() === "false" ?
          value : encodeURIComponent(value);
      };

      if (compat) {
        directive = "selection";
        opt.escape = compat === "s";
      }

      switch (directive) {
        case "selection":
          text && text.length > 0 ? res(text) :
            ke._selectionFallback(url, opt.fallback, dir, ret);

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

          if (port !== "" && host.indexOf(":") === -1) {
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

  _selectionFallback: function(url, fallback, dir, ret) {
    url = new URL(url.replace(this.pattern(), ""));

    switch (fallback) {
      case "origin":
        ret(url.origin);
        break;
      case "path":
        ret(url.origin + url.pathname);
        break;
      case "directory":
        ret(url.origin + dir(url));
        break;
      case "basedir":
        ret(url.origin + dir(url).replace(/^(\/[^\/]+\/).*/, "$1"));
        break
      default:
        log("Invalid fallback option `" + fallback + "'");
        break;
    }
  }

};

browser.windows.onCreated.addListener(function(win) {
  for (let tab of win.tabs) {
    if (tab.active) {
      KeywordExpansion.activeTab = tab.id;
      break;
    }
  }
});

browser.tabs.onActivated.addListener(function(tabInfo) {
  let tabId = tabInfo.tabId;

  browser.tabs.get(tabId).then(function(tab) {
    if (tab.url !== KeywordExpansion.blankUrl) {
      KeywordExpansion.activeTab = tabId;
    }
  });
});

browser.webRequest.onBeforeRequest.addListener(
  KeywordExpansion.redirectListener(browser),
  { urls: ["<all_urls>"] }, ["blocking"]
);
