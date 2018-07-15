import time
import csv
import random
from dateutil import parser
from waitress import serve
from flask import Flask, render_template, jsonify


NAVITRON_APP = Flask(__name__)

DELTA_UPDATE = 1
equipment_index = 0
equipment = {}
with open('data/culled.csv') as equipment_file:
    equipment_reader = csv.reader(equipment_file)
    for row in equipment_reader:
        _, lat, lng, type_, id_, sensor = row
        sensor = sensor if sensor != 'NULL' else None
        if (id_ not in equipment):
            equipment[id_] = []
        equipment[id_].append((type_, lat, lng, sensor))


@NAVITRON_APP.route("/")
def index():
    return render_template('index.html')


@NAVITRON_APP.route("/getEquipmentUpdate", methods=['POST'])
def get_equipment_update():
    global equipment_index
    equipment_update = {k: v[equipment_index % len(v)] for k, v in equipment.items()}
    equipment_index += DELTA_UPDATE
    print(equipment_update)
    print()
    return jsonify(equipment_update)


if __name__ == "__main__":
    serve(NAVITRON_APP, port=80)
