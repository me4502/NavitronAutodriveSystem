let ROUGH_MIDDLEMOUNT_LAT = -23.032194;
let ROUGH_MIDDLEMOUNT_LNG = 148.760222;

let MIDDLEMOUNT_OVERLAY_SRC = '/static/images/mine_overlay.png';
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

let HEATMAP_RATE = 100;
let EQUIPMENT_RATE = 100;

var overlay;
var map;
var equipment;
var heatmap_points = new google.maps.MVCArray();

// Setup middlemount mine on google maps
function init_map() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        // Default to the Middlemount mine site
        center: new google.maps.LatLng(ROUGH_MIDDLEMOUNT_LAT, ROUGH_MIDDLEMOUNT_LNG),
        mapTypeId: 'satellite'
    });

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
};

// Get new heatmap points
function get_new_heatmap_points() {
    // Send AJAX query
    $.ajax({ url: "getNewHeatmapPoints", type: "POST" }).done(res => {
        console.log('got response from getNewHeatmapPoints');
    });
    // Delay and repeat function
    setTimeout(get_new_heatmap_points, HEATMAP_RATE);
};

// Get current equipment points
function get_current_equipment_points() {
    // Send AJAX query
    $.ajax({ url: "getCurrentEquipmentPoints", type: "POST" }).done(res => {
        console.log('got response from getCurrentEquipmentPoints');
    });
    // Delay and repeat function
    setTimeout(get_current_equipment_points, EQUIPMENT_RATE);
};

// Set up
google.maps.event.addDomListener(window, 'load', function() {
    init_map();
    get_new_heatmap_points();
    get_current_equipment_points();
});



