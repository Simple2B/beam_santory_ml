const videoElement = document.getElementById("webcam");
const startRecognitionButton = document.getElementById("startRecognitionButton");
const stopRecognitionButton = document.getElementById("stopRecognitionButton");
let stream;
let timer;

async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.play();
    } catch (error) {
        console.error("Error accessing webcam:", error);
    }
}

function stopWebcam() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }
}

function startRecognition() {
    timer = setInterval(() => {
        console.log("Recognition");
    }, 300);
}

function stopRecognition() {
    clearInterval(timer);
}

startRecognitionButton.addEventListener("click", startRecognition);
stopRecognitionButton.addEventListener("click", stopRecognition);

startWebcam();