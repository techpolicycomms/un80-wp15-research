/** Parse RSS 2.0 and Atom feeds; fetch with resilient error handling */

const UA = "un80-wp15-research/0.2 (public secondary monitor)";

export async function fetchFeed(url, { timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
      redirect: "follow",
      signal: controller.signal,
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body, url };
  } catch (err) {
    return { ok: false, status: 0, body: "", url, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .trim();
}

function pickTag(block, tags) {
  for (const tag of tags) {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    if (m) return decodeEntities(m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  }
  return "";
}

function pickLink(block) {
  const atom = block.match(/<link[^>]+href="([^"]+)"/i);
  if (atom) return atom[1];
  const rss = block.match(/<link>([^<]+)<\/link>/i);
  if (rss) return rss[1].trim();
  const guid = block.match(/<guid[^>]*>([^<]+)<\/guid>/i);
  return guid ? guid[1].trim() : "";
}

function pickDate(block) {
  return (
    pickTag(block, ["published", "updated", "pubDate", "dc:date"]) || ""
  );
}

export function parseFeedItems(xml) {
  const items = [];
  const blocks = [
    ...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi),
    ...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi),
  ];
  for (const m of blocks) {
    const block = m[1];
    const title = pickTag(block, ["title"]);
    const description = pickTag(block, ["description", "summary", "content"]);
    const link = pickLink(block);
    const published = pickDate(block);
    if (title || link) {
      items.push({ title, description, link, published, text: `${title} ${description}` });
    }
  }
  return items;
}

export async function resolveYoutubeChannelId(handle) {
  const url = `https://www.youtube.com/@${handle.replace(/^@/, "")}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/"channelId":"(UC[^"]+)"/);
  return m ? m[1] : null;
}

export function youtubeRssFromChannelId(id) {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;
}

export function youtubeRssFromUser(user) {
  return `https://www.youtube.com/feeds/videos.xml?user=${user}`;
}
