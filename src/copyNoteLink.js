// SPDX-FileCopyrightText: 2023-2024 windingwind, garth74
// SPDX-FileCopyrightText: 2025-2026 Advanced Additive Manufacturing Systems Laboratory, Sungkyunkwan University
// SPDX-License-Identifier: AGPL-3.0-or-later
// @author windingwind, garth74, mirinae3145
// @link https://github.com/lee-lab-skku/zotero-link-actions
// @see https://github.com/windingwind/zotero-actions-tags/discussions/115

const Zotero = require('Zotero');

const sink = Zotero.ActionLinkBridge?.capture('copyNoteLink', item, items, collection,
    typeof triggerType === 'undefined' ? null : triggerType);

try {

    function fail(code, message) {
        if (sink) {
            sink.fail(code, message);
            return;
        }
        return message;
    }

    if (!item)
        return;

    if (!item.isNote())
        return fail('INVALID_ITEM_TYPE', "The selected item is not a note.");
    if (typeof Zotero.BetterNotes?.api?.convert?.note2link !== 'function')
        return fail('BETTER_NOTES_UNAVAILABLE', "Better Notes plugin is not detected.");

    const uri = await Zotero.BetterNotes.api.convert.note2link(item);
    const top = Zotero.Items.getTopLevel([item])[0];
    const citationKey = top.isRegularItem() && top.getField('citationKey');
    const label = `${item.getField('title') || item.key}${citationKey ? ` (${citationKey})` : ''}`;
    const escapeHTML = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    if (sink) {
        sink.complete([{ uri, label, html: `<a href="${escapeHTML(uri)}">${escapeHTML(label)}</a>` }]);
        return;
    }
    const clipboard = new Zotero.ActionsTags.api.utils.ClipboardHelper();
    clipboard.addText(uri, "text/unicode");
    clipboard.addText(`<a href="${escapeHTML(uri)}">${escapeHTML(label)}</a>`, "text/html");
    clipboard.copy();

    return "Copied Better Notes link to clipboard.";

} catch (error) {
    if (!sink)
        throw error;
    sink.fail('ACTION_FAILED', error.message || String(error));
}
