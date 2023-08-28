from flask import Flask, request, jsonify, Blueprint
from PIL import Image
from collections import defaultdict
from ultralytics import YOLO


app = Flask(__name__)
model = YOLO("best7.pt")

bp = Blueprint("photo", __name__, url_prefix="/photo")


@bp.route("/", methods=["POST", "GET"])
def send_photo():
    print("Received photo")
    photo = request.files.get("photo")
    image = Image.open(photo)
    image = image.convert("RGB")
    result = model(image)

    names = result[0].names
    detected_boxes = result[0].boxes
    class_counts = defaultdict(int)

    boxes_data = []

    for detection in detected_boxes:
        class_index = int(detection.cls)
        class_label = names[class_index]
        class_counts[class_label] += 1

        box = detection.xyxy.tolist()
        boxes_data.append({"label": class_label, "box": box})

    result_json = [
        {"label": label, "count": count} for label, count in class_counts.items()
    ]

    response_data = {
        "detection_results": result_json,
        "boxes_data": boxes_data,
    }

    return jsonify(response_data)
