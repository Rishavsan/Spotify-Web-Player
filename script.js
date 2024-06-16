let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                                                    <img class="invert" src="music.svg" alt="">
                                                    <div class="info">
                                                        <div>${song.replaceAll(
                                                          "%20",
                                                          " "
                                                        )}</div>
                                                        <div>The Weeknd</div>
                                                    </div>
                                                    <div class="playNow">
                                                        <span>Play Now</span>
                                                        <img class="invert" src="play.svg" alt="">
                                                    </div>
                                                </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs
}

async function removeMp3Tag(songNames) {
  return songNames.map(function (songName) {
    return songName.replace(".mp3", "");
  });

}

function secondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Convert input seconds to a floating-point number
  seconds = parseFloat(seconds);

  // Calculate total seconds
  var totalSeconds = Math.round(seconds);

  // Calculate minutes and remaining seconds
  var minutes = Math.floor(totalSeconds / 60);
  var remainingSeconds = totalSeconds % 60;

  // Add leading zeros if necessary
  var minutesString = minutes < 10 ? "0" + minutes : minutes;
  var secondsString =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return minutesString + ":" + secondsString;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/Spotify%20Clone/songs/" + track)
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";


};



async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      //Get the metadata of the folder
      let a = await fetch(`songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div class="card" data-folder="${folder}">
        <button class="spotify-button">
        <div aria-hidden="true" class="play-icon">
        <svg viewBox="0 0 24 24" class="play-icon-svg">
        <path
        d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
        </path>
        </svg>
        </div>
        </button>
        <img src="http://127.0.0.1:5500/songs/${folder}/cover.jpg" alt="" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`;
    }
  }

  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(
        `songs/${item.currentTarget.dataset.folder}`
      );
      playMusic(songs[0])
    });
  });
}



async function main() {
  //Get the list of all the songs
  await getSongs("songs/Weeknd");

  playMusic(songs[0], true);

  //Display all the albums on the page
  await displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  //listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(
      ".songTime"
    ).innerHTML = `${secondsToMinutesAndSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesAndSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //add an event listener to seek bar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Adding an event listener for hamburger icon
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  //Adding an event listener for close icon
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-200%";
  });

  //Add event listener for previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("click", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
      } 
    });

  //Add an event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
