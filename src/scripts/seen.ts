// not in TypeScript's DOM types yet
declare global {
  interface Document {
    prerendering?: boolean;
  }
}

// a page Chrome got ready ahead of a click might never be seen, so counters wait until it is
export function loadWhenSeen(src: string, data: Record<string, string> = {}) {
  return new Promise<void>((resolve) => {
    const load = () => {
      const script = Object.assign(document.createElement('script'), { src });
      Object.assign(script.dataset, data);
      script.onload = () => resolve();
      document.head.append(script);
    };
    if (!document.prerendering) return load();
    document.addEventListener('prerenderingchange', load, { once: true });
  });
}
