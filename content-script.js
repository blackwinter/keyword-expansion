/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

browser.runtime.onMessage.addListener(function(_, _, sendResponse) {
  let selection = window.getSelection().toString();
  if (selection.length === 0) {
    let node = document.activeElement;
    if (node !== undefined && node.value !== undefined) {
      if (node.selectionStart !== undefined && node.selectionEnd !== undefined) {
        selection = node.value.substring(node.selectionStart, node.selectionEnd);
      }
    }
  }

  sendResponse({ selection: selection });
});
