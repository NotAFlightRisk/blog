// every code block gets a copy button, but only once there's a script around to make it work
for (const pre of document.querySelectorAll<HTMLPreElement>('.prose pre.astro-code')) {
  const wrap = Object.assign(document.createElement('div'), { className: 'code-wrap' });
  const button = Object.assign(document.createElement('button'), {
    type: 'button',
    className: 'button copy',
    textContent: 'Copy',
  });
  const say = (label: string) => {
    button.textContent = label;
    button.dataset.copied = '';
    setTimeout(() => {
      button.textContent = 'Copy';
      delete button.dataset.copied;
    }, 2000);
  };

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.textContent ?? '');
      say('Copied');
    } catch {
      // no clipboard access, so select it and let the keyboard do the rest
      getSelection()?.selectAllChildren(pre);
      say('Selected');
    }
  });
  pre.replaceWith(wrap);
  wrap.append(pre, button);
}
