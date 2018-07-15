let ROUGH_MIDDLEMOUNT_LAT = -23.025;
let ROUGH_MIDDLEMOUNT_LNG = 148.74;

let MIDDLEMOUNT_OVERLAY_SRC = '/static/images/mine_overlay_hidpi.png';
let MIDDLEMOUNT_OVERLAY_WIDTH = 14188;
let MIDDLEMOUNT_OVERLAY_HEIGHT = 15058;
let MIDDLEMOUNT_X_UNIT = 0.5;
let MIDDLEMOUNT_Y_UNIT = 0.5;

let MIDDLEMOUNT_LEFT = 675250;
let MIDDLEMOUNT_TOP = 7456250;
let MIDDLEMOUNT_RIGHT = MIDDLEMOUNT_LEFT + MIDDLEMOUNT_OVERLAY_WIDTH * MIDDLEMOUNT_X_UNIT;
let MIDDLEMOUNT_BOTTOM = MIDDLEMOUNT_TOP - MIDDLEMOUNT_OVERLAY_HEIGHT * MIDDLEMOUNT_Y_UNIT;
let MIDDLEMOUNT_ZONE_NUM = 55;
let MIDDLEMOUNT_ZONE_LETTER = 'K';

let SLOW_NUM_STEPS = 200;
let FAST_NUM_STEPS = 4;
let POLL_RATE = 10;
let UPDATE_RATE = 0;
let NUM_STEPS = SLOW_NUM_STEPS;

var can_poll = true;
var can_update = false;
var step = 0;
var overlay;
var heatmap;
var map;
var equipment = {};
var equipment_markers = {};
var heatmap_points = new google.maps.MVCArray();

// Initialise Middlemount Mine gMap
function init_map() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        // Default to the Middlemount site
        center: new google.maps.LatLng(ROUGH_MIDDLEMOUNT_LAT, ROUGH_MIDDLEMOUNT_LNG),
        mapTypeId: 'satellite'
    });
    map.setOptions({maxZoom: 18});

    var {latitude: left, longitude: top} = toLatLon(MIDDLEMOUNT_LEFT,
                                                    MIDDLEMOUNT_TOP,
                                                    MIDDLEMOUNT_ZONE_NUM,
                                                    MIDDLEMOUNT_ZONE_LETTER);
    var {latitude: right, longitude: bottom} = toLatLon(MIDDLEMOUNT_RIGHT,
                                                        MIDDLEMOUNT_BOTTOM,
                                                        MIDDLEMOUNT_ZONE_NUM,
                                                        MIDDLEMOUNT_ZONE_LETTER);
    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(right, top),
        new google.maps.LatLng(left, bottom)
    );

    overlay = new MiddlemountOverlay(bounds, MIDDLEMOUNT_OVERLAY_SRC, map);

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmap_points
    });
    heatmap.setOptions({radius: 30});
    heatmap.setMap(map);
};

// Get the icon for the given type
function get_icon(type) {
    switch(type) {
        case 'Truck':
            return {
                url: '/static/images/dump_truck.png',
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25),
            };
        case 'WaterTruck':
            return {
                url: '/static/images/water_truck.png',
                scaledSize: new google.maps.Size(50, 30),
                anchor: new google.maps.Point(25, 15),
            };
        case 'FuelTruck':
            return {
                url: '/static/images/fuel_truck.png',
                scaledSize: new google.maps.Size(50, 40),
                anchor: new google.maps.Point(25, 20),
            };
        case 'Shovel':
            return {
                url: '/static/images/shovel.png',
                scaledSize: new google.maps.Size(50, 40),
                anchor: new google.maps.Point(25, 20),
            };
        case 'Drill':
            return {
                url: '/static/images/drill.png',
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25),
            };
        case 'Dozer':
            return {
                url: '/static/images/dozer.png',
                scaledSize: new google.maps.Size(50, 30),
                anchor: new google.maps.Point(25, 15),
            };
        case 'Grader':
            return {
                url: '/static/images/grader.png',
                scaledSize: new google.maps.Size(50, 25),
                anchor: new google.maps.Point(25, 12.5),
            };
        case 'Loader':
            return {
                url: '/static/images/loader.png',
                scaledSize: new google.maps.Size(50, 40),
                anchor: new google.maps.Point(25, 20),
            };
        default:
            return {
                url: '/static/images/dump_truck.png',
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25),
            };
    }
}

// Update equipment
function update_equipment() {
    if (!can_poll) {
        setTimeout(update_equipment, POLL_RATE);
        return;
    }
    // Send AJAX query
    $.ajax({ url: "getEquipmentUpdate", type: "POST" }).done(res => {
        for (var equipment_id in res) {
            var [type, lat, lng, next_lat, next_lng, sensor] = res[equipment_id];
            lat /= 3600000
            lng /= 3600000
            next_lat /= 3600000
            next_lng /= 3600000
            var lat_lng = new google.maps.LatLng(lat, lng);
            if (!(equipment_id in equipment_markers)) {
                var marker_options = {map: map, icon: get_icon(type), title: type}
                equipment_markers[equipment_id] = new google.maps.Marker(marker_options);
            }
            equipment[equipment_id] = [type, lat, lng, next_lat, next_lng, sensor];
            // equipment_markers[equipment_id].setPosition(lat_lng);
            if (sensor != null) {
                heatmap_points.push({location: lat_lng, weight: sensor});
            }
        }
        can_poll = false;
        can_update = true;
    });
    // Delay and repeat function
    setTimeout(update_equipment, POLL_RATE);
};

// Update positions
function update_positions() {
    if (!can_update) {
        setTimeout(update_positions, UPDATE_RATE);
        return;
    }
    for (var equipment_id in equipment) {
        var marker = equipment_markers[equipment_id];
        var [type, lat, lng, next_lat, next_lng, sensor] = equipment[equipment_id];
        var from = new google.maps.LatLng(lat, lng);
        var to = new google.maps.LatLng(next_lat, next_lng);
        var interpolated = google.maps.geometry.spherical.interpolate(from, to, (1.0 / NUM_STEPS) * step);
        marker.setPosition(interpolated);
    }
    step += 1;
    if (step == NUM_STEPS) {
        step = 0;
        can_poll = true;
        can_update = false;
    }
    // Delay and repeat function
    setTimeout(update_positions, UPDATE_RATE);
};

// Toggle viewing heatmap
function toggle_heatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

// Toggle updating and polling speed
function toggle_speed() {
    step = 0;
    can_poll = true;
    can_update = false;
    NUM_STEPS = NUM_STEPS == SLOW_NUM_STEPS ? FAST_NUM_STEPS : SLOW_NUM_STEPS;
}

// Toggle viewing markers of the given type. If none specified, toggles all.
function toggle_markers(type) {
    for (var equipment in equipment_markers) {
        var marker = equipment_markers[equipment];
        if (type != null && marker.getTitle() != type) {
            continue;
        }
        marker.setVisible(!marker.getVisible());
    }
}

// Set up
google.maps.event.addDomListener(window, 'load', function() {
    init_map();
    update_equipment();
    update_positions();
});
