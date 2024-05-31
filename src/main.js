import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { fetchImages } from './js/pixabay-api.js';

import { displayImages } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const loader = document.querySelector('.loader');
const gallery = document.querySelector('#gallery');
const loadMoreBtn = document.querySelector('#load-more-btn');

let currentPage = 1;
let searchTerm = '';

let lightbox = new SimpleLightbox('.simplelightbox a', {
  elements: '.simplelightbox',
  closeText: 'Закрыть',
  docClose: true,
});
let images = [];
let currentIndex = 0;

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  searchTerm = searchInput.value.trim();
  currentPage = 1;
  currentIndex = 0;

  loader.style.display = 'block';
  loadMoreBtn.style.display = 'none';

  gallery.innerHTML = '';

  if (searchTerm === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term.',
    });
    loader.style.display = 'none';
  } else {
    try {
      const response = await fetchImages(searchTerm, currentPage);
      displayImages(response.hits, gallery);

      lightbox.refresh();

      if (response.totalHits > 15) {
        loadMoreBtn.style.display = 'block';
      }
    } catch (error) {
      iziToast.error({
        title: 'Error',
        message: 'An error occurred while fetching images. Please try again.',
      });
    } finally {
      loader.style.display = 'none';
      searchInput.value = '';
    }
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;

  loader.style.display = 'block';

  try {
    const response = await fetchImages(searchTerm, currentPage);
    displayImages(response.hits, gallery);

    const cardHeight = gallery.firstElementChild.getBoundingClientRect().height;

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    lightbox.refresh();

    if (currentPage * 15 >= response.totalHits) {
      loadMoreBtn.style.display = 'none';
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'An error occurred while fetching images. Please try again.',
    });
  } finally {
    loader.style.display = 'none';
  }
});
