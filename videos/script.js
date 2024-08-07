let player;
let currentVideoIndex = 0;
const API_KEY = 'AIzaSyDtLaCNjVFK9dS1SVxNaTgxYeyoPyRhbH8'; // Reemplaza con tu clave de API de YouTube
let videoIds = [];
let nextPageToken = '';
let currentPlaylistId = ''; // Variable para almacenar el ID de la playlist actual

// Lista de playlists (para el carrusel)
const playlists = [
    {
        id: 'PLq2wg7YI4HgK6X6KzaMfuDOHg6461rrqj',
        title: 'Festivales',
        thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6ryQNdszQnI5nlEjV6Jjxt7O8Zd7e4N65Dg&s'
    },
    {
        id: 'PLFatPzwEN2vIKPa7Jt5gQrgAKc5Nn-tgH',
        title: 'Top Cumbias Perú',
        thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBYVbK9IZjNXAxFxEn19vtV-rWkzV-F5isZJgmgdFkdvecTeLt8hgo4zQQ0hXrWl_Tmaw&usqp=CAU'
    },
    {
        id: 'PLvyc90XGYb_qIKMZ00lXvKdtJmvOPEg_0',
        title: 'DJ TAVO MIXES',
        thumbnail: 'https://thumbnailer.mixcloud.com/unsafe/390x390/extaudio/2/4/b/a/f9d4-08a8-42a8-b518-307b4ca13c8d'
    },
    {
        id: 'PLFatPzwEN2vK37vkzCgd8jNoz9BuO1Uxw',
        title: 'Tekno Emotiva',
        thumbnail: 'https://m.media-amazon.com/images/I/51twnYFhHaL._UF1000,1000_QL80_.jpg'
    },
    {
        id: 'PLTtHNiDB8jpTwBR3aQ4tMhN-IlTBEX6BN',
        title: 'Tomorrowland 2024',
        thumbnail: 'https://pbs.twimg.com/profile_images/1727774883457744897/ydV4J_q1_400x400.jpg'
    },
    {
        id: 'PLaq_6rg1_jQVq88qS9hcU6rDxZJ2Mg3uz',
        title: 'Ultimos Lanzamientos',
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ae/29/60/ae2960da-00d2-50af-cdb8-78a6a37285e5/23UM1IM35109.rgb.jpg/1200x1200bb.jpg'
    }
];

// Cargar la API de iframe de YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '109%',
        playerVars: {
            rel: 0,
            modestbranding: 1,
            showinfo: 0,
            controls: 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    createPlaylistCarousel();
    loadPlaylist(playlists[0].id); // Load the first playlist by default
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        currentVideoIndex++;
        if (currentVideoIndex < videoIds.length) {
            player.loadVideoById(videoIds[currentVideoIndex]);
            updateVideoTitle();
        } else {
            currentVideoIndex = 0;
            player.loadVideoById(videoIds[currentVideoIndex]);
            updateVideoTitle();
        }
        updateBackground();
    }
}

function loadPlaylist(playlistId, pageToken = '') {
    currentPlaylistId = playlistId; // Guardar el ID de la playlist actual
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=13&playlistId=${playlistId}&key=${API_KEY}&pageToken=${pageToken}`)
        .then(response => response.json())
        .then(data => {
            if (!pageToken) {
                videoIds = [];
                document.getElementById('videoList').innerHTML = ''; // Clear the video list
            }
            videoIds = videoIds.concat(data.items.map(item => item.snippet.resourceId.videoId));
            createThumbnails(data.items);
            nextPageToken = data.nextPageToken || '';
            toggleShowMoreButton(nextPageToken);
            if (!pageToken) {
                currentVideoIndex = 0; // Reset to the first video
                player.loadVideoById(videoIds[currentVideoIndex]);
                updateVideoTitle(data.items[0].snippet.title);
                updateBackground();
            }
        });
}

function createThumbnails(videos) {
    const videoList = document.getElementById('videoList');
    videos.forEach((video, index) => {
        const title = video.snippet.title;
        const thumbnailUrl = video.snippet.thumbnails.high.url; // Use high resolution thumbnail
        const videoId = video.snippet.resourceId.videoId;
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('video-thumbnail');
        thumbnailDiv.innerHTML = `
            <img src="${thumbnailUrl}" alt="${title}">
            <div class="video-title">${title}</div>
        `;
        thumbnailDiv.onclick = () => {
            currentVideoIndex = Array.from(videoList.children).indexOf(thumbnailDiv);
            player.loadVideoById(videoId);
            updateVideoTitle(title);
            updateBackground();
        };
        videoList.appendChild(thumbnailDiv);
    });
}

function createPlaylistCarousel() {
    const playlistCarousel = document.getElementById('playlistCarousel');
    playlists.forEach((playlist, index) => {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('carousel-thumbnail');
        thumbnailDiv.innerHTML = `
            <img src="${playlist.thumbnail}" alt="${playlist.title}">
            <div class="video-title">${playlist.title}</div>
        `;
        thumbnailDiv.onclick = () => {
            loadPlaylist(playlist.id);
        };
        playlistCarousel.appendChild(thumbnailDiv);
    });
}

function updateBackground() {
    const backgroundOverlay = document.querySelector('.background-overlay');
    const videoUrl = `https://img.youtube.com/vi/${videoIds[currentVideoIndex]}/hqdefault.jpg`;
    backgroundOverlay.style.backgroundImage = `url(${videoUrl})`;
}

function updateVideoTitle(title) {
    const videoTitleContainer = document.getElementById('videoTitle');
    videoTitleContainer.textContent = title;
}

function loadMoreVideos() {
    if (nextPageToken) {
        loadPlaylist(currentPlaylistId, nextPageToken); // Usar el ID de la playlist actual
    }
}

function toggleShowMoreButton(nextPageToken) {
    const showMoreButton = document.getElementById('showMoreButton');
    if (nextPageToken) {
        showMoreButton.style.display = 'block';
    } else {
        showMoreButton.style.display = 'none';
    }
}

function toggleVideoList() {
    const videoListContainer = document.getElementById('videoListContainer');
    const mainVideoContainer = document.getElementById('mainVideoContainer');
    const isVisible = videoListContainer.style.display !== 'none';

    if (isVisible) {
        videoListContainer.style.display = 'none';
        mainVideoContainer.style.flex = '1';
    } else {
        videoListContainer.style.display = 'flex';
        mainVideoContainer.style.flex = '2';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const backgroundOverlay = document.createElement('div');
    backgroundOverlay.classList.add('background-overlay');
    document.body.appendChild(backgroundOverlay);
    onYouTubeIframeAPIReady();
});
