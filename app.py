import time
import random
from waitress import serve
from flask import Flask, render_template, jsonify


NAVITRON_APP = Flask(__name__)

# TODO(mitch): turn these test points into something legit
delta_update = 1
num_points = 100
equipment_index = -1
equipment = {
    0: [('truck',
         -23.025 - i * 0.0002,
         148.74 + i * 0.0002,
         100 + 1000 * (random.random() - 0.1))
        for i in range(num_points)],
    1: [('shovel',
         -23.025 + 0.001 * (random.random() - 0.1),
         148.74 + 0.1 * (random.random() - 0.5))] * num_points,
    2: [('shovel',
         -23.025 + 0.001 * (random.random() - 0.1),
         148.74 + 0.1 * (random.random() - 0.5))] * num_points
}


@NAVITRON_APP.route("/")
def index():
    return render_template('index.html')


@NAVITRON_APP.route("/getEquipmentUpdate", methods=['POST'])
def get_equipment_update():
    global equipment_index
    equipment_index += delta_update
    return jsonify({k: v[equipment_index % num_points] for k, v in equipment.items()})


if __name__ == "__main__":
    serve(NAVITRON_APP, port=80)
