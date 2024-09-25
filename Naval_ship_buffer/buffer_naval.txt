var map;

var bufferType = 'Point';
var drawInteraction;
var BufferLayer;
var selecterangenew;
var tablename;
var modifiedWKT;
var wktVector;
var vector_source;

$('.metertokm').show();

$('.Kilometertomt').hide();


var inputLengthnew = document.getElementById("inputLengthnew").value;

var inputLengthkmbuffer = document.getElementById("inputLengthkmbuffer").value;


var span = $("span#outputMeters").text(inputLengthnew / 1000);
var span = $("span#outputMetersKm").text(inputLengthnew);
var span = $("span#outputMetersKm").text(inputLengthnew * 1000);
var spankm = $("span#outputKiloMetersbuffers").text(inputLengthkmbuffer * 1000);
var span = $("span#outputKiloMetersConversionbuffer").text(inputLengthnew);
var span = $("span#outputKiloMetersConversionbuffer").text(inputLengthkmbuffer / 1000);
var distanceUnit_normalnew = document.getElementById("distanceUnit");

var bridgeRoadDropdwn = document.getElementById("bridgeRoadId1");

var favorite = [];
$("#bridgeRoadId1").click(function() {
	var favorite = [];
	$.each($("input[name='checkbuffer']:checked"), function() {
		favorite.push($(this).val());
	});
	//        alert("My table name : " + favorite.join(", "));
});




distanceUnit_normalnew.onchange = function() {
	if (distanceUnit_normalnew.value == "Meter") {
		$('.metertokm').show();
		$('.Kilometertomt').hide();
		$('#inputLengthkmbuffer').val("");

	}

	else if (distanceUnit_normalnew.value == "Kilometer") {
		$('.Kilometertomt').show();
		$('.metertokm').hide();
		$('#inputLengthnew').val("");
	}
}








function LengthConverterMetertoKMbuffer(valNum) {

	document.getElementById("outputMeters").innerHTML = valNum / 1000;

	document.getElementById("outputMetersKm").innerHTML = valNum;
}



function LengthConverterInputbuffer(valNum) {


	var inputLengthnew = valNum;
	selecterangenew = inputLengthnew;

}


function LengthConverterKmbuffer(valNum) {

	var kmtemp = document.getElementById("outputKiloMetersbuffers").innerHTML = valNum * 1000;
	$("span#outputKiloMetersbuffers").html(valNum * 1000);
	document.getElementById("outputKiloMetersConversionbuffer").innerHTML = valNum;
	$("span#outputKiloMetersConversionbuffer").html(valNum);
	selecterangenew = kmtemp;

}


function LengthConverterInputKmbuffer(valNum) {
	var inputLengthkmbuffer = valNum;
	selecterangenew = inputLengthkmbuffer;

}






//var rangeinput = document.getElementById("rangeinput");

var distanceUnit_normalnew = document.getElementById("distanceUnit");
var type = 'Meter';

$("#distanceUnit").change(function() {

	type = $(this).children("option:selected").val();


});


var buffersource = new ol.source.Vector();
var buffersourceDraw = new ol.source.Vector();

var buffervectorDraw = new ol.layer.Vector({
	source: buffersourceDraw,
	style: new ol.style.Style({
		fill: new ol.style.Fill({
			color: 'rgba(255, 255, 255,0)'
		}),
		stroke: new ol.style.Stroke({
			color: 'red',
			width: 1
		}),
		image: new ol.style.Circle({

			fill: new ol.style.Fill({
				color: 'red'
			}),

			radius: 3
		})
	})
});



function buffer(m) {
	map = m;

}


function BufferselectedTypenew(gtype) {
	bufferType = gtype;
	activatebuffer_new();

}
var cql_buffer;
var wktbuff="";
function activatebuffer_new() {
	deactivateBufferDrawnew();

	modifiedWKT = null;

	var wkt = new ol.format.WKT();

	drawInteraction = new ol.interaction.Draw({
		source: buffervectorDraw.getSource(),
		type: bufferType
	});

	drawInteraction.on('drawstart', (e) => {

		map.removeLayer(BufferLayer);

		map.removeLayer(buffervectorDraw);

		buffersourceDraw.clear();
		buffersource.clear();

	});


	drawInteraction.on('drawend', (e) => {


		var feature = e.feature;


		const firstcordinates = feature.getGeometry().getFirstCoordinate();
		const lastcordinates = feature.getGeometry().getLastCoordinate();
		var lonlat = ol.proj.transform(firstcordinates, 'EPSG:3857', 'EPSG:4326');
		var lastlonlat = ol.proj.transform(lastcordinates, 'EPSG:3857', 'EPSG:4326');


		var cordinates = getCordinates_new(feature);

		var featureClone = feature.clone();
		featureClone.getGeometry().transform('EPSG:3857', 'EPSG:4326');
		modifiedWKT = wkt.writeFeature(featureClone);

		var format = new ol.format.WKT();
		map.removeLayer(wktVector);
		map.removeLayer(vector_source);
		wktfeature = format.readFeature(modifiedWKT, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857',
		});

		wktVector = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [wktfeature],
			})
		})
		var aesUtil = new AesUtil(128, 1000); 
		$.ajax({
			url: "getBufferWKT?_csrf="+token,
			type:'POST',
			dtaType:"json",
			async: false,
			data:{wkt:modifiedWKT,range:selecterangenew},
			success: function(response) {
				wktbuff = response[0].wkt;
					sourcefeature = format.readFeature(response[0].wkt, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857',
			});
			map.removeLayer(vector_source);
			vector_source = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: [sourcefeature],
				}),
				style: new ol.style.Style({
					fill: new ol.style.Fill({
						color: 'rgba(255, 255, 255,0)'
					}),
					stroke: new ol.style.Stroke({
						color: '#136f93',
						width: 3
					}),
					image: new ol.style.Circle({

						fill: new ol.style.Fill({
							color: 'red'
						}),

						radius: 3
					})
				})
			})
			map.addLayer(vector_source);
			}
		});
		var buferrangeng;
		if (distanceUnit_normalnew.value == "Meter") {
			buferrangeng = selecterangenew / 100000;
		}
		else if (distanceUnit_normalnew.value == "Kilometer") {
			buferrangeng = selecterangenew * 0.00001;
		}
		cql_buffer = 'DWITHIN(geom,' + modifiedWKT + ',' + buferrangeng + ',meters)';
		map.addLayer(buffervectorDraw);
		createBuffer_new(selecterangenew, modifiedWKT);
	});


	drawInteraction.setActive(true);
	map.addInteraction(drawInteraction);

}

function deleteBuffer() {

	buffersourceDraw.clear();
	buffersource.clear();


	for (var i = 0; i < layerselected.length; i++) {

		map.removeLayer(layerselected[i]);

	}


}




var layerselected = [];
function checkboxStatusChange_new(layer) {
	if (cql_buffer != undefined) {
		if ($("#" + layer).is(":checked") == true) {
				BufferLayer = new ol.layer.Tile({
					source: new ol.source.TileWMS({
						url: wmsurl,
						crossOrigin: 'anonymous',
						params: {
							'LAYERS': layer,
							version: '1.1.1',
							transparent: 'true',
							CQL_FILTER: cql_buffer
						}
					}),
					showLegend: true,
					name: 'Capital Cities',
					visible: true
				});
			dep = format.readFeature(wktbuff, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857',
			});
	 		var coords = dep.getGeometry().getCoordinates();
            var f = new ol.Feature(new ol.geom.Polygon(coords));
			var crop = new ol.filter.Crop({
				feature: f,
				wrapX: true,
				inner: false
			});
            var mask = new ol.filter.Mask({
                feature: f,
                wrapX: true,
                inner: false,
                fill: new ol.style.Fill({
                    color: [255, 255, 255, 0]
                })
            });
            BufferLayer.addFilter(mask);
            BufferLayer.addFilter(crop);
			map.addLayer(BufferLayer);
			layerselected.push(BufferLayer);
			activateClickforIdentify(BufferLayer)
		}
		else {
			for (var i = 0; i < layerselected.length; i++) {
				var b = layerselected[i].getSource().getParams().LAYERS;
				if (layer == b) {
					map.removeLayer(layerselected[i]);
				}
			}
		}
	}
}

function deactivateBufferDrawnew() {
	setCursor('');
	value = null;
	try {
		map.removeInteraction(drawInteraction);
		map.removeLayer(vectorLayer);

		buffersourceDraw.clear();
		buffersource.clear();

	} catch (error) { }
}


function createBuffer_new(range, wkt) {
	//var data = { "range": range, "wkt": wkt, "tablename": tablename };
		document.getElementById("your_id_name").checked = true;
		clickedValue_normalnew();
	//$(".jsonidataReport").attr("value", JSON.stringify(data));
	map.removeInteraction(drawInteraction);
}





function deactivateDraw_new() {

	setCursor('');
	value = null;
	try {
		map.removeInteraction(drawInteraction);

		buffersourceDraw.clear();


	} catch (error) { }
}

function linebuffetStyle_new() {

}


var bufferrange_new = $('#bufferrange_new');
bufferrange_new.on('change', function() {

	range.innerHTML = '';

	if (this.value !== "") {
		range.innerHTML = this.value;
		selecterangenew = this.value;
	}


});
function gettypeturf_new(cordinates) {

	let types = '';

	switch (bufferType) {


		case 'LineString':
			try {
				types = turf.lineString(cordinates);


			} catch (error) { }
			break;
		case 'Polygon':
			try {
				types = turf.polygon(cordinates);



			} catch (error) { }
			break;


		default:
			try {

				types = turf.point(cordinates);



			} catch (error) { }
			break;
	}


	return types;


}

function getCordinates_new(feature) {


	let cordinate = '';

	switch (bufferType) {


		case 'LineString':
			try {
				cordinate = feature.getGeometry().getCoordinates();


			} catch (error) { }
			break;
		case 'Polygon':
			try {
				cordinate = feature.getGeometry().getCoordinates();


			} catch (error) { }
			break;
		case 'Square':
			try {
				cordinate = feature.getGeometry().getCoordinates();


			} catch (error) { }
			break;

		default:
			try {
				cordinate = feature.getGeometry().getCoordinates();


			} catch (error) { }
			break;
	}


	return cordinate;
}
var checkboxesChecked = [];
function clickedValue_normalnew() {
	var checkboxes = document.getElementsByName('checkbuffer');
	for (var i = 0; i < checkboxes.length; i++) {
		if (checkboxes[i].checked) {
			checkboxesChecked.push(checkboxes[i].value);
		}
	}
	for (i = 0; i < checkboxesChecked.length; i++) {
		checkboxStatusChange_new(checkboxesChecked[i])
	}
}


var tablenames = [];
function clickedreport() {
	tablenames = [];
	var checkboxes = document.getElementsByName('checkbuffer');

	for (var i = 0; i < checkboxes.length; i++) {
		if (checkboxes[i].checked) {
			tablenames.push(checkboxes[i].value);
		}
	}
	var aesUtil = new AesUtil(128, 1000);
	var data = { "range": selecterangenew, "wkt": modifiedWKT, "tablename": tablenames };
	$(".jsonidataReport").attr("value",aesUtil.encrypt( JSON.stringify(data),"CD0M7ZMGXIphBqB3USmt13h7pxHtaMgL"));
	$("#bufferreport").submit();
}

	


function distance(tblname) {

	var data = null;
	$.ajax({
		url: contextPath + "distance/" + tblname + "/" + modifiedWKT + "/" + selecterangenew,
		method: "GET",
		dtaType: "json",
		async: false,
		data: {},
		success: function(j) {
			data = j;

			$("#distancebuffer").html(data[0].st_distance / 1000)

		},
		error: function(error) {
			alert(error);
		}
	});

}







