type Ranked = { id: string; data: { date: Date; tags: string[] } };

// posts come in newest first, so the one before is the newer one
export function neighbours<T extends Ranked>(post: T, posts: T[]) {
  const at = posts.findIndex(({ id }) => id === post.id);
  return { newer: posts[at - 1], older: posts[at + 1] };
}

// most tags in common wins, and a tie goes to whichever was written closest in time
export function related<T extends Ranked>(post: T, posts: T[], count = 3) {
  const shared = (other: T) => other.data.tags.filter((tag) => post.data.tags.includes(tag)).length;
  const apart = (other: T) => Math.abs(other.data.date.valueOf() - post.data.date.valueOf());
  return posts
    .filter((other) => other.id !== post.id && shared(other) > 0)
    .sort((a, b) => shared(b) - shared(a) || apart(a) - apart(b))
    .slice(0, count);
}
