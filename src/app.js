import './styles.scss';
import uniqueId from 'lodash/uniqueId.js';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import watch from './view.js';
import resources from './locale/index.js';
import parse from './parse.js';


const addProxy = (url) => {
  const urlwithProxy = new URL('https://allorigins.hexlet.app/get');

  urlwithProxy.searchParams.set('disableCache', 'true');
  urlwithProxy.searchParams.set('url', url);
  return urlwithProxy.toString();
};

const uploadRss = ((watchedState, url) => {
  axios.get(addProxy(url))
    .then((response) => {
      const { feed, posts } = parse(response.data.contents);
      feed.id = uniqueId();
      feed.url = url;
      watchedState.feeds.push(feed);
      posts.forEach((post) => {
        post.id = uniqueId();
        post.feedId = feed.id;
      });

      watchedState.posts = [...watchedState.posts, ...posts];
      watchedState.status = 'success';
    })
    .catch((err) => {
      if (err.isAxiosError) {
        watchedState.error = 'messages.networkErr';
      } else if (err.isParsingError) {
        watchedState.error = 'messages.invalidFeed';
      } else {
        watchedState.error = 'messages.defaultErr';
      }
      watchedState.status = 'failed';
    });
});

const updatePosts = (watchedState) => {
  const updatePeriod = 5000;
  const promises = watchedState.feeds
    .filter((feed) => axios.get(addProxy(feed.url))
      .then((response) => {
        const { posts } = parse(response.data.contents);
        const oldLinks = watchedState.posts.map((oldPost) => oldPost.linkPost);
        const newPosts = posts.filter((post) => !oldLinks.includes(post.linkPost));
        newPosts.forEach((post) => {
          post.id = uniqueId();
          post.feedId = feed.id;
        });
        watchedState.posts = [...watchedState.posts, ...newPosts];
      })
      .catch(() => {}));
  Promise.all(promises)
    .then(() => {
      setTimeout(() => {
        updatePosts(watchedState);
      }, updatePeriod);
    });
};

const app = () => {
  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputField: document.querySelector('#url-input'),
    submitEl: document.querySelector('.btn-primary'),
    messagesField: document.querySelector('.feedback'),
    feedsEl: document.querySelector('.feeds'),
    postsEl: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      const state = {
        status: 'filing',
        error: null,
        feeds: [],
        posts: [],
        uiState: {
          actualId: null,
          viewedPosts: [],
        },
      };

      const watchedState = watch(elements, i18n, state);

      yup.setLocale({
        string: {
          url: () => ({ key: 'messages.invalidLink' }),
        },
        mixed: {
          notOneOf: () => ({ key: 'messages.doubleLink' }),
        },
      });

      const initialSchema = yup.string().trim().url().required();

      elements.formEl.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const url = formData.get('url');
        watchedState.status = 'loading';

        const schema = initialSchema.notOneOf(watchedState.feeds.map((feed) => feed.url));
        schema.validate(url, { abortEarly: false })
          .then(() => {
            uploadRss(watchedState, url);
          })
          .catch((err) => {
            watchedState.error = err.message.key;
            watchedState.status = 'failed';
          });
      });

      elements.postsEl.addEventListener('click', (event) => {
        const identifier = event.target.dataset.id;
        if (!identifier || watchedState.uiState.viewedPosts.includes(identifier)) {
          return;
        }
        watchedState.uiState.viewedPosts.push(identifier);
        watchedState.uiState.actualId = identifier;
      });

      updatePosts(watchedState);
    });
};
export default app;
