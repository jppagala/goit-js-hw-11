import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

// https://pixabay.com/api/
// API key: 42854902-4e7015a57fe2c0e354fa0172f
// 'https://pixabay.com/api/?key=42854902-4e7015a57fe2c0e354fa0172f&q=yellow+flowers&image_type=photo';

// ###############################################################
// Variable Declarations and Assignments
// ###############################################################

const baseURL = 'https://pixabay.com/api/';
const apiKey = `42854902-4e7015a57fe2c0e354fa0172f`;

const searchForm = document.querySelector('#search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

var pageToQuery = 1;
const per_page = 40;
var totalPages = 1;
var endPage = 0;

var parameters = {
  key: apiKey,
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  page: pageToQuery,
  per_page: per_page,
};

//
//
// ###############################################################
// Functions
// ###############################################################

searchForm.addEventListener('submit', submitSearch);
loadMoreButton.addEventListener('click', loadMore);

function submitSearch(event) {
  event.preventDefault();

  endPage = 0;

  const keywordToSearch = searchForm.elements.searchQuery.value;
  parameters.q = keywordToSearch;

  queryImages(pageToQuery)
    .then(data => {
      totalPages = Math.ceil(data.totalHits / per_page);

      if (pageToQuery >= totalPages) {
        endPage = 1;
      }

      if (endPage == 0) {
        loadMoreButton.classList.remove('hidden');
      } else {
        loadMoreButton.classList.add('hidden');
      }

      if (data.totalHits == 0) {
        Notiflix.Notify.failure(
          `Sorry, there are no images matching your search query. Please try again.`
        );
      }

      if (data.totalHits > 0) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }

      return data.hits;
    })
    .then(hits => {
      galleryContainer.innerHTML = '';
      validateHits(hits);
    });
}

function fetchImages(page) {
  queryImages(page)
    .then(data => {
      totalPages = Math.ceil(data.totalHits / per_page);

      if (pageToQuery >= totalPages) {
        endPage = 1;
      }

      return data.hits;
    })
    .then(validateHits);
}

async function queryImages(page) {
  parameters.page = page;

  const searchParams = new URLSearchParams(parameters);

  const fetchedImages = await axios.get(
    `${baseURL}?${searchParams.toString()}`
  );
  return fetchedImages.data;
}

function validateHits(hits) {
  if (hits.length > 0) {
    renderImages(hits);
  }
}

function renderImages(hits) {
  let imageMarkup = ``;
  imageMarkup = hits.map(extractInfo).join('');

  galleryContainer.insertAdjacentHTML('beforeend', imageMarkup);

  var lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  });
}

function extractInfo(hit) {
  return `<div class="photo-card">
            <a class="photo-card-link" href="${hit.largeImageURL}">
              <img class="photo-web" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
            </a>
              <div class="info">
                <p class="info-item">
                  <b>Likes</b>
                  <span class="info-value">${hit.likes}</span>
                </p>
                <p class="info-item">
                  <b>Views</b>
                  <span class="info-value">${hit.views}</span>
                </p>
                <p class="info-item">
                  <b>Comments</b>
                  <span class="info-value">${hit.comments}</span>
                </p>
                <p class="info-item">
                  <b>Downloads</b>
                  <span class="info-value">${hit.downloads}</span>
                </p>
              </div>
          </div>`;
}

function loadMore() {
  pageToQuery++;
  fetchImages(pageToQuery);
}

//
//
// ###############################################################
// Initialization
// ###############################################################
