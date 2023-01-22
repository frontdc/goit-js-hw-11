import axios from 'axios'; 
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api';
const KEY = '33010704-feed17696efaf039f05536787';
const BASE_QUERY = 'image_type=photo&orientation=horizontal&safesearch=true';
const form = document.querySelector('#search-form');
const btnLoadMore = document.querySelector('.load-more');
const input = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const per_page = 40; 

let page = 1;

form.addEventListener('submit', onSubmit);
btnLoadMore.addEventListener('click', loadMore);
gallery.addEventListener('click', onContainerClick);

async function loadMore(){
    const query = await queryToServer(input.value);
    createMarkup(query.data.hits);
            
        if (query.data.totalHits<per_page*(page-1)) {
            btnLoadMore.classList.add('is-hidden');
            Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
        }
    
    const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

    window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
});
}

async function queryToServer(query) {
    try {
        const response = await axios.get(
            `${BASE_URL}/?key=${KEY}&q=${query}&${BASE_QUERY}&per_page=${per_page}&page=${page}`
        );
        if (!response.status==200) {
            throw new Error(response.statusText)
        }
        page += 1;
        return response;
    } catch (err) { 
        console.log('err');
    }
}

async function onSubmit(e) {
    e.preventDefault();
    btnLoadMore.classList.add('is-hidden');
    page = 1;
    gallery.innerHTML = '';
    const query = await queryToServer(input.value);
        if (query.data.totalHits == 0) { 
        Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        return;
    }
    createMarkup(query.data.hits);
    if (query.data.totalHits <= per_page) { 
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
        return;
    }
    btnLoadMore.classList.remove('is-hidden');
    Notiflix.Notify.info(`Hooray! We found ${query.data.totalHits} images.`);
}

async function createMarkup(arr) {
    const markup = arr.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads
    } ) => `<a href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" class="gallery__image"/>
  <div class="info">
    <p class="info-item">
      ${likes}<b> Likes</b>
    </p>
    <p class="info-item">
      ${views}<b> Views</b>
    </p>
    <p class="info-item">
      ${comments}<b> Comments</b>
    </p>
    <p class="info-item">
      ${downloads}<b> Downloads</b>
    </p>
  </div>
</div></a>`);
    gallery.insertAdjacentHTML('beforeend', markup.join(''));
    lightbox.refresh();  
}

function onContainerClick(e) { 
    if (!e.target.classList.contains('gallery__image')) { 
        return;
    }
    e.preventDefault();
}

const lightbox = new SimpleLightbox('.gallery a');