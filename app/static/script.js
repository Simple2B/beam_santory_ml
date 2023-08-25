const videoElement = document.getElementById("webcam");
const resultArea = document.getElementById("recognition_result");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = videoElement.videoWidth;
canvas.height = videoElement.videoHeight;


let stream; 
let interval;

const LABELS_COLORS={
    bar: 'purple',
    bottle: 'blue',
    spray: 'orange',
    tube:'pink'
}

async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error) {
        console.error("Error accessing webcam:", error);
        return;
    }    

    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track); 

    const sendPhotoToServer = async () => {
        const imageBlob = await imageCapture.takePhoto();

        const formData = new FormData();
        formData.append("photo", imageBlob);

        const resp = await fetch("http://127.0.0.1:5001/photo", {
        method: "POST",
            body: formData,
        });
        const data = await resp.json();
        
        resultArea.innerHTML = '';

        data.detection_results.forEach(item => {
            const itemText = document.createElement('p');
            itemText.textContent = `${item.label}: ${item.count}`;
            resultArea.appendChild(itemText);
        });    
    
        
        const canvasWidth = videoElement.videoWidth;
        const canvasHeight = videoElement.videoHeight;
        canvas.width = canvasWidth * window.devicePixelRatio;
        canvas.height = canvasHeight * window.devicePixelRatio;

        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        data.boxes_data.forEach((item) => {
            const {box, label} = item;
              
            const [x1, y1, x2, y2] = box[0];            

            const scaledX1 = x1;
            const scaledY1 = y1 ;
            const scaledX2 = x2 ;
            const scaledY2 = y2;
        
            const boxWidth = scaledX2 - scaledX1;
            const boxHeight = scaledY2 - scaledY1;
        
            ctx.strokeStyle = LABELS_COLORS[label];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.rect(scaledX1, scaledY1, boxWidth, boxHeight);
            ctx.stroke();             
        });   
        
    };
    
    let isImageInProcessing = false;
    const processImage = async () => {
        if (isImageInProcessing) {
            return;
        }

        isImageInProcessing = true;
        await sendPhotoToServer();
        isImageInProcessing = false;
    }

    interval = setInterval(processImage, .1)

    videoElement.srcObject = stream;
    videoElement.play();  
    

}



startWebcam();