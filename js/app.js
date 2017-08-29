var map;

var styles = {
  default: null,
  retro: [
          {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
          {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
          {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{color: '#c9b2a6'}]
          },
          {
            featureType: 'administrative.land_parcel',
            elementType: 'geometry.stroke',
            stylers: [{color: '#dcd2be'}]
          },
          {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [{color: '#ae9e90'}]
          },
          {
            featureType: 'landscape.natural',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{color: '#93817c'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{color: '#a5b076'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#447530'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#f5f1e6'}]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{color: '#fdfcf8'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{color: '#f8c967'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{color: '#e9bc62'}]
          },
          {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry',
            stylers: [{color: '#e98d58'}]
          },
          {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry.stroke',
            stylers: [{color: '#db8555'}]
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{color: '#806b63'}]
          },
          {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'transit.line',
            elementType: 'labels.text.fill',
            stylers: [{color: '#8f7d77'}]
          },
          {
            featureType: 'transit.line',
            elementType: 'labels.text.stroke',
            stylers: [{color: '#ebe3cd'}]
          },
          {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{color: '#b9d3c2'}]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#92998d'}]
          }
        ]};

$(".searchbox").keyup(function(e){
  $(".searchbox").val($(this).val());
});

function initMap() {
  // Create the map with no initial style specified.
  // It therefore has default styling.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.6120641, lng: -121.5083665 },
    zoom: 16,
    mapTypeControl: false
  });

  map.setOptions({styles: styles['retro']});
  var geocoder = new google.maps.Geocoder();
  var searchMarker = new google.maps.Marker({ map: map, animation: google.maps.Animation.DROP, draggable: true, });

  $('.searchbutton').click(function() {
    geocodeAddress(geocoder, map, searchMarker);
  });
  $('.searchbox').keypress(function(e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
      geocodeAddress(geocoder, map, searchMarker);
    }
  });
}

function geocodeAddress(geocoder, resultsMap, searchMarker) {
  $("#result").html('<div style="text-align:center; margin-top:20px;"><img src="https://loading.io/spinners/hourglass/lg.sandglass-time-loading-gif.gif"></div>');
  $(".searchbox,.searchbutton").attr("disabled","disabled");
  $(".searchbutton").html("Searching ... ");
  var address = $(".searchbox").val();

  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      searchMarker.setPosition(results[0].geometry.location);

      lat = results[0].geometry.location.lat();
      lng = results[0].geometry.location.lng();

      riskCategory = $("#risk-category").val();
      siteClass = $("#site-class").val();
      $.ajax({
        method: 'GET',
        dataType: 'json',
        url: 'https://earthquake.usgs.gov/ws/designmaps/asce7-16.json',
        data: {latitude:lat, longitude: lng, riskCategory: riskCategory, siteClass: siteClass, title: "Seismic Maps"},
        success: function(data){
          displayInfo(results[0],data);
        },
        fail: function(jqXHR, textStatus, errorThrown){
          alert(errorThrown);
        },
      });
      $(".searchbox,.searchbutton").removeAttr("disabled");
      $(".searchbutton").html("Search");

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
      $(".searchbox,.searchbutton").removeAttr("disabled");
      $(".searchbutton").html("Search");
    }
  });
}


function displayInfo(goog,usgs){

  lat = goog.geometry.location.lat();
  lng = goog.geometry.location.lng();
  result_count =  $("#result > div").length;
  source = $("#result-template").html();
  template = Handlebars.compile(source);
  context = {
    result_count: result_count,
    formatted_address: goog.formatted_address,
    latlng: lat + ", " + lng,
    pga: usgs.response.data.pga,
    sds: usgs.response.data.sds,
    sd1: usgs.response.data.sd1,
    sms: usgs.response.data.sms,
    sm1: usgs.response.data.sm1,
    sdc: usgs.response.data.sdc,
    fa: usgs.response.data.fa,
    fv: usgs.response.data.fv,
    fpga: usgs.response.data.fpga,
    pgam: usgs.response.data.pgam,
    ssrt: usgs.response.data.ssrt,
    ssuh: usgs.response.data.ssuh,
    ssd: usgs.response.data.ssd
  };

  for(key in usgs.response.data)
  {
    if(key.indexOf("_error")>0){
      error_key = key.replace("_error","");
      context[error_key] = usgs.response.data[key];

      if(error_key == 'fv'){
        context.sd1 = usgs.response.data[key];
        context.sdc = usgs.response.data[key];
        context.sm1 = usgs.response.data[key];
      }
    }
  }

  var html = template(context);
  $("#result").html(html);

  if(usgs.response.data.sdSpectrum != null){
    sd_data = [["Period, T(sec)", "Sa(g)"]].concat(usgs.response.data.sdSpectrum);
    make_chart("sd_chart_" + result_count, sd_data, "Design Response Spectrum");
  }
  if(usgs.response.data.smSpectrum != null){
    sm_data = [["Period, T(sec)", "Sa(g)"]].concat(usgs.response.data.smSpectrum);
    make_chart("sm_chart_" + result_count, sm_data, "MCER Response Spectrum");
  }
  if(usgs.response.data.smSpectrum == null && usgs.response.data.sdSpectrum == null) {
    $(".spectrum-charts").hide();
  }
  else{
    $(".spectrum-charts").show();
  }
}


function make_chart(elm,chartData,chartTitle)
{
      google.charts.load('current', {'packages':['corechart','line']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable(chartData);

        var options = {
          title: chartTitle,
          vAxis: { title: 'Sa(g)'},
          hAxis : {title: 'Period, T (sec)'},
          legend: {'position': 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById(elm));

        chart.draw(data, options);
      }

}
