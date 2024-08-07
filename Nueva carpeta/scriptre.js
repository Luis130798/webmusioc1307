document.addEventListener("DOMContentLoaded", function() {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const coverArt = document.getElementById('cover-art');
    const songTitle = document.getElementById('song-title');
    const youtubeBtn = document.getElementById('youtube-btn');
    const spotifyBtn = document.getElementById('spotify-btn');
    const downloadBtn = document.getElementById('download-btn');
    const loadMorePlaylistBtn = document.getElementById('load-more-playlist');
    const loadMoreRemixBtn = document.getElementById('load-more-remix');

    let currentPlaylistIndex = -1;
    let currentRemixIndex = -1;
    let playlist = [];
    let remixPlaylist = [];
    let isPlaying = false;
    let isPlayingRemix = false;
    let playlistLoadedCount = 15;
    let remixPlaylistLoadedCount = 15;

    // Load playlists
    loadPlaylist('songs.csv', playlist, 'playlist', false);
    loadPlaylist('songsremix.csv', remixPlaylist, 'playlist-remix', true);

    loadMorePlaylistBtn.addEventListener('click', function() {
        loadPlaylist('songs.csv', playlist, 'playlist', false, playlistLoadedCount, 15);
        playlistLoadedCount += 15;
    });

    loadMoreRemixBtn.addEventListener('click', function() {
        loadPlaylist('songsremix.csv', remixPlaylist, 'playlist-remix', true, remixPlaylistLoadedCount, 15);
        remixPlaylistLoadedCount += 15;
    });

    function loadPlaylist(url, targetPlaylist, containerId, isRemix, start = 0, count = 15) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                const songs = data.split('\n').slice(1 + start, 1 + start + count); // Take next set of songs
                targetPlaylist.push(...songs.map(song => {
                    const [title, artist, cover, url] = song.split(',');
                    return { title, artist, cover, url };
                }));
                displayPlaylist(targetPlaylist, containerId, isRemix);
            });
    }

    function displayPlaylist(songs, containerId, isRemix = false) {
        const playlistContainer = document.getElementById(containerId);
        playlistContainer.innerHTML = '';
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'playlist-item';
            songItem.innerHTML = `
                <div class="image-container">
                    <img src="${song.cover}" alt="${song.title}">
                </div>
                <div class="info-container">
                    <div class="song-info">
                        <span class="number">${index + 1}</span>
                        <p>${song.title}</p>
                        <p>${song.artist}</p>
                    </div>
                </div>
                <div class="extra-options">
                    <button onclick="togglePlayPause(${index}, ${isRemix})"><i class="fas fa-play"></i></button>
                </div>
            `;
            playlistContainer.appendChild(songItem);
        });
    }

    window.togglePlayPause = function(index, isRemix = false) {
        if (isRemix) {
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
                updatePlayPauseBtns(false);
            }
            if (index !== currentRemixIndex || !isPlayingRemix) {
                playSong(index, true);
            } else {
                if (audioPlayer.paused) {
                    audioPlayer.play();
                    isPlayingRemix = true;
                    updatePlayPauseBtns(true);
                } else {
                    audioPlayer.pause();
                    isPlayingRemix = false;
                    updatePlayPauseBtns(true);
                }
            }
        } else {
            if (isPlayingRemix) {
                audioPlayer.pause();
                isPlayingRemix = false;
                updatePlayPauseBtns(true);
            }
            if (index !== currentPlaylistIndex || isPlayingRemix) {
                playSong(index);
            } else {
                if (audioPlayer.paused) {
                    audioPlayer.play();
                    isPlaying = true;
                    updatePlayPauseBtns(false);
                } else {
                    audioPlayer.pause();
                    isPlaying = false;
                    updatePlayPauseBtns(false);
                }
            }
        }
    };

    function playSong(index, isRemix = false) {
        if (isRemix) {
            currentRemixIndex = index;
            isPlayingRemix = true;
            isPlaying = false;
        } else {
            currentPlaylistIndex = index;
            isPlaying = true;
            isPlayingRemix = false;
        }
        const song = isRemix ? remixPlaylist[index] : playlist[index];
        fadeOutAndChangeSong(song, isRemix);
    }

    function fadeOutAndChangeSong(song, isRemix = false) {
        coverArt.style.opacity = 0;
        songTitle.style.opacity = 0;
        setTimeout(() => {
            audioPlayer.src = song.url;
            audioPlayer.play();
            isPlaying = !isRemix;
            isPlayingRemix = isRemix;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            coverArt.src = song.cover;
            songTitle.textContent = `${song.title} - ${song.artist}`;
            coverArt.style.opacity = 1;
            songTitle.style.opacity = 1;
            highlightPlayingSong(isRemix);
            updatePlayPauseBtns(isRemix);
        }, 300);
    }

    function highlightPlayingSong(isRemix = false) {
        const playlistItems = isRemix ? document.querySelectorAll('#playlist-remix .playlist-item') : document.querySelectorAll('#playlist .playlist-item');
        playlistItems.forEach((item, index) => {
            item.classList.remove('active', 'remix-active');
            if (index === currentPlaylistIndex && !isRemix) {
                item.classList.add('active');
            } else if (index === currentRemixIndex && isRemix) {
                item.classList.add('remix-active');
            }
        });
    }

    function updatePlayPauseBtns(isRemix = false) {
        const playPauseBtns = isRemix ? document.querySelectorAll('#playlist-remix .extra-options button i') : document.querySelectorAll('#playlist .extra-options button i');
        playPauseBtns.forEach((btn, index) => {
            if ((index === currentPlaylistIndex && !isRemix) || (index === currentRemixIndex && isRemix)) {
                btn.className = (isPlaying && !isRemix) || (isPlayingRemix && isRemix) ? 'fas fa-pause' : 'fas fa-play';
            } else {
                btn.className = 'fas fa-play';
            }
        });

        playPauseBtn.innerHTML = (isPlaying || isPlayingRemix) ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    function updateSeekBar() {
        const seekTime = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        seekSlider.value = seekTime;
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        totalTimeDisplay.textContent = isNaN(audioPlayer.duration) ? '00:00' : formatTime(audioPlayer.duration);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    seekSlider.addEventListener('input', function() {
        const seekTo = (seekSlider.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTo;
    });

    audioPlayer.addEventListener('timeupdate', updateSeekBar);

    audioPlayer.addEventListener('loadedmetadata', function() {
        totalTimeDisplay.textContent = isNaN(audioPlayer.duration) ? '00:00' : formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('ended', function() {
        if (isPlayingRemix) {
            if (currentRemixIndex < remixPlaylist.length - 1) {
                currentRemixIndex++;
                playSong(currentRemixIndex, true);
            }
        } else {
            if (currentPlaylistIndex < playlist.length - 1) {
                currentPlaylistIndex++;
                playSong(currentPlaylistIndex);
            }
        }
    });

    playPauseBtn.addEventListener('click', function() {
        if (isPlayingRemix) {
            togglePlayPause(currentRemixIndex, true);
        } else {
            togglePlayPause(currentPlaylistIndex, false);
        }
    });

    prevBtn.addEventListener('click', function() {
        if (isPlayingRemix) {
            if (currentRemixIndex > 0) {
                currentRemixIndex--;
                playSong(currentRemixIndex, true);
            }
        } else {
            if (currentPlaylistIndex > 0) {
                currentPlaylistIndex--;
                playSong(currentPlaylistIndex);
            }
        }
    });

    nextBtn.addEventListener('click', function() {
        if (isPlayingRemix) {
            if (currentRemixIndex < remixPlaylist.length - 1) {
                currentRemixIndex++;
                playSong(currentRemixIndex, true);
            }
        } else {
            if (currentPlaylistIndex < playlist.length - 1) {
                currentPlaylistIndex++;
                playSong(currentPlaylistIndex);
            }
        }
    });

    volumeSlider.addEventListener('input', function() {
        audioPlayer.volume = volumeSlider.value;
    });

    youtubeBtn.addEventListener('click', function() {
        const currentSong = isPlayingRemix ? remixPlaylist[currentRemixIndex] : playlist[currentPlaylistIndex];
        const query = `${currentSong.title} ${currentSong.artist}`;
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    });

    spotifyBtn.addEventListener('click', function() {
        const currentSong = isPlayingRemix ? remixPlaylist[currentRemixIndex] : playlist[currentPlaylistIndex];
        const query = `${currentSong.title} ${currentSong.artist}`;
        window.open(`https://open.spotify.com/search/${encodeURIComponent(query)}`, '_blank');
    });

    downloadBtn.addEventListener('click', function() {
        const currentSong = isPlayingRemix ? remixPlaylist[currentRemixIndex] : playlist[currentPlaylistIndex];
        const downloadUrl = `https://example.com/download?title=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}`;
        window.open(downloadUrl, '_blank');
    });
});
