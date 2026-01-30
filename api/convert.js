// api/convert.js
const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { pageId, token } = req.body || {};

  if (!pageId || !token) {
    return res.status(400).json({ error: 'Missing pageId or token' });
  }

  try {
    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // 可选：加 Wiki.js 友好转换（Callout 等）
    // n2m.setCustomTransformer('callout', ... 如之前示例);

    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const markdown = n2m.toMarkdownString(mdBlocks);

    return res.status(200).json({ markdown });
  } catch (error) {
    console.error(error);  // Vercel Logs 会看到
    return res.status(500).json({ error: error.message || 'Conversion failed' });
  }
};
