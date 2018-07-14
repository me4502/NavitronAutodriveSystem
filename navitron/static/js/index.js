var map;
function init_map() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: new google.maps.LatLng(-23.032194, 148.760222),
      mapTypeId: 'satellite'});
};