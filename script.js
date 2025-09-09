const API_KEY = "api_key=1cf50e6248dc270629e802686245c2c8";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;
const TRENDING_URL = BASE_URL + "/trending/movie/week?" + API_KEY;
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const searchURL = BASE_URL + "/search/movie?" + API_KEY;

const recommendations = document.getElementById("recommendations");
const recommendationsHeader = document.getElementById("recommendations-header");
const form = document.getElementById("form");
const search = document.getElementById("search");

// Top section (Trending OR Search Results)
const topSectionTitle = document.getElementById("top-section-title");
const topContainer = document.getElementById("top-container");

// Popular section
const popularContainer = document.getElementById("popular-container");

// Carousel buttons
const trendingLeft = document.getElementById("trending-left");
const trendingRight = document.getElementById("trending-right");
const popularLeft = document.getElementById("popular-left");
const popularRight = document.getElementById("popular-right");

// Load movies
getTrending(TRENDING_URL);
getPopular(API_URL);

// ---------- Fetch Popular ----------
function getPopular(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      showMovies(data.results, popularContainer, "carousel");
    });
}

// ---------- Fetch Trending ----------
function getTrending(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      showMovies(data.results, topContainer, "carousel");
    });
}

// ---------- Fetch Recommendations ----------
function getRecommendations(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.results.length > 0) {
        const movieId = data.results[0].id;
        const recommendationsURL =
          BASE_URL +
          `/movie/${movieId}/recommendations?` +
          API_KEY +
          "&language=en-US&page=1";

        fetch(recommendationsURL)
          .then((res) => res.json())
          .then((data) => {
            showMovies(data.results, recommendations, "grid-no-overview");
          });
      }
    });
}

// ---------- Display Movies ----------
function showMovies(data, container, layout = "grid") {
  container.innerHTML = "";
  data.forEach((movie) => {
    const { title, poster_path, vote_average, overview } = movie;
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    if (layout === "search") {
      // Search results: show overview
      movieEl.innerHTML = `
        <img src="${poster_path ? IMG_URL + poster_path : "./no-image.jpg"}" alt="${title}">
        <div class="vote">${vote_average ? Math.round(vote_average * 10) / 10 : "NR"}</div>
        <div class="movie-info">
          <h3>${title}</h3>
        </div>
        <div class="overview">
          <h3>Overview</h3>
          ${overview || "No overview available."}
        </div>
      `;
    } else {
      // Carousel or recommendations: no overview
      movieEl.innerHTML = `
        <img src="${poster_path ? IMG_URL + poster_path : "./no-image.jpg"}" alt="${title}">
        <div class="vote">${vote_average ? Math.round(vote_average * 10) / 10 : "NR"}</div>
        <div class="movie-info">
          <h3>${title}</h3>
        </div>
      `;
    }

    container.appendChild(movieEl);
  });
}

// ---------- Search ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  if (searchTerm) {
    fetch(searchURL + "&query=" + searchTerm)
      .then((res) => res.json())
      .then((data) => {
        topSectionTitle.textContent = `Search Results for "${searchTerm}"`;
        showMovies(data.results, topContainer, "search"); // ✅ overview only here
      });

    getRecommendations(searchURL + "&query=" + searchTerm);
    recommendationsHeader.hidden = false;
  } else {
    topSectionTitle.textContent = "Trending This Week";
    getTrending(TRENDING_URL);
    recommendationsHeader.hidden = true; // ✅ removed getPopular here
  }
});

// ---------- Carousel Button Scroll ----------
function addCarouselControls(leftBtn, rightBtn, container) {
  leftBtn.addEventListener("click", () => {
    container.scrollBy({ left: -500, behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    container.scrollBy({ left: 500, behavior: "smooth" });
  });
}

addCarouselControls(trendingLeft, trendingRight, topContainer);
addCarouselControls(popularLeft, popularRight, popularContainer);

// ---------- Autoplay Scroll ----------
function autoScroll(container, direction = 1) {
  let dir = direction;
  setInterval(() => {
    container.scrollBy({ left: 200 * dir, behavior: "smooth" });

    // reverse direction at edges
    if (
      container.scrollLeft + container.clientWidth >= container.scrollWidth ||
      container.scrollLeft <= 0
    ) {
      dir *= -1;
    }
  }, 3000);
}

autoScroll(topContainer);
autoScroll(popularContainer);
