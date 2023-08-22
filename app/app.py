import json
from flask import (
    Flask,
    render_template,
    request,
)
from PIL import Image
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

    for detection in detected_boxes:
        class_index = int(detection.cls)
        class_label = names[class_index]
        class_counts[class_label] += 1

    result_json = [
        {"label": label, "count": count} for label, count in class_counts.items()
    ]

    recognition_result = json.dumps(result_json, indent=4)

    return recognition_result


if __name__ == "__main__":
    app.run()
