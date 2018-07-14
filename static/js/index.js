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

let UPDATE_RATE = 100;

var overlay;
var heatmap;
var map;
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
    heatmap.setMap(map);
};

// Get the icon for the given type
function get_icon(type) {
    switch(type) {
        case 'shovel':
            return {
                url: '/static/images/shovel.png',
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25),
            };
        case 'shovel':
            return {
                url: '/static/images/shovel.png',
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25),
            };
        default:
            return {
                url: '/static/images/truck.png',
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25),
            };
    }
}

// Update equipment
function update_equipment() {
    // Send AJAX query
    $.ajax({ url: "getEquipmentUpdate", type: "POST" }).done(res => {
        for (var equipment in res) {
            var [type, lat, lng, sensor] = res[equipment];
            var lat_lng = new google.maps.LatLng(lat, lng);
            if (!(equipment in equipment_markers)) {
                equipment_markers[equipment] = new google.maps.Marker({map: map,
                                                                       icon: get_icon(type),
                                                                       title: type});
            }
            equipment_markers[equipment].setPosition(lat_lng);
            heatmap_points.push({location: lat_lng, weight: sensor});
        }
    });
    // Delay and repeat function
    setTimeout(update_equipment, UPDATE_RATE);
};

// Toggle viewing heatmap
function toggle_heatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
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
});
