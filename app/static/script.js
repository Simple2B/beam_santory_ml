const videoElement = document.getElementById("webcam");
const resultArea = document.getElementById("recognition_result");
const canvas = document.querySelector("canvas");
const croppedCanvas = document.getElementById("croppedCanvas");
const rectangleCanvas = document.getElementById("rectangleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = videoElement.videoWidth;
canvas.height = videoElement.videoHeight;


let stream; 
let interval;
let isDrawing = false;
let startX, startY;
let squareX, squareY, squareWidth, squareHeight;

let imageBlobWrapper = { value: null };

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    startX = e.clientX - canvas.getBoundingClientRect().left;
    startY = e.clientY - canvas.getBoundingClientRect().top;
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const endX = e.clientX - canvas.getBoundingClientRect().left;
    const endY = e.clientY - canvas.getBoundingClientRect().top;

    squareX = Math.min(startX, endX);
    squareY = Math.min(startY, endY);
    squareWidth = Math.abs(endX - startX);
    squareHeight = Math.abs(endY - startY);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "purple";
    ctx.lineWidth = 2;
    ctx.strokeRect(squareX, squareY, squareWidth, squareHeight);
});


canvas.addEventListener("mouseup", () => {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);    
    isDrawing = false;
    console.log("Square coordinates:", squareX, squareY, squareWidth, squareHeight);
});

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
        let imageBlob = await imageCapture.takePhoto();
        const formData = new FormData();

        const image = new Image();
        image.src = URL.createObjectURL(imageBlob);
        

        image.onload = async () => {
            const croppedCanvas = document.getElementById("croppedCanvas");
            const context = croppedCanvas.getContext("2d");

            croppedCanvas.width = squareWidth;
            croppedCanvas.height = squareHeight;

            context.drawImage(image, squareX, squareY, squareWidth, squareHeight, 0, 0, squareWidth, squareHeight);

            const croppedImage = new Image();
            croppedImage.src = croppedCanvas.toDataURL();

            croppedCanvas.toBlob(async (croppedBlob) => {
                if (!croppedBlob) return;

                formData.append("photo", croppedBlob);

                const resp = await fetch("http://127.0.0.1:5002/photo", {
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

                const rectangleCanvassWidth = squareWidth;
                const rectangleCanvasHeight = squareHeight;
                rectangleCanvas.width = rectangleCanvassWidth * window.devicePixelRatio;
                rectangleCanvas.height = rectangleCanvasHeight * window.devicePixelRatio;
                const ctx = rectangleCanvas.getContext("2d");

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


            }, "image/jpeg"); 
        };

        if (!squareWidth) {
            formData.append("photo", imageBlob);

            const resp = await fetch("http://127.0.0.1:5002/photo", {
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

             resultArea.innerHTML = '';

            data.detection_results.forEach(item => {
                const itemText = document.createElement('p');
                itemText.textContent = `${item.label}: ${item.count}`;
                resultArea.appendChild(itemText);
            });        
        }
        
       
        
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