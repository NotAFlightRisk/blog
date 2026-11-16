import Feedbin from '../icons/feedbin.svg';
import Feedly from '../icons/feedly.svg';
import Inoreader from '../icons/inoreader.svg';
import NewsBlur from '../icons/newsblur.svg';
import { site } from '../site';
import { absolute } from './posts';

const feed = absolute(site.feed);
const query = (params: Record<string, string>) => new URLSearchParams(params);

// the hosted readers that'll follow a feed straight from a link
export const readers = [
  {
    name: 'Feedly',
    Icon: Feedly,
    href: `https://feedly.com/i/subscription/${encodeURIComponent(`feed/${feed}`)}`,
  },
  {
    name: 'Inoreader',
    Icon: Inoreader,
    href: `https://www.inoreader.com/?${query({ add_feed: feed })}`,
  },
  { name: 'NewsBlur', Icon: NewsBlur, href: `https://www.newsblur.com/?${query({ url: feed })}` },
  { name: 'Feedbin', Icon: Feedbin, href: `https://feedbin.com/?${query({ subscribe: feed })}` },
];
