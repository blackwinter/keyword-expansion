/* This Source Code Form is subject to the terms of the Mozilla Public
   License, v. 2.0. If a copy of the MPL was not distributed with this
   file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function getDocumentSelection(contentDocument) {
  let selection = contentDocument.getSelection().toString();
  if (selection.length === 0) {
    let node = contentDocument.activeElement;
    if (node !== undefined) {
      if (node.contentDocument !== undefined) {
        selection = getDocumentSelection(node.contentDocument);
      }
      else if (node.value !== undefined) {
        if (node.selectionStart !== undefined && node.selectionEnd !== undefined) {
          selection = node.value.substring(node.selectionStart, node.selectionEnd);
        }
      }
    }
  }

  return selection;
}

browser.runtime.onMessage.addListener(function(_, _, sendResponse) {
  sendResponse({ selection: getDocumentSelection(document) });
});
