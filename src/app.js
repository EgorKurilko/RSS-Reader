import './styles.scss';
import * as bootstrap from 'bootstrap';
import uniqueId from 'lodash/uniqueId.js';
import i18next from 'i18next';
import *as yup from 'yup';
import watch from './view.js';
import resources from './locale/index.js';
import axios, { formToJSON } from 'axios';
import parse from './parse.js';

const uploadRss = (watchedState, url) => {

  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
  .then((response) => {
    const { feed, posts } = parse(response.data.contents);

    feed.id = uniqueId();
    feed.url = url;

    watchedState.feeds.push(feed);

    posts.forEach((post) => {
      post.id = uniqueId();
      post.feedId = feed.id;
    })

    watchedState.posts = [...watchedState.posts, ...posts];
    watchedState.status = 'success';
  })
  .catch ((err) => {
    // тестовый код ниже:
    if(err.isAxiosError) {
      console.log('Axios ERR', err.message);
      watchedState.errors = 'messages.networkErr';
      watchedState.status = 'failed';

    } else if(err.isParsingError) {
      console.log('invalidRss ERR', err.message);
      watchedState.errors = 'messages.invalidFeed';
      watchedState.status = 'failed';
    } else {
      watchedState.errors = 'messages.defaultErr';
      watchedState.status = 'failed';
      // throw new Error('messages.defaultErr');
    }
    // рабочий код ниже
    // watchedState.status = 'failed';
    // console.log('uploadRss ERR', err);
    // watchedState.errors = 'messages.networkErr';
  });
};

const callModal = (watchedState) => {
  const container = document.querySelector('.container-xxl');
  const btnsPosts = container.getElementsByTagName('button');

  [...btnsPosts].forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const button = event.target;
      const identifier = button.dataset.id;
      watchedState.uiState.actualId = identifier;
    })
  })
};

const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => {
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${feed.url}`)
    .then((response) => {
      const { feed, posts } = parse(response.data.contents);
      const newArray = [];
      if (posts.length > watchedState.posts.length) {
        const count = posts.length - watchedState.posts.length;
        for (let i = count; i > 0; i -= 1) {
          newArray = posts.slice(watchedState.posts.length, posts.length);
          newArray.forEach((post) => {
            post.id = uniqueId();
          })
          watchedState.posts = [...watchedState.posts, ...newArray];
        }
      }
    })
    .catch((err) => {
      // нужно ли менять state.errors?
      console.log('updatePosts ERR', err);
    })
  });
  Promise.all(promises)
  .then(() => {
    setTimeout(() => {
        updatePosts(watchedState);
    }, 5000);
  })
  callModal(watchedState);
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
      errors: null,
      feeds: [],
      posts: [],
      uiState: {
        actualId: null,
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

      schema.validate(url, { abortEarly: false }) // ошибки валидации
      .then(() => {

        uploadRss(watchedState, url);

      })
      .catch ((err) => {
        console.log('schema ERR', err);
        watchedState.errors = err.message.key;
        watchedState.status = 'failed';
      })
    })
    
    updatePosts(watchedState);

  });
};
export default app ;
