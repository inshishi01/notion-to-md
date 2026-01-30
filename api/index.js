const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pageId, token } = req.body;
  if (!pageId || !token) {
    return res.status(400).json({ error: 'Missing pageId or token' });
  }

  try {
    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // 可选：自定义 transformer 让输出更适合 Wiki.js
    n2m.setCustomTransformer('callout', async (block) => {
      return `> [!NOTE]\n> ${block.callout.rich_text.map(t => t.plain_text).join('')}`;
    });

    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const markdown = n2m.toMarkdownString(mdBlocks);

    res.json({ markdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
