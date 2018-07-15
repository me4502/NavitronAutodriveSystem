import csv
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
        sensor = float(sensor) / 100.0 if sensor != 'NULL' else None
        if (id_ not in equipment):
            equipment[id_] = []
        # update previous gps coord's next coord with current coord (lol nice explanation)
        if len(equipment[id_]) > 0:
            equipment[id_][-1][3] = lat
            equipment[id_][-1][4] = lng
        equipment[id_].append([type_, lat, lng, lat, lng, sensor])


@NAVITRON_APP.route("/")
def index():
    return render_template('index.html')


@NAVITRON_APP.route("/getEquipmentUpdate", methods=['POST'])
def get_equipment_update():
    global equipment_index
    equipment_update = {k: v[equipment_index % len(v)] for k, v in equipment.items()}
    equipment_index += DELTA_UPDATE
    return jsonify(equipment_update)


if __name__ == "__main__":
    serve(NAVITRON_APP, port=80)
