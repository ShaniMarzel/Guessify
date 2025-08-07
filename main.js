let player;
let stopTimeout;
let currentVideoId = "";
let isReadyToPlay = false;

let playDuration = 5;
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn5").style.backgroundColor = "#b53c6a";
});

const API_KEY = "AIzaSyBRSVgNtcwesGldtVKx5FkUEgGZw2OCy70";
const PLAYLIST_ID = "PLOZ7RsIL_jspURFZIPjE-VLGGEh_shhcs";

// YouTube API קורא לפונקציה הזו כשהנגן מוכן
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '',
    playerVars: {
      'autoplay': 0,
      'controls': 1
    },
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

// מופעל כשמצב הנגן משתנה
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING && isReadyToPlay) {
    clearTimeout(stopTimeout);
    if (playDuration > 0) {
      stopTimeout = setTimeout(() => {
        player.pauseVideo();
      }, playDuration * 1000);
    }
    isReadyToPlay = false; // שלא יקרה שוב
  }
}

// שינוי אורך ניגון
function setPlayDuration(seconds, buttonElement) {
  playDuration = seconds;
  const buttons = document.querySelectorAll('.button-3d');
  buttons.forEach(btn => btn.classList.remove('active'));

  // הוסיפי "active" רק לכפתור שנלחץ
  buttonElement.classList.add('active');
  document.getElementById("btn5").style.backgroundColor = (seconds === 5) ? "#b53c6a" : "";
  document.getElementById("btn10").style.backgroundColor = (seconds === 10) ? "#b53c6a" : "";
  document.getElementById("btnFull").style.backgroundColor = (seconds === 0) ? "#b53c6a" : "";

  if (currentVideoId && player && seconds > 0) {
    playFor(seconds); // כאן הפעלת הניגון מחדש
  }

  if (seconds === 0 && currentVideoId && player) {
    playFull(); // אם נבחר ניגון מלא
  }
}


async function getAllPlaylistItems() {
  let allVideos = [];
  let nextPageToken = "";
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}&pageToken=${nextPageToken}`;
    const response = await fetch(url);
    if (!response.ok) break;
    const data = await response.json();
    allVideos = allVideos.concat(data.items);
    nextPageToken = data.nextPageToken || "";
  } while (nextPageToken);
  return allVideos;
}

function getRandomVideo(videos) {
  const randomIndex = Math.floor(Math.random() * videos.length);
  return videos[randomIndex];
}

async function showRandomVideo() {
  const videos = await getAllPlaylistItems();
  if (!videos || videos.length === 0) {
    alert("לא נמצאו שירים בפלייליסט.");
    return;
  }

  const randomVideo = getRandomVideo(videos);
  const snippet = randomVideo.snippet;
  currentVideoId = snippet.resourceId.videoId;

  // עדכון מידע
  const title = snippet.title || "unknown";
  const channel = snippet.videoOwnerChannelTitle || snippet.channelTitle || "unknown";
  const date = snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : "unknown";
  document.getElementById("song-info").innerHTML =
    `<strong>🎵 song:</strong> ${title}<br>
     <strong>🎤 artist:</strong> ${channel}<br>
     <strong>📅 year:</strong> ${date}`;

  isReadyToPlay = true;
  clearTimeout(stopTimeout);
  player.loadVideoById(currentVideoId);
    player.loadVideoById(currentVideoId);

    // מוסיפים ניגון אוטומטי לפי הזמן שנבחר
    if (playDuration > 0) {
      setTimeout(() => {
        playFor(playDuration);
      }, 1000); // דחייה קלה כדי לוודא שהשיר התחיל להיטען
    } else {
      player.playVideo(); // אם נבחר "מלא", פשוט נגן
    }

}


function playFor(seconds) {
  if (!currentVideoId || !player) return;
  // עוצרים ניגון קודם אם קיים
  clearTimeout(stopTimeout);
  // מחזירים להתחלה ומפעילים
  player.seekTo(0, true);
  player.playVideo();
  // עוצרים אחרי הזמן הרצוי
  stopTimeout = setTimeout(() => {
    player.pauseVideo();
  }, seconds * 1000);
}

function playFull() {
  if (!currentVideoId || !player) return;

  clearTimeout(stopTimeout);
  player.seekTo(0, true);
  player.playVideo();
}