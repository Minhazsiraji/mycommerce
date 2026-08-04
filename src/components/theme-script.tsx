/**
 * Applies the saved theme before the browser paints.
 *
 * This has to be a blocking inline script in <head>. The pages are static and
 * cached, so the HTML is identical for every visitor — the choice only exists
 * in localStorage on their device. Anything that runs after hydration would
 * show a flash of the wrong theme on every single page load.
 *
 * Absence of the attribute means "follow the system", which the CSS handles.
 * The try/catch matters: localStorage throws outright in some privacy modes,
 * and an exception here would block the rest of the document.
 */
const script = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
