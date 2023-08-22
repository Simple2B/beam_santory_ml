const videoElement = document.getElementById("webcam");
const resultArea = document.getElementById("recognition_result");

let stream; 
let interval;

async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track); 

        const sendPhotoToServer = async () => {
            const imageBlob = await imageCapture.takePhoto();

            const formData = new FormData();
            formData.append("photo", imageBlob);

            const resp = await fetch("http://127.0.0.1:5000/photo", {
            method: "POST",
              body: formData,
            });
            const data = await resp.json();
            console.log(data);
            
            resultArea.innerHTML = '';

            data.detection_results.forEach(item => {
                const itemText = document.createElement('p');
                itemText.textContent = `${item.label}: ${item.count}`;
                resultArea.appendChild(itemText);
            });

            const recognizedPhotoDiv = document.getElementById("recognized_photo");
            recognizedPhotoDiv.innerHTML = `<img src="data:image/jpeg;base64,${data.image}" />`;

        };

        interval = setInterval(sendPhotoToServer, 1000);
        videoElement.srcObject = stream;
        videoElement.play();
    } catch (error) {
        console.error("Error accessing webcam:", error);
    }
}

// function stopWebcam() {
//     if (stream) {
//         mediaRecorder.stop();
//         const tracks = stream.getTracks();
//         tracks.forEach(track => track.stop());
//         videoElement.srcObject = null;
//     }
// }


startWebcam();