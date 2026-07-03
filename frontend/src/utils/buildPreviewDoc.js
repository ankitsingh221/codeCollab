export const buildPreviewDoc = (files) => {
  const htmlFile = files.find((f) => f.language === 'html');
  const cssFiles = files.filter((f) => f.language === 'css');
  const jsFiles = files.filter((f) => f.language === 'javascript');

  const cssContent = cssFiles.map((f) => f.content).join('\n');
  const jsContent = jsFiles.map((f) => f.content).join('\n');

  const baseHtml = htmlFile?.content || '<!DOCTYPE html><html><head></head><body></body></html>';

  // Inject CSS into <head> and JS before </body> so preview always reflects latest saved state
  let doc = baseHtml;

  if (cssContent) {
    const styleTag = `<style>\n${cssContent}\n</style>`;
    doc = doc.includes('</head>')
      ? doc.replace('</head>', `${styleTag}\n</head>`)
      : `${styleTag}\n${doc}`;
  }

  if (jsContent) {
    const scriptTag = `<script>\n${jsContent}\n</script>`;
    doc = doc.includes('</body>')
      ? doc.replace('</body>', `${scriptTag}\n</body>`)
      : `${doc}\n${scriptTag}`;
  }

  return doc;
};