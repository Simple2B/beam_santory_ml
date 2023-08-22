const videoElement = document.getElementById("webcam");
const sendPhotoButton = document.getElementById("send_photo");
const resultArea = document.getElementById("recognition_result");
let stream;

async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track); 
        sendPhotoButton.addEventListener("click", async () => {
            const imageBlob = await imageCapture.takePhoto();
            console.log(imageBlob);

            const formData = new FormData();
            formData.append("photo", imageBlob);

            const resp = await fetch("http://127.0.0.1:5000/photo", {
            method: "POST",
              body: formData,
            });
            const data = await resp.json();
            
            resultArea.innerHTML = '';

            data.forEach(item => {
                const itemText = document.createElement('p');
                itemText.textContent = `${item.label}: ${item.count}`;
                resultArea.appendChild(itemText);
            });
        });

        videoElement.srcObject = stream;
        videoElement.play();
    } catch (error) {
        console.error("Error accessing webcam:", error);
    }
}

function stopWebcam() {
    if (stream) {
        mediaRecorder.stop();
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }
}


startWebcam();