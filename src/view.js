import onChange from 'on-change';

export default (elements, i18n, state) => {
  const unlockForm = () => {
    elements.submitEl.disabled = false;
    elements.inputField.disabled = false;
  };

  const renderLoading = () => {
    elements.submitEl.disabled = true;
    elements.inputField.disabled = true;
  };

  const renderFailed = () => {
    elements.inputField.classList.add('is-invalid');
    elements.messagesField.classList.add('text-danger');
    console.log('renderFailed ERR 21 view');
    console.log('ERROR:', state.errors);
    elements.messagesField.textContent = i18n.t(state.errors);
  };

  const renderSuccess = () => {
    elements.formEl.reset();
    elements.formEl.focus();
    elements.inputField.classList.remove('is-invalid');
    elements.messagesField.classList.add('text-success');
    elements.messagesField.classList.remove('text-danger');
    elements.messagesField.textContent = i18n.t('messages.validLink'); 
  };

  const renderForm = (status) => {
    switch (status) {
      case 'loading':
        renderLoading();
        break;
      case 'failed':
        unlockForm();
        renderFailed();
        break;
      case 'success':
        unlockForm();
        renderSuccess();
        break;
      default:
        break;
    }
  };

  const renderFeeds = (state) => {
    elements.feedsEl.innerHTML = '';

    const divBorderFeed = document.createElement('div');
    divBorderFeed.classList.add('card', 'border-0');
    elements.feedsEl.appendChild(divBorderFeed);

    const divBodyFeed = document.createElement('div');
    divBodyFeed.classList.add('card-body');
    divBorderFeed.appendChild(divBodyFeed);

    const h2Feed = document.createElement('h2');
    h2Feed.classList.add('card-title', 'h4');
    h2Feed.textContent = i18n.t('feeds');
    divBodyFeed.appendChild(h2Feed);

    const ulFeeds = document.createElement('ul');
    ulFeeds.classList.add('list-group', 'border-0', 'rounded-0');
    divBorderFeed.appendChild(ulFeeds);

    state.feeds.map((feed) => {
      const ulFeeds = elements.feedsEl.querySelector('ul');
      const liFeed = document.createElement('li');
      liFeed.classList.add('list-group-item', 'border-0', 'border-end-0');
      ulFeeds.prepend(liFeed);

      const title = document.createElement('h3');
      title.classList.add('h6', 'm-0');
      title.textContent = feed.titleFeed;
      liFeed.appendChild(title);

      const description = document.createElement('p');
      description.classList.add('m-0', 'small', 'text-black-50');
      description.textContent = feed.descriptionFeed;
      liFeed.appendChild(description);
    });
  };
  
  const renderPosts = (state) => {
    elements.postsEl.innerHTML = '';
    
    const divBorderPost = document.createElement('div');
    divBorderPost.classList.add('card', 'border-0');
    elements.postsEl.appendChild(divBorderPost);

    const divBodyPost = document.createElement('div');
    divBodyPost.classList.add('card-body');
    divBorderPost.appendChild(divBodyPost);

    const h2Post = document.createElement('h2');
    h2Post.classList.add('card-title', 'h4');
    h2Post.textContent = i18n.t('posts');
    divBodyPost.appendChild(h2Post);

    const ulPosts = document.createElement('ul');
    ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
    divBorderPost.appendChild(ulPosts);

    state.posts.map((post) => {
      const ulPosts = elements.postsEl.querySelector('ul');

      const liPosts = document.createElement('li');
      liPosts.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      ulPosts.prepend(liPosts);

      const a = document.createElement('a');      
      const classOption = state.uiState.viewedPosts.includes(post.id) ? 'fw-normal' : 'fw-bold';
      
      a.setAttribute('href', post.linkPost);
      a.classList.add(classOption);
      a.setAttribute('data-id', post.id);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = post.titlePost;
      liPosts.appendChild(a);

      const btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      btn.setAttribute('data-id', post.id);
      btn.setAttribute('data-bs-toggle', 'modal');
      btn.setAttribute('data-bs-target', '#modal');
      btn.textContent = i18n.t('viewBtn');
      liPosts.appendChild(btn);
    })
  };

  const renderModal = (state) => {
    const modal = elements.modal;
    const identifier = state.uiState.actualId;
    const post = state.posts.find((p) => p.id === identifier);

    modal.querySelector('.modal-title').textContent = post.titlePost;

    const p = document.createElement('p');
    p.textContent = post.descriptionPost;
    const modalBody = modal.querySelector('.modal-body');
    modalBody.appendChild(p);
    modal.querySelector('.full-article').href = post.linkPost;    
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'status':
        renderForm(value);
        break;
      case 'feeds':
        renderFeeds(state);
        break;
      case 'posts':
      case 'uiState.viewedPosts':
        renderPosts(state);
        break;
      case 'uiState.actualId':
        renderModal(state);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
