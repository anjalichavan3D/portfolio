
document.addEventListener("DOMContentLoaded", function () {
  var element = document.body;
  var darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    element.classList.add("dark-mode");
  }
  window.myFunction = function toggleDarkMode() {
    element.classList.toggle("dark-mode");
    if (element.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  };
});

// Media Loading & Grid Rendering
const assetFolder = 'asset/';
let allMedia = [];
async function fetchMedia() {
  const response = await fetch(assetFolder);
  const data = await response.text();
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(data, 'text/html');
  const mediaLinks = Array.from(htmlDocument.querySelectorAll('a'));
  return mediaLinks.filter(link => {
    const href = link.getAttribute('href');
    return href && (
      /\.(jpg|png|jpeg|gif)$/i.test(href) ||
      /\.(mp4|webm|ogg)$/i.test(href)
    );
  });
}
async function loadMedia() {
  const mediaLinks = await fetchMedia();
  allMedia = mediaLinks.map(link => {
    const src = link.getAttribute('href');
    const fileName = src.split('/').pop();
    return { src, fileName };
  });
  renderGrid('');
}
function renderGrid(query) {
  const grid = document.querySelector('.pinterest-grid');
  grid.innerHTML = '';
  const filteredMedia = query
    ? allMedia.filter(item => item.fileName.toLowerCase().includes(query))
    : allMedia;
  filteredMedia.forEach(item => {
    const container = document.createElement('div');
    container.classList.add('grid-item-container');
    const lowerSrc = item.src.toLowerCase();
    if (/\.(mp4|webm|ogg)$/.test(lowerSrc)) {
      // Create video thumbnail container
      const videoContainer = document.createElement('div');
      videoContainer.classList.add('video-thumbnail-container');
      const videoElem = document.createElement('video');
      videoElem.src = item.src;
      videoElem.preload = 'metadata';
      videoElem.muted = true;
      videoElem.playsInline = true;
      videoElem.controls = false;
      videoElem.classList.add('grid-item');
      videoContainer.appendChild(videoElem);
      // Add play overlay icon
      const playOverlay = document.createElement('div');
      playOverlay.classList.add('play-overlay');
      playOverlay.innerHTML = '&#9658;';
      videoContainer.appendChild(playOverlay);
      container.appendChild(videoContainer);
    } else {
      // Create image element for images/GIFs
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = 'Media';
      img.classList.add('grid-item');
      container.appendChild(img);
    }
    const caption = document.createElement('p');
    caption.textContent = item.fileName;
    caption.classList.add('img-caption');
    container.appendChild(caption);
    container.addEventListener('click', () => {
      openModal(item.src);
    });
    grid.appendChild(container);
  });
}
loadMedia();
const searchBar = document.querySelector('.search-bar');
searchBar.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  renderGrid(query);
});

// Modal for Media Pop-up
const modal = document.getElementById('modal');
const modalMediaContainer = document.getElementById('modal-media-container');
const closeModalButton = document.getElementById('modal-close');
let currentMediaElement = null;
let initialDistance = null, initialScale = 1, currentScale = 1;
function openModal(src) {
  if (currentMediaElement) {
    currentMediaElement.remove();
    currentMediaElement = null;
  }
  const lowerSrc = src.toLowerCase();
  if (/\.(mp4|webm|ogg)$/.test(lowerSrc)) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = false;
    currentMediaElement = video;
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Media';
    currentMediaElement = img;
    img.addEventListener('touchstart', imageTouchStart, { passive: false });
    img.addEventListener('touchmove', imageTouchMove, { passive: false });
    img.addEventListener('touchend', imageTouchEnd, { passive: false });
  }
  modalMediaContainer.appendChild(currentMediaElement);
  modal.style.display = 'flex';
  currentScale = 1;
  if (currentMediaElement.tagName === 'IMG') {
    currentMediaElement.style.transform = 'scale(1)';
  }
}
function closeModal() {
  modal.style.display = 'none';
  if (currentMediaElement) {
    currentMediaElement.remove();
    currentMediaElement = null;
  }
}
closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
function getDistance(touches) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.hypot(dx, dy);
}
function imageTouchStart(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    initialDistance = getDistance(e.touches);
    initialScale = currentScale;
  }
}
function imageTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const newDistance = getDistance(e.touches);
    const newScale = initialScale * (newDistance / initialDistance);
    currentScale = newScale;
    if (currentMediaElement && currentMediaElement.tagName === 'IMG') {
      currentMediaElement.style.transform = 'scale(' + newScale + ')';
    }
  }
}
function imageTouchEnd(e) {
  if (e.touches.length < 2) {
    initialDistance = null;
  }
}

// User Info Modal Functionality
const userInfoModal = document.getElementById('user-info-modal');
const userInfoClose = document.getElementById('user-info-close');
const userInfoTrigger = document.getElementById('user-info-trigger');
function openUserInfoModal() {
  userInfoModal.style.display = 'flex';
}
function closeUserInfoModal() {
  userInfoModal.style.display = 'none';
}
userInfoClose.addEventListener('click', closeUserInfoModal);
userInfoModal.addEventListener('click', (e) => { if (e.target === userInfoModal) closeUserInfoModal(); });
userInfoTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  openUserInfoModal();
});