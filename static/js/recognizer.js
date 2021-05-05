const video = document.getElementById('video');
const HOST = `http://127.0.0.1:5700`;
const EXPRESSIONS = ['angry', 'disgusted', 'fearful', 'happy', 'neutral', 'sad', 'surprised'];
// console.log(faceapi.nets);
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/api/static/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/api/static/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/api/static/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/api/static/models')
]).then(getReady)

async function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )

  // starting music auto
  setTimeout(manualStartMusic, 2000);
  // manualStartMusic();
}

function stopVideo() {
  console.log(`Stop video streaming.`);
  video.srcObject.getTracks()[0].stop();
  video.srcObject = null;
}

function getReady() {
  console.log(`Modules loaded. Activating stream buttons.`);
  // streaming btns
  let streambtn = document.getElementById("stream-btn");
  streambtn.className = "visible";
  document.getElementById("mload").className = "invisible";

  // audio btns
  let audbtns = document.getElementById("player-ui");
  audbtns.className = "visible";
  document.getElementById("player-btn").className = "visible";
  document.getElementById("audio-loading").className = "invisible";
}

async function getMax(obj) {
  let keys = []
  let vals = []
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const e = obj[key];
      keys.push(key)
      vals.push(obj[key])
    }
  }
  return keys[vals.indexOf(Math.max(...vals))]
}
function maxOccurence(array) {
  if(array.length == 0)
      return null;
  var modeMap = {};
  var maxEl = array[0], maxCount = 1;
  for(var i = 0; i < array.length; i++)
  {
      var el = array[i];
      if(modeMap[el] == null)
          modeMap[el] = 1;
      else
          modeMap[el]++;  
      if(modeMap[el] > maxCount)
      {
          maxEl = el;
          maxCount = modeMap[el];
      }
  }
  return maxEl;
}

async function detect() {
  let exp = undefined;
  try {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    if (detections && detections.length > 0 && detections[0].expressions) {
      exp = await getMax(detections[0].expressions)
      // console.log(detections[0].expressions)
    } else {
      exp = `Face not found!.`;
    }
    // console.log(exp)
  } catch (error) {
    exp = `Face not found!.`;
  } finally {
    return exp;
  }
}

video.addEventListener('play', () => {
  const emotion = document.getElementById("emotion");
  setInterval(async () => {
    let exp = await detect();
    // console.log(exp);
    emotion.innerHTML = exp;
  }, 100)
})

// Music controlss
function playAudio(audioData) {
  const ado = document.getElementById("ado");
  while (ado.firstChild) {
    ado.removeChild(ado.lastChild);
  }
  var ad_player = document.createElement("AUDIO");
  ad_player.setAttribute("id", "song");
  ad_player.style.width = "450px";
  if (ad_player.canPlayType("audio/mpeg")) {
    ad_player.setAttribute("src", `${HOST}/api/static/audio/${audioData.file}`);
  }
  ad_player.setAttribute("controls", "controls");
  // ad_player.setAttribute("loop", "loop");
  ad_player.setAttribute("autoplay", "autoplay");
  ado.appendChild(ad_player);
  document.getElementById("play-next").className = "btn btn-outline-info visible";
  document.getElementById("song").addEventListener('ended', async () => {
    console.log('Searching next song...');
    let res = await getMusicData();
    nextSong(res);
  })
}

async function nextSong(audioData) {
  if (!audioData) {
    audioData = await getMusicData();
  }
  const song = document.getElementById("song");
  if (song.canPlayType("audio/mpeg")) {
    song.setAttribute("src", `${HOST}/api/static/audio/${audioData.file}`);
  }
}

async function getMusicData() {
  // get list of emotions and find the music file
  let noOfProof = 20;
  let eArr = [];
  let final_exp = 'neutral';
  // console.log(video.srcObject);
  for(let i=0; i<noOfProof && video.srcObject != null; i++) {
    let exp = await detect();
    eArr.push(exp);
  }
  if (eArr.length <= 0) {
    // alert('Video stream inactive. loading default song')
    console.warn(`Video stream inactive. loading default song`);
  }
  else {
    final_exp = maxOccurence(eArr);
    if (EXPRESSIONS.includes(final_exp)){}
    else {
      final_exp = 'neutral';
    }
  }
  console.log(final_exp, EXPRESSIONS.includes(final_exp));
  // get song from api based on expression
  let response = await fetch(`${HOST}/api/audio/${final_exp}`);
  // console.log(response);
  let res = await response.json(response);
  console.log(res);
  return res;
}

async function manualStartMusic() {
  let res = await getMusicData();
  playAudio(res);
}