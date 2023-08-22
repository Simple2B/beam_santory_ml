import base64
import json
from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageDraw
import io
from collections import defaultdict
from ultralytics import YOLO


app = Flask(__name__)
model = YOLO("best7.pt")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/photo", methods=["POST", "GET"])
def send_photo():
    photo = request.files.get("photo")
    image = Image.open(photo)
    image = image.convert("RGB")
    result = model(image)

    names = result[0].names
    detected_boxes = result[0].boxes
    class_counts = defaultdict(int)

    draw = ImageDraw.Draw(image)

    for detection in detected_boxes:
        class_index = int(detection.cls)
        class_label = names[class_index]
        class_counts[class_label] += 1

        x1, y1, x2, y2 = detection.xyxy[
            0
        ].tolist()  # Assuming xyxy returns a list of boxes

        draw.rectangle([x1, y1, x2, y2], outline="red", width=3)

    result_json = [
        {"label": label, "count": count} for label, count in class_counts.items()
    ]

    img_byte_array = io.BytesIO()
    image.save(img_byte_array, format="JPEG")
    img_data = img_byte_array.getvalue()
    img_base64 = base64.b64encode(img_data).decode()

    response_data = {
        "detection_results": result_json,
        "image": img_base64,
    }

    response = jsonify(response_data)
    response.headers["Content-Type"] = "application/json"
    print(response)

    return jsonify(response_data)


if __name__ == "__main__":
    app.run(debug=True)
