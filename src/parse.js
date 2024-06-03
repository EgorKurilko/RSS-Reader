const parse = (xmlString) => {
    const feed = {};
    const posts = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    const errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
        // const titleError = errorNode.querySelector('h3').textContent;
        // const bodyError = errorNode.querySelector('div').textContent;
        // const error = `${titleError} "${bodyError}"`;

        const error = new Error(errorNode.textContent);
        error.isParsingError = true;
        console.log('parse ERR 12', error);
        throw error;        
        // throw new Error('messages.invalidFeed');
        // throw new Error(error.isParsingError);
    } else {
        const parent = xmlDoc.querySelector('channel');
        const titleFeed = parent.querySelector('title').textContent;
        const descriptionFeed = parent.querySelector('description').textContent;

        feed.titleFeed = titleFeed;
        feed.descriptionFeed = descriptionFeed;

        const items = parent.querySelectorAll('item');
        [...items].map((item) => {
            const titlePost = item.querySelector('title').textContent;
            const linkPost = item.querySelector('link').textContent;
            const descriptionPost = item.querySelector('description').textContent;
            posts.push({ titlePost, linkPost, descriptionPost });
        })
    return { feed, posts };
    };
    // return { feed, posts };
};
export default parse;
