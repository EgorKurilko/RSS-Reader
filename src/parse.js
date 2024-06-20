const parse = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  const errorNode = xmlDoc.querySelector('parsererror');
  if (errorNode) {
    const error = new Error(errorNode.textContent);
    error.isParsingError = true;
    throw error;
  } else {
    const parent = xmlDoc.querySelector('channel');
    const titleFeed = parent.querySelector('title').textContent;
    const descriptionFeed = parent.querySelector('description').textContent;

    const feed = {
      titleFeed,
      descriptionFeed,
    };

    const items = parent.querySelectorAll('item');
    const posts = [...items].map((item) => {
      const titlePost = item.querySelector('title').textContent;
      const linkPost = item.querySelector('link').textContent;
      const descriptionPost = item.querySelector('description').textContent;
      return { titlePost, linkPost, descriptionPost };
    });
    return { feed, posts };
  }
};
export default parse;
