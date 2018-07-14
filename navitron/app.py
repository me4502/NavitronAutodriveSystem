from waitress import serve
from flask import Flask, render_template, jsonify


app = Flask(__name__)


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/getCurrentHeatmapPoints", methods=['POST'])
def get_current_heatmap_points():
    return "TODO(mitch): this"


@app.route("/getCurrentEquipmentPoints", methods=['POST'])
def get_current_equipment_points():
    return "TODO(mitch): this"


if __name__ == "__main__":
    serve(app, port=80)
