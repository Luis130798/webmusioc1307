let player;
let currentVideoIndex = 0;
const API_KEY = 'AIzaSyDtLaCNjVFK9dS1SVxNaTgxYeyoPyRhbH8'; // Reemplaza con tu clave de API de YouTube
const playlistId = 'PLFatPzwEN2vImGLFV0NcAaspaM3HSLIl_'; // Reemplaza con el ID de tu playlist de YouTube
let videoIds = [];
let currentPage = 1;
const videosPerPage = 8; // 2 rows of 4 videos each

// Cargar la API de iframe de YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '500',
        width: '100%',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    loadPlaylist();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        currentVideoIndex++;
        if (currentVideoIndex < videoIds.length) {
            player.loadVideoById(videoIds[currentVideoIndex]);
        } else {
            currentVideoIndex = 0;
            player.loadVideoById(videoIds[currentVideoIndex]);
        }
    }
}

function loadPlaylist() {
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            videoIds = data.items.map(item => item.snippet.resourceId.videoId);
            createThumbnails(data.items);
            createPaginationButtons(Math.ceil(videoIds.length / videosPerPage));
            player.loadVideoById(videoIds[currentVideoIndex]);
        });
}

function createThumbnails(videos) {
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = ''; // Limpiar la lista de videos
    videos.forEach((video, index) => {
        const title = video.snippet.title;
        const thumbnailUrl = video.snippet.thumbnails.default.url;
        const videoId = video.snippet.resourceId.videoId;
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('video-thumbnail');
        thumbnailDiv.innerHTML = `
            <img src="${thumbnailUrl}" alt="${title}">
            <div class="video-title">${title}</div>
        `;
        thumbnailDiv.onclick = () => {
            currentVideoIndex = index;
            player.loadVideoById(videoId);
        };
        videoList.appendChild(thumbnailDiv);
    });
    showPage(currentPage);
}

function createPaginationButtons(numPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Limpiar los botones de paginación
    for (let i = 1; i <= numPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            showPage(currentPage);
        };
        if (i === currentPage) {
            button.classList.add('active');
        }
        pagination.appendChild(button);
    }
}

function showPage(page) {
    const videoList = document.getElementById('videoList');
    const start = (page - 1) * videosPerPage;
    const end = start + videosPerPage;
    const thumbnails = videoList.children;
    for (let i = 0; i < thumbnails.length; i++) {
        if (i >= start && i < end) {
            thumbnails[i].style.display = 'block';
        } else {
            thumbnails[i].style.display = 'none';
        }
    }
    const buttons = document.getElementById('pagination').children;
    for (let button of buttons) {
        button.classList.remove('active');
    }
    buttons[page - 1].classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    onYouTubeIframeAPIReady();
});
