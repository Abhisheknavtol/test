function format_date(data_date) {
	let date = "";
	if (data_date != null && data_date != "") {
		date = data_date.split("-");
		date = date[2] + "-" + date[1] + "-" + date[0];
	}
	return date;
}

function format_date2(data_date2) {
	var date2 = "";
	if (data_date2 != null && data_date2 != "") {
		date2 = data_date2.split("-");
		date2 = date2[2] + "-" + date2[1] + "-" + date2[0];
	}
	return date2;
}

//12-06-2023
var between_dates = document.getElementById("between_dates");
between_dates.style.display = "none";
var on_dates = document.getElementById("on_dates");
between_dates.style.display = "none";

var received_data = [];

var table_names = [];
var layer_master = [];
//12-06-2023
var pointvector;
var linevector;
let value_flag = 0;
let value_chk = 0;
let condition_counter = 0;
let condition_builder = document.querySelector("#condition-builder");
var qb_layer;
let d = new Date();

$("#image_date_from1").val(d.toISOString().slice(0, 10));
$("#image_date_to1").val(d.toISOString().slice(0, 10));
$("#conditional_date").val(d.toISOString().slice(0, 10));

// let mydiv = document.getElementById("mydiv");
// mydiv.style.display = "none";
// mydiv.style.backgroundColor = "rgba(0,0,0,0.3)";
// mydiv.style.color = "white";

function qb_source_change() {
	options = '<option value="none">--- Select ---</option>';
	$.ajax({
		url: "qb_api1",
		method: "POST",
		dtaType: "json",
		async: false,
		data: { qb_parameter: $("#qb_source").val(), _csrf: token },
		success: function (j) {
			for (var i = 0; i < j.length; i++) {
				if (
					j[i].column_name != "geom" &&
					j[i].column_name != "wkt" &&
					j[i].column_name != "id"
				)
					options +=
						'<option value="' +
						j[i].column_name +
						'" >' +
						j[i].column_name +
						"</option>";
			}
		},
		error: function (error) {
			alert("Service unavailable try again later.");
		},
	});

	$("select#qb_column").html(options);
	$("#qb_operator").val("none");
	$("#qb_value_select").html('<option value="none">--- Select ---</option>');
	$("#qb_display").html("");
}

function qb_column_change() {
	options = '<option value="none">--- Select ---</option>';
	$.ajax({
		url: "qb_api2",
		method: "POST",
		dtaType: "json",
		async: false,
		data: {
			qb_parameter1: $("#qb_source").val(),
			qb_parameter2: $("#qb_column").val(),
			_csrf: token,
		},
		success: function (j) {
			for (var i = 0; i < j.length; i++) {
				options +=
					'<option value="' + j[i].value + '" >' + j[i].value + "</option>";
			}
		},
		error: function (error) {
			alert("Service unavailable try again later.");
		},
	});

	$("select#qb_value_select").html(options);
	$("#qb_operator").val("none");
	$("#qb_display").html("");
}
function qb_value_select_change() {
	$("#qb_display").html(
		"QUERY - SELECT " +
		$("#qb_source").val() +
		" WHERE " +
		$("#qb_column").val().toUpperCase() +
		" " +
		$("#qb_operator option:selected").text() +
		" " +
		$("#qb_value_select").val().toUpperCase()
	);
}
function qb_submit() {
	var search_value = $("#qb_value_select").val();
	var operator = $("#qb_operator").val();
	if (search_value == "none") {
		search_value = $("#qb_value_input").val();
		operator = "~*";
	}
	//	alert(search_value);
	$.ajax({
		url: "qb_api3",
		method: "POST",
		dtaType: "json",
		async: false,
		data: {
			qb_parameter1: $("#qb_source").val(),
			qb_parameter2: $("#qb_column").val(),
			qb_parameter3: operator,
			qb_parameter4: search_value,
			_csrf: token,
		},
		success: function (j) {
			$("#qb_result").show();
			$("#collapseOne").show();
			if (j.length > 0) {
				$("#qb_result_div").html(
					'<table class="table table-hover text-capitalize "  id="qb_result_table"></table>'
				);
				var my_columns = [];
				$.each(j[0], function (key, value) {
					var my_item = {};
					my_item.data = key;
					my_item.title = key;
					if (
						my_item.title != "geom" &&
						my_item.title != "wkt" &&
						my_item.title != "minx" &&
						my_item.title != "miny" &&
						my_item.title != "maxx" &&
						my_item.title != "maxy" &&
						my_item.title != "create_date" &&
						my_item.title != "update_date" &&
						my_item.title != "username" &&
						my_item.title != "userid"
					) {
						my_columns.push(my_item);
					}
				});
				$("#qb_result_table").DataTable({
					fixedHeader: true,
					dom: "Bfrtip",
					data: j,
					columns: my_columns,
				});
				qb_create_layer();
			} else {
				$("#qb_result_div").html("No Data");
			}
		},
		error: function (error) {
			alert("Service unavailable try again later.");
		},
	});
}
function qb_reset() {
	if (layer_master.length > 0) {
		for (let i = 0; i < layer_master.length; i++) {
			map.removeLayer(layer_master[i]);
		}
	}

	$("#clear_map").hide();
	if (pointvector != null) {
		map.removeLayer(pointvector);
	}

	if (linevector != null) {
		map.removeLayer(linevector);
	}

	$("#qb_column").html('<option value="none">--- Select ---</option>');
	$("#qb_value_select").html('<option value="none">--- Select ---</option>');

	$("#qb_source").val("none");
	$("#qb_operator").val("none");
	$("#qb_display").html("");
}
function findtable(source_name) {
	switch (
	source_name //table name cannot be seen on frontend
	) {
		case "COMBAT AIRCRAFT": {
			source_name = "demosample";
			break;
		}
		case "LOGISTICS AIRCRAFT": {
			source_name = "airvoice";
			break;
		}
		case "NAV": {
			source_name = "navxlsxmodel";
			break;
		}
		case "ELINT": {
			source_name = "elintxlsxmodel";
			break;
		}
		case "ARC IMINT": {
			source_name = "docreader";
			break;
		}
		case "CONSOLIDATED REPORT": {
			source_name = "consolidatedreport";
			break;
		}
		case "GOUND FORCE": {
			source_name = "groundforce";
			break;
		}
		default: {
			source_name = "Not Found";
			break;
		}
	}
	return source_name;
}

var qb_layer = "";
function qb_create_layer() {
	var layername = findtable($("#qb_source").val());

	var search_value = $("#qb_value_select").val();
	var operator = $("#qb_operator").val();
	if (search_value == "none") {
		search_value = "%" + $("#qb_value_input").val() + "%";
		operator = "LIKE";
	}

	var cql = $("#qb_column").val() + " " + operator + " '" + search_value + "'";

	if (qb_layer != "") {
		map.removeLayer(qb_layer);
	}
	qb_layer = new ol.layer.Tile({
		source: new ol.source.TileWMS({
			url: local_wmsurl, // 'http://192.168.1.89:8090/geoserver/cite/wms',
			//					crossOrigin: 'anonymous',
			params: {
				LAYERS: layername,
				format_options: "dpi:180",
				version: "1.1.1",
				CQL_FILTER: cql,
			},
		}),
		showLegend: true,
		//				maxResolution : 256,
		name: $("#qb_source").val(),
		visible: true,
	});
	map.addLayer(qb_layer);
	activatecustomidentity2(qb_layer);
}

//New Code

//ploting query data on map
function qb_create_layer2(table_column_names, l) {
	var query = "'" + table_column_names.id + "'";

	var search_value = "(" + query + ")";

	var cql = l + " in " + search_value + "";

	qb_layer = new ol.layer.Tile({
		source: new ol.source.TileWMS({
			url: local_wmsurl, // 'http://192.168.1.89:8090/geoserver/cite/wms',
			//crossOrigin: 'anonymous',
			params: {
				LAYERS: table_column_names.table_name,
				format_options: "dpi:180",
				version: "1.1.1",
				CQL_FILTER: cql,
			},
		}),
		showLegend: true,
		//				maxResolution : 256,
		name: $("#qb_source").val(),
		visible: true,
	});
	map.addLayer(qb_layer);
	layer_master.push(qb_layer);
	activatecustomidentity2(qb_layer);
}

function qb_operator_change2() {
	console.log("Inside qb_operator_change2");
	var val = document.getElementById("qb_operator2");
	if ($("select#qb_operator2").val() == "between") {
		between_dates.style.display = "block";
		on_dates.style.display = "none";
	}
	if ($("select#qb_operator2").val() == "=") {
		between_dates.style.display = "none";
		on_dates.style.display = "block";
	}
	if ($("select#qb_operator2").val() == ">") {
		between_dates.style.display = "none";
		on_dates.style.display = "block";
	}
	if ($("select#qb_operator2").val() == "<") {
		between_dates.style.display = "none";
		on_dates.style.display = "block";
	}
}

//search query submit
function qb_submit_1() {
	qb_reset();

	if (value_flag > 0) {
		let keywordinput = document.getElementById("keywordinput").value;
		var source_ticks2 = $('.source_filter_tick2');
		if (condition_builder.children.length == 0) {

			let table_query = [];
			let table_names = [];
			let conditions = "whole_para ~* '" + keywordinput.replace(/\)/g, "\\\)").replace(/\(/g, "\\\(") + "'";

			let j = 0, i, k = 0, condition_operator, query_date;
			//31-05-2023-starts------modified query builder------------

			if ($("select#qb_operator2").val() != 'none') {
				console.log($("select#qb_operator2").val())

				if ($("select#qb_operator2").val() == "between") {
					condition_operator = "between";
					query_date = $('#image_date_from1').val() + "," + $('#image_date_to1').val()
				}
				else if ($("select#qb_operator2").val() == "=") {
					condition_operator = '=';
					query_date = $("#conditional_date").val();
				}
				else if ($("select#qb_operator2").val() == ">") {
					condition_operator = ">";
					query_date = $("#conditional_date").val();
				}
				else if ($("select#qb_operator2").val() == "<") {
					condition_operator = "<";
					query_date = $("#conditional_date").val();
				}

			}
			else {
				query_date = "";
				condition_operator = "";
			}
			for (i = 0; i < source_ticks2.length; i++) {

				if (source_ticks2[i].checked) {
					table_names[j] = (source_ticks2[i].value);
					j++;
				}
			}
			var collapseOne_parent = document.getElementById('collapseOne_parent')
			collapseOne_parent.innerHTML = "";
			$.ajax({
				url: 'getmodifiedquery',
				method: "POST",
				dtaType: "text",
				async: false,
				data: {
					ticket2: table_names.join(","), _csrf: token, column_query: table_query.join(","),
					query_date: query_date, operators: condition_operator, condition1: conditions,

				},
				success: function (j) {

					var l = ""
					if (j != null) {

						$('#qb_result_parent').show();
						$('#collapseOne_parent').show();
						let div = document.createElement('div');
						div.setAttribute("id", "qb_innerdiv" + i);
						collapseOne_parent.append(div);
						$('#qb_innerdiv' + i).html('<table class="table table-hover text-capitalize "  id="qb_result_table' + i + '"></table>');

						var my_columns = [];
						$.each(j[0], function (key, value) {
							var my_item = {};
							my_item.data = key;
							my_item.title = key;

							if (my_item.title != "geom" && my_item.title != "wkt" && my_item.title != "minx" && my_item.title != "miny"
								&& my_item.title != "maxx" && my_item.title != "maxy" && my_item.title != "create_date" && my_item.title != "update_date"
								&& my_item.title != "username" && my_item.title != "userid" && my_item.title != "table_name" && my_item.title != "st_asgeojson" && my_item.title != "template" && my_item.title != "whole_para"
								&& my_item.title != "file_path" && my_item.title != "id") {
								my_columns.push(my_item);
							}

						});
						let x = $('#qb_result_table' + i).DataTable({
							fixedHeader: true,
							dom: 'Bfrtip',
							data: j,
							"columns": my_columns,
						});
						x.columns().visible(true)
					}

					for (var k of j) {
						l = "id";
						qb_create_layer2(k, l);


					}
					//startpath(j)
				},
				error: function (error) {
					alert("Service unavailable try again later.");
				}
			});

		}
		else {
			var flag = 0;
			var flag2 = 0;
			var source_ticks2 = $('.source_filter_tick2');
			let n = condition_builder.children.length;
			var table_names = [];

			if (source_ticks2.length == 1 && n == 0) {
				console.log("yaah")
			}

			for (i = 0; i < source_ticks2.length; i++) {

				if (source_ticks2[i].checked) {
					table_names[j] = (source_ticks2[i].value);
					flag = 1;
					j++;
				}
			}

			if (flag == 0) {
				alert("please select a table")
			}
			else {

				let query = [];
				let table_query = [];

				var table_names = [];

				var conditions = "";



				var all_columns = document.getElementById("all_columns");
				if (all_columns.checked) {
					if (n > 0) {

						for (let ele of condition_builder.children) {

							let temp = ``;
							if (ele.children[0].id.includes("div3select")) {
								temp += ele.children[0].value.trim();
							}
							else {

								if (ele.children[0].value == "lat" || ele.children[0].value == "lon") {
									temp += ele.children[0].value + " = '"
										+ ele.children[1].value.trim() + "'"
								}
								else if (ele.children[0].value == "navalvesseltype") {
									temp += "whole_para" + " ~* '"
										+ ele.children[1].value.trim() + "'"
								}

								else if (ele.children[0].value == "class_of_vessel") {
									temp += "nameofvessel" + " ~* '"
										+ ele.children[1].value.trim() + "'"
								}
								else if (ele.children[0].value == "docreportdate") {
									temp += "docreportdate" + " ~* '"
										+ format_date2(ele.children[1].value.trim()) + "'"
								}
								else if (ele.children[0].value == "docreportnumber") {
									temp += ele.children[0].value + " like '%"
										+ ele.children[1].value.trim() + "%'"
								}
								else if (ele.children[0].value == "dateofinterception") {
									temp += "dateofinterception" + " ~* '"
										+ format_date2(ele.children[1].value.trim()) + "'"
								}
								else {
									if (ele.children[1].value == "") {
										console.log("null value");
										flag2 = 1;
									}
									temp += ele.children[0].value + " ~* '"
										+ ele.children[1].value.trim() + "'"
								}
							}
							query.push(temp.replace(/\)/g, "\\\)").replace(/\(/g, "\\\("));
						}

						conditions = query.join(" ");

					}

					var j = 0, i, k = 0, condition_operator, query_date;
					//31-05-2023-starts------modified query builder------------

					if ($("select#qb_operator2").val() != 'none') {
						console.log($("select#qb_operator2").val())

						if ($("select#qb_operator2").val() == "between") {
							condition_operator = "between";
							query_date = $('#image_date_from1').val() + "," + $('#image_date_to1').val()
						}
						else if ($("select#qb_operator2").val() == "=") {
							condition_operator = '=';
							query_date = $("#conditional_date").val();
						}
						else if ($("select#qb_operator2").val() == ">") {
							condition_operator = ">";
							query_date = $("#conditional_date").val();
						}
						else if ($("select#qb_operator2").val() == "<") {
							condition_operator = "<";
							query_date = $("#conditional_date").val();
						}

					}
					else {
						query_date = "";
						condition_operator = "";
					}


					for (i = 0; i < source_ticks2.length; i++) {

						if (source_ticks2[i].checked) {
							table_names[j] = (source_ticks2[i].value);
							j++;
						}

					}
					console.log(table_query)
					var collapseOne_parent = document.getElementById('collapseOne_parent')
					collapseOne_parent.innerHTML = "";
					$.ajax({
						url: 'getmodifiedquery',
						method: "POST",
						dtaType: "text",
						async: false,
						data: {
							ticket2: table_names.join(","), _csrf: token, column_query: table_query.join(","),
							query_date: query_date, operators: condition_operator, condition1: conditions,

						},
						success: function (j) {
							var l = ""
							if (j != null) {

								$('#qb_result_parent').show();
								$('#collapseOne_parent').show();
								let div = document.createElement('div');
								div.setAttribute("id", "qb_innerdiv" + i);
								collapseOne_parent.append(div);
								$('#qb_innerdiv' + i).html('<table class="table table-hover text-capitalize "  id="qb_result_table' + i + '"></table>');

								var my_columns = [];
								$.each(j[0], function (key, value) {
									var my_item = {};
									my_item.data = key;
									my_item.title = key;

									if (my_item.title != "geom" && my_item.title != "wkt" && my_item.title != "minx" && my_item.title != "miny"
										&& my_item.title != "maxx" && my_item.title != "maxy" && my_item.title != "create_date" && my_item.title != "update_date"
										&& my_item.title != "username" && my_item.title != "userid" && my_item.title != "table_name" && my_item.title != "st_asgeojson" && my_item.title != "template" && my_item.title != "id" && my_item.title != "whole_para") {
										my_columns.push(my_item);
									}
								});
								$('#qb_result_table' + i).DataTable({
									fixedHeader: true,
									dom: 'Bfrtip',
									data: j,
									"columns": my_columns,
								});
								var obj2 = []
								var fg = 0;
								for (var m = 0; m < j.length; m++) {
									if (j[m].table_name == "navxlsxmodel") {
										fg = 1;
										obj2[m] = j[m];
									}
								}
								if (fg == 1) {
									startpath(obj2);
								}
								console.log(obj2);
								for (var k of j) {
									if (k.table_name != "navxlsxmodel") {
										l = "id";
										qb_create_layer2(k, l);

									}

								}


							}
							//startpath(j)
						},
						error: function (error) {
							alert("Service unavailable try again later.");
						}
					});

				}
				else if (all_columns.checked == false && n > 0) {
					var table_names = [];
					if (n > 0) {
						if (keywordinput != "") {
							conditions = "whole_para ~* '" + keywordinput + "' or ";
							// console.log(condition_builder.children + "-----------------------");
							table_query.push("whole_para");
						}

						for (let ele of condition_builder.children) {

							let temp = ``;
							if (ele.children[0].id.includes("div3select")) {
								temp += ele.children[0].value.trim();
							}
							else {

								if (ele.children[0].value == "lat" || ele.children[0].value == "lon") {

									temp += ele.children[0].value + " = '"
										+ ele.children[1].value.trim() + "'"
								}
								else if (ele.children[0].value == "navalvesseltype") {
									temp += "whole_para" + " ~* '"
										+ ele.children[1].value.trim() + "'"
								}
								else if (ele.children[0].value == "class_of_vessel") {
									temp += "nameofvessel" + " ~* '"
										+ ele.children[1].value.trim() + "'"
								}
								else if (ele.children[0].value == "docreportnumber") {
									temp += ele.children[0].value + " like '%"
										+ ele.children[1].value.trim() + "%'"
								}
								else if (ele.children[0].value == "docreportdate") {
									temp += "docreportdate" + " ~* '"
										+ format_date2(ele.children[1].value.trim()) + "'"
								}
								else if (ele.children[0].value == "dateofinterception") {
									temp += "dateofinterception" + " ~* '"
										+ format_date2(ele.children[1].value.trim()) + "'"
								}
								else {
									if (ele.children[1].value == "") {
										console.log("null value");
										flag2 = 1;
									}
									temp += ele.children[0].value + " ~* '"
										+ ele.children[1].value.trim() + "'"
								}
							}
							query.push(temp.replace(/\)/g, "\\\)").replace(/\(/g, "\\\("));
						}


						conditions = conditions + query.join(" ");
						for (let ele of condition_builder.children) {
							let temp = ``;
							if (!ele.children[0].id.includes("div3select")) {
								if (ele.children[0].value == "class_of_vessel") {
									temp += "nameofvessel";
									table_query.push(temp);
								}
								else if (ele.children[0].value == "lat lon") {
									temp += "latlon";
									table_query.push(temp);
								}
								else {
									temp += ele.children[0].value;
									table_query.push(temp);
								}
							}
						}
					}



					var j = 0, i, k = 0, condition_operator, query_date;
					//31-05-2023-starts------modified query builder------------

					if ($("select#qb_operator2").val() != 'none') {
						console.log($("select#qb_operator2").val())

						if ($("select#qb_operator2").val() == "between") {
							condition_operator = "between";
							query_date = $('#image_date_from1').val() + "," + $('#image_date_to1').val()
						}
						else if ($("select#qb_operator2").val() == "=") {
							condition_operator = '=';
							query_date = $("#conditional_date").val();
						}
						else if ($("select#qb_operator2").val() == ">") {
							condition_operator = ">";
							query_date = $("#conditional_date").val();
						}
						else if ($("select#qb_operator2").val() == "<") {
							condition_operator = "<";
							query_date = $("#conditional_date").val();
						}
					}
					else {
						query_date = "";
						condition_operator = "";
					}

					var source_ticks2 = $('.source_filter_tick2');

					for (i = 0; i < source_ticks2.length; i++) {

						if (source_ticks2[i].checked) {
							table_names[j] = (source_ticks2[i].value);
							j++;
						}
					}
					console.log(table_query)
					var collapseOne_parent = document.getElementById('collapseOne_parent')
					collapseOne_parent.innerHTML = "";
					$.ajax({
						url: 'getmodifiedquery',
						method: "POST",
						dtaType: "text",
						async: false,
						data: {
							ticket2: table_names.join(","), _csrf: token, column_query: table_query.join(","),
							query_date: query_date, operators: condition_operator, condition1: conditions,

						},
						success: function (j) {
							var l = "";
							if (j != null) {

								$('#qb_result_parent').show();
								$('#collapseOne_parent').show();
								let div = document.createElement('div');
								div.setAttribute("id", "qb_innerdiv" + i);
								collapseOne_parent.append(div);
								$('#qb_innerdiv' + i).html('<table class="table table-hover text-capitalize "  id="qb_result_table' + i + '"></table>');

								var my_columns = [];
								$.each(j[0], function (key, value) {
									var my_item = {};
									my_item.data = key;
									my_item.title = key;

									if (my_item.title != "geom" && my_item.title != "wkt" && my_item.title != "minx" && my_item.title != "miny"
										&& my_item.title != "maxx" && my_item.title != "maxy" && my_item.title != "create_date" && my_item.title != "update_date"
										&& my_item.title != "username" && my_item.title != "userid" && my_item.title != "table_name" && my_item.title != "st_asgeojson" && my_item.title != "template" && my_item.title != "id" && my_item.title != "whole_para") {

										my_columns.push(my_item);
									}
								});
								$('#qb_result_table' + i).DataTable({
									fixedHeader: true,
									dom: 'Bfrtip',
									data: j,
									"columns": my_columns,
								});
								console.log(j)
								var obj2 = [];
								var obj3 = [];
								var obj4 = [];
								var fg = 0;
								var fg2 = 0;
								var fg3 = 0;
								cnt = 0;
								for (var m = 0; m < j.length; m++) {
									if (j[m].table_name == "navxlsxmodel") {
										fg = 1;
										obj2[m] = j[m];
									}
									else if (j[m].table_name == "elintxlsxmodel" && j[m].template == "TEMPLATE-4") {
										fg2 = 1;
										obj3[m] = j[m];
									}
									else if (j[m].table_name == "elintxlsxmodel" && j[m].template != "TEMPLATE-4") {
										fg3 = 1;
										obj4[cnt] = j[m];
										cnt++;

									}
								}

								if (flag2 == 1) {
									for (var k of j) {
										l = "id";
										qb_create_layer2(k, l);
									}
								}
								else if (fg3 == 1) {
									for (var k of j) {
										l = "id";
										qb_create_layer2(k, l);
									}
								}
								else if (fg == 1) {
									startpath(obj2);
								}
								else if (fg2 == 1) {
									startpath(obj3);
								}
								for (var k of j) {
									if (k.table_name != "navxlsxmodel" && k.template != "TEMPLATE-4") {
										l = "id";
										qb_create_layer2(k, l);
									}
								}
							}
						},
						error: function (error) {
							alert("Service unavailable try again later.");
						}
					});
				}
				else {
					alert("please add columns or tick on Want to see all columns")
				}
			}
		}
	}
	else {
		var flag = 0;
		var flag2 = 0;
		var source_ticks2 = $('.source_filter_tick2');
		let n = condition_builder.children.length;
		var table_names = [];

		if (source_ticks2.length == 1 && n == 0) {
			console.log("yaah")
		}

		for (i = 0; i < source_ticks2.length; i++) {
			if (source_ticks2[i].checked) {
				table_names[j] = (source_ticks2[i].value);
				flag = 1;
				j++;
			}
		}

		if (flag == 0) {
			alert("please select a table")
		}
		else {
			let query = [];
			let table_query = [];
			var table_names = [];
			var conditions = "";

			var all_columns = document.getElementById("all_columns");
			if (all_columns.checked) {
				if (n > 0) {

					for (let ele of condition_builder.children) {

						let temp = ``;
						if (ele.children[0].id.includes("div3select")) {
							temp += ele.children[0].value.trim();
						}
						else {

							if (ele.children[0].value == "lat" || ele.children[0].value == "lon") {
								temp += ele.children[0].value + " = '"
									+ ele.children[1].value.trim() + "'"
							}
							else if (ele.children[0].value == "navalvesseltype") {
								temp += "whole_para" + " ~* '"
									+ ele.children[1].value.trim() + "'"
							}
							else if (ele.children[0].value == "class_of_vessel") {
								temp += "nameofvessel" + " ~* '"
									+ ele.children[1].value.trim() + "'"
							}
							else if (ele.children[0].value == "docreportnumber") {
								temp += ele.children[0].value + " like '%"
									+ ele.children[1].value.trim() + "%'"
							}
							else if (ele.children[0].value == "docreportdate") {
								temp += "docreportdate" + " ~* '"
									+ format_date2(ele.children[1].value.trim()) + "'"
							}
							else if (ele.children[0].value == "dateofinterception") {
								temp += "dateofinterception" + " ~* '"
									+ format_date2(ele.children[1].value.trim()) + "'"
							}
							else {
								if (ele.children[1].value == "") {
									console.log("null value");
									flag2 = 1;
								}
								temp += ele.children[0].value + " ~* '"
									+ ele.children[1].value.trim() + "'"
							}
						}
						query.push(temp.replace(/\)/g, "\\\)").replace(/\(/g, "\\\("));
					}
					conditions = query.join(" ");
				}

				var j = 0, i, k = 0, condition_operator, query_date;
				//31-05-2023-starts------modified query builder------------

				if ($("select#qb_operator2").val() != 'none') {
					console.log($("select#qb_operator2").val())

					if ($("select#qb_operator2").val() == "between") {
						condition_operator = "between";
						query_date = $('#image_date_from1').val() + "," + $('#image_date_to1').val()
					}
					else if ($("select#qb_operator2").val() == "=") {
						condition_operator = '=';
						query_date = $("#conditional_date").val();
					}
					else if ($("select#qb_operator2").val() == ">") {
						condition_operator = ">";
						query_date = $("#conditional_date").val();
					}
					else if ($("select#qb_operator2").val() == "<") {
						condition_operator = "<";
						query_date = $("#conditional_date").val();
					}
				}
				else {
					query_date = "";
					condition_operator = "";
				}

				for (i = 0; i < source_ticks2.length; i++) {
					if (source_ticks2[i].checked) {
						table_names[j] = (source_ticks2[i].value);
						j++;
					}
				}
				console.log(table_query)
				var collapseOne_parent = document.getElementById('collapseOne_parent')
				collapseOne_parent.innerHTML = "";
				$.ajax({
					url: 'getmodifiedquery',
					method: "POST",
					dtaType: "text",
					async: false,
					data: {
						ticket2: table_names.join(","), _csrf: token, column_query: table_query.join(","),
						query_date: query_date, operators: condition_operator, condition1: conditions,

					},
					success: function (j) {
						var l = ""
						if (j != null) {

							$('#qb_result_parent').show();
							$('#collapseOne_parent').show();
							let div = document.createElement('div');
							div.setAttribute("id", "qb_innerdiv" + i);
							collapseOne_parent.append(div);
							$('#qb_innerdiv' + i).html('<table class="table table-hover text-capitalize "  id="qb_result_table' + i + '"></table>');

							var my_columns = [];
							$.each(j[0], function (key, value) {
								var my_item = {};
								my_item.data = key;
								my_item.title = key;

								if (my_item.title != "geom" && my_item.title != "wkt" && my_item.title != "minx" && my_item.title != "miny"
									&& my_item.title != "maxx" && my_item.title != "maxy" && my_item.title != "create_date" && my_item.title != "update_date"
									&& my_item.title != "username" && my_item.title != "userid" && my_item.title != "table_name" && my_item.title != "st_asgeojson" && my_item.title != "template" && my_item.title != "id" && my_item.title != "whole_para") {
									my_columns.push(my_item);
								}
							});
							$('#qb_result_table' + i).DataTable({
								fixedHeader: true,
								dom: 'Bfrtip',
								data: j,
								"columns": my_columns,
							});
							var obj2 = []
							var fg = 0;
							for (var m = 0; m < j.length; m++) {
								if (j[m].table_name == "navxlsxmodel") {
									fg = 1;
									obj2[m] = j[m];
								}
							}
							if (fg == 1) {
								startpath(obj2);
							}
							console.log("--------------------------")
							console.log(obj2);
							for (var k of j) {
								if (k.table_name != "navxlsxmodel") {
									l = "id";
									qb_create_layer2(k, l);

								}

							}


						}
						//startpath(j)
					},
					error: function (error) {
						alert("Service unavailable try again later.");
					}
				});

			}
			else if (all_columns.checked == false && n > 0) {
				var table_names = [];
				if (n > 0) {

					for (let ele of condition_builder.children) {

						let temp = ``;
						if (ele.children[0].id.includes("div3select")) {
							temp += ele.children[0].value.trim();
						}
						else {
							if (ele.children[0].value == "lat" || ele.children[0].value == "lon") {

								temp += ele.children[0].value + " = '"
									+ ele.children[1].value.trim() + "'"
							}
							else if (ele.children[0].value == "navalvesseltype") {
								temp += "whole_para" + " ~* '"
									+ ele.children[1].value.trim() + "' "
							}
							else if (ele.children[0].value == "class_of_vessel") {
								temp += "nameofvessel" + " ~* '"
									+ ele.children[1].value.trim() + "'"
							}
							else if (ele.children[0].value == "docreportnumber") {
								temp += ele.children[0].value + " like '%"
									+ ele.children[1].value.trim() + "%'"
							}
							else if (ele.children[0].value == "docreportdate") {
								temp += "docreportdate" + " ~* '"
									+ format_date2(ele.children[1].value.trim()) + "'"
							}
							else if (ele.children[0].value == "dateofinterception") {
								temp += "dateofinterception" + " ~* '"
									+ format_date2(ele.children[1].value.trim()) + "'"
							}
							else {
								if (ele.children[1].value == "") {
									flag2 = 1;
								}
								temp += ele.children[0].value + " ~* '"
									+ ele.children[1].value.trim() + "'"
							}
						}
						query.push(temp.replace(/\)/g, "\\\)").replace(/\(/g, "\\\("));
					}

					conditions = conditions + query.join(" ");
					for (let ele of condition_builder.children) {
						let temp = ``;
						if (!ele.children[0].id.includes("div3select")) {

							if (ele.children[0].value == "class_of_vessel") {
								temp += "nameofvessel";
								table_query.push(temp);
							}
							else if (ele.children[0].value == "lat lon") {
								temp += "latlon";
								table_query.push(temp);
							}
							else {
								temp += ele.children[0].value;
								table_query.push(temp);
							}
						}
					}
				}


				var j = 0, i, k = 0, condition_operator, query_date;
				//31-05-2023-starts------modified query builder------------

				if ($("select#qb_operator2").val() != 'none') {
					console.log($("select#qb_operator2").val())

					if ($("select#qb_operator2").val() == "between") {
						condition_operator = "between";
						query_date = $('#image_date_from1').val() + "," + $('#image_date_to1').val()
					}
					else if ($("select#qb_operator2").val() == "=") {
						condition_operator = '=';
						query_date = $("#conditional_date").val();
					}
					else if ($("select#qb_operator2").val() == ">") {
						condition_operator = ">";
						query_date = $("#conditional_date").val();
					}
					else if ($("select#qb_operator2").val() == "<") {
						condition_operator = "<";
						query_date = $("#conditional_date").val();
					}

				}
				else {
					query_date = "";
					condition_operator = "";
				}



				var source_ticks2 = $('.source_filter_tick2');



				for (i = 0; i < source_ticks2.length; i++) {

					if (source_ticks2[i].checked) {
						table_names[j] = (source_ticks2[i].value);
						j++;
					}
				}
				console.log(table_query)
				var collapseOne_parent = document.getElementById('collapseOne_parent')
				collapseOne_parent.innerHTML = "";
				$.ajax({
					url: 'getmodifiedquery',
					method: "POST",
					dtaType: "text",
					async: false,
					data: {
						ticket2: table_names.join(","), _csrf: token, column_query: table_query.join(","),
						query_date: query_date, operators: condition_operator, condition1: conditions,

					},
					success: function (j) {
						var l = "";
						if (j != null) {

							$('#qb_result_parent').show();
							$('#collapseOne_parent').show();
							let div = document.createElement('div');
							div.setAttribute("id", "qb_innerdiv" + i);
							collapseOne_parent.append(div);
							$('#qb_innerdiv' + i).html('<table class="table table-hover text-capitalize "  id="qb_result_table' + i + '"></table>');

							var my_columns = [];
							$.each(j[0], function (key, value) {
								var my_item = {};
								my_item.data = key;
								my_item.title = key;

								if (my_item.title != "geom" && my_item.title != "wkt" && my_item.title != "minx" && my_item.title != "miny"
									&& my_item.title != "maxx" && my_item.title != "maxy" && my_item.title != "create_date" && my_item.title != "update_date"
									&& my_item.title != "username" && my_item.title != "userid" && my_item.title != "table_name" && my_item.title != "st_asgeojson" && my_item.title != "template" && my_item.title != "id" && my_item.title != "whole_para") {

									my_columns.push(my_item);
								}
							});
							$('#qb_result_table' + i).DataTable({
								fixedHeader: true,
								dom: 'Bfrtip',
								data: j,
								"columns": my_columns,
							});
							// console.log("--------------------------")
							// console.log(j)
							var obj2 = [];
							var obj3 = [];
							var obj4 = [];
							let obj5 = []
							var fg = 0;
							var fg2 = 0;
							var fg3 = 0;
							let fg4 = 0;
							cnt = 0;
							for (var m = 0; m < j.length; m++) {
								// console.log("temp5----------------")
								if (j[m].table_name == "navxlsxmodel") {
									fg4 = 1;
									obj5[m] = j[m];
								}
								if (j[m].table_name == "airvoice") {
									fg = 1;
									obj2[m] = j[m];
								}
								else if (j[m].table_name == "elintxlsxmodel" && j[m].template == "TEMPLATE-4") {
									fg2 = 1;
									obj3[m] = j[m];
								}
								else if (j[m].table_name == "elintxlsxmodel" && j[m].template != "TEMPLATE-4") {
									fg3 = 1;
									obj4[cnt] = j[m];
									cnt++;

								}
							}

							if (flag2 == 1) {
								for (var k of j) {
									l = "id";
									qb_create_layer2(k, l);
								}
							}
							else if (fg3 == 1) {
								for (var k of j) {
									l = "id";
									qb_create_layer2(k, l);
								}
							}
							else if (fg == 1) {
								startpath(obj2);
							}
							else if (fg2 == 1) {
								startpath(obj3);
							}
							if (fg4 == 1) {
								startpath(obj5);
							}
							for (var k of j) {
								if (k.table_name != "navxlsxmodel" && k.template != "TEMPLATE-4") {
									l = "id";
									qb_create_layer2(k, l);

								}

							}
						}


					},
					error: function (error) {
						alert("Service unavailable try again later.");
					}
				});
			}
			else {
				alert("please add columns or tick on Want to see all columns")
			}

		}

	}

}


//alert("Please Select The Date Range")

function getcolumns() {

	var btncolumn1 = document.getElementById('sb_column1');
	btncolumn1.addEventListener("click", () => {

		var table_names = [];
		var j = 0;
		var source_ticks2 = $('.source_filter_tick2');
		for (i = 0; i < source_ticks2.length; i++) {

			if (source_ticks2[i].checked) {
				table_names[j] = "'" + (source_ticks2[i].value) + "'";
				j++;
			}
		}
		let mycolumn = document.getElementById("sb_column");


		$.ajax({
			url: 'sq_api1',
			method: "POST",
			dtaType: "text",
			async: false,
			data: {
				selected_tables: table_names.join(","), _csrf: token,

			},
			success: function (l) {
				for (var i = 0; i < l.length; i++) {
					mydiv = document.createElement("div");
					var name = l[i].column_name;


					mydiv.setAttribute("class", "col")
					mydiv.setAttribute("class", "d-flex");

					mydiv.append(myoption);
					mydiv.append(mylabel);

					mycolumn.append(mydiv);

				}
			},
			error: function (error) {
				console.log("Service unavailable try again later.");
			}
		});
	})
}

//getcolumns();
function add_columns(e) {

	table_names.concat(e.value)
	//let mycolumn = document.getElementById("sb_column");
	let column_condition = document.getElementById("column_condition");
	if (e.checked == false) {
		table_names.pop()
	}
	var j = 0;
	var source_ticks2 = $('.source_filter_tick2');
	for (i = 0; i < source_ticks2.length; i++) {

		if (source_ticks2[i].checked) {
			table_names[j] = "'" + (source_ticks2[i].value) + "'";
			j++;
		}
	}

	var column_array = [];
	var column_obj = {};

	if (table_names.length > 0) {

		$.ajax({
			url: 'sq_api1',
			method: "POST",
			dtaType: "text",
			async: false,
			data: {
				//selected_tables: table_names.join(","), _csrf: token,
				selected_tables: table_names.join(","), _csrf: token,
			},
			success: function (l) {

				//received_data = l;

				//mycolumn.innerHTML = "";
				//column_condition.innerHTML = "";
				for (var i = 0; i < l.length; i++) {

					let mydiv = document.createElement("div");
					let mydropdown = document.createElement("option")
					var name = l[i].column_name;



					mydiv.setAttribute("class", "col")
					mydiv.setAttribute("class", "d-flex");

					mydropdown.append(name);
					mydiv.append(mydropdown);
					column_array.push(l[i].column_name)
					//mycolumn.append(mydiv);
					mydropdown.setAttribute("value", name)
					//column_condition.append(mydropdown);



				}
				//column_obj[table_names]
				received_data = column_array;
				console.log(table_names)
				update_condition_column();
			},
			error: function (error) {
				console.log("Service unavailable try again later.");
			}
		});

	}

}
//add query conditions starts-------------------
let add_condition = document.getElementById("add-condition");

let condition_flag = 0;

add_condition.addEventListener("click", function () {
	var div = document.createElement("div");

	if (condition_flag != 0 && (condition_builder.children.length != 0)) {
		var div3 = document.createElement("div");
		div3.style.width = "65px";
		div3.style.marginTop = "10px";
		div3.setAttribute("id", "div3_id" + condition_counter)
		var div3select = document.createElement("select");
		div3select.setAttribute("class", "form-control")
		div3select.setAttribute("id", "div3select" + condition_counter);
		var option1 = document.createElement("option");
		var option2 = document.createElement("option");
		option1.setAttribute("value", "and");
		option2.setAttribute("value", "or");
		option1.append("AND");
		option2.append("OR");
		div3select.append(option1)
		div3select.append(option2)
		div3.append(div3select);
		condition_builder.append(div3)

	}

	var column_condition_select = document.createElement("select");
	//var column_condition_select2 = document.createElement("select");
	//var ddd = document.createElement("div")
	//ddd.setAttribute("id", "my_Dropdown");
	column_condition_select.setAttribute("onchange", "column_onchange(this)");
	column_condition_select.setAttribute("id", "select_doi" + condition_counter);
	column_condition_select.setAttribute("class", "form-control");



	//column_condition_select2.setAttribute("id", "select_doi2" + condition_counter);
	//column_condition_select2.setAttribute("class", "form-control")
	div.style.marginTop = "10px";
	if (condition_builder.children.length < received_data.length - 1) {
		for (let i = 0; i < received_data.length; i++) {

			let mydropdown2 = document.createElement("option");

			mydropdown2.setAttribute("value", received_data[i]);

			mydropdown2.append(received_data[i]);
			column_condition_select.append(mydropdown2)
			condition_builder.append(column_condition_select)
		}
		document.getElementById("qb_submit_btn").removeAttribute("disabled");
		//	let input1 = document.createElement("input");
		let valueinput = document.createElement("input");
		valueinput.setAttribute("list", "my_lists" + condition_counter);

		let button1 = document.createElement("button");
		//input1.setAttribute("id", "input" + condition_counter);
		button1.setAttribute("class", "btn btn-sm btn-danger text-white")
		button1.innerHTML = "Remove";
		button1.setAttribute("id", "button" + condition_counter);
		//input1.setAttribute("onclick", "My_Dropdown(this)");
		//	input1.setAttribute("class", "form-control")
		valueinput.setAttribute("class", "form-control");
		valueinput.setAttribute("id", "valueinputs" + condition_counter)
		valueinput.setAttribute("autocomplete", "off")
		div.setAttribute("class", "col d-flex")
		div.setAttribute("id", "div" + condition_counter);
		div.append(column_condition_select)
		//div.append(input1)
		let my_datalist = document.createElement("datalist");
		my_datalist.setAttribute("id", "my_lists" + condition_counter);
		valueinput.append(my_datalist)
		div.append(valueinput);
		//div.append(ddd)
		//div.append(column_condition_select2)
		div.append(button1)
		button1.setAttribute("onclick", "remove_condition(this)")
		condition_builder.append(div)

		if (condition_flag != 0 && (condition_builder.children.length != 0)) {
			var div2 = document.createElement("div");
			div2.style.width = "65px";
			div2.setAttribute("id", "div2_id" + condition_counter)
			var div2select = document.createElement("select");
			div2select.setAttribute("class", "form-control")
			div2select.setAttribute("id", "div2select" + condition_counter);
			var option1 = document.createElement("option");
			var option2 = document.createElement("option");
			option1.setAttribute("value", "and");
			option2.setAttribute("value", "or");
			option1.append("AND");
			option2.append("OR");
			div2select.append(option1)
			div2select.append(option2)
			div2.append(div2select);
			condition_builder.append(div2)

		}

	}


	if (condition_flag != 0) {

		condition_builder.children[condition_builder.children.length - 1].remove();
	}


	condition_counter++;
	condition_flag++;


})

function column_onchange(e) {

	let query_date, condition_operator;
	//31-05-2023-starts------modified query builder------------

	if ($("select#qb_operator2").val() != 'none') {
		console.log($("select#qb_operator2").val())

		if ($("select#qb_operator2").val() == "between") {
			condition_operator = "between";
			query_date = $('#image_date_from1').val() + "," + $('#image_date_to1').val()
		}
		else if ($("select#qb_operator2").val() == "=") {
			condition_operator = '=';
			query_date = $("#conditional_date").val();
		}
		else if ($("select#qb_operator2").val() == ">") {
			condition_operator = ">";
			query_date = $("#conditional_date").val();
		}
		else if ($("select#qb_operator2").val() == "<") {
			condition_operator = "<";
			query_date = $("#conditional_date").val();
		}

	}
	else {
		query_date = "";
		condition_operator = "";
	}

	let select_id = e.id.replace("input", "select_doi2")

	let valueinput_id = e.id.replace("select_doi", "valueinputs")

	valueinput_id = document.getElementById(valueinput_id);

	let my_datalist_id = e.id.replace("select_doi", "my_lists")
	my_datalist_id = document.getElementById(my_datalist_id);
	my_datalist_id.innerHTML = "";

	var source_ticks2 = $('.source_filter_tick2');

	var table_names = [];
	let j = 0;
	for (let i = 0; i < source_ticks2.length; i++) {

		if (source_ticks2[i].checked) {
			table_names[j] = (source_ticks2[i].value);
			j++;
		}
	}

	for (let i = 0; i < table_names.length; i++) {
		$.ajax({
			url: 'show_column_dropdown',
			method: "POST",
			dtaType: "text",
			async: false,
			data: {
				selected_tables: table_names[i], _csrf: token, column_names: $("select#" + select_id).val(), query_date: query_date, condition_operator: condition_operator,

			},
			success: function (l) {

				for (let k in l) {
					let my_dataoption = document.createElement("option");

					//console.log(format_date(l[k][Object.keys(l[k]).toString()])+"==="+Object.keys(l[k]).toString())
					if (Object.keys(l[k]).toString() == "docreportdate" || Object.keys(l[k]).toString() == "dateofinterception") {
						my_dataoption.setAttribute("value", format_date(l[k][Object.keys(l[k]).toString()]))
						my_datalist_id.append(my_dataoption);
					}
					else {
						my_dataoption.setAttribute("value", l[k][$("select#" + select_id).val()])
						my_datalist_id.append(my_dataoption);
					}
				}

			},
			error: function (error) {
				console.log("Service unavailable try again later.");
			}
		});

	}

	for (let i = 0; i < table_names.length; i++) {
		$.ajax({
			url: 'show_column_data',
			method: "POST",
			dtaType: "text",
			async: false,
			data: {
				selected_tables: table_names[i], _csrf: token, column_names: $("select#" + select_id).val(),

			},
			success: function (l) {

				let my_select = document.createElement("select");
				for (var k in l) {

					var my_option = document.createElement("option");
					var chkbox = document.createElement("checkbox");
					chkbox.append(l[k][$("select#" + select_id).val()])

					my_option.append(chkbox)
					my_select.append(my_option)

				}

				//my_Dropdown.append(my_select)
			},
			error: function (error) {
				console.log("Service unavailable try again later.");
			}
		});

	}
}


//add query conditions ends------------
function update_condition_column() {
	console.log("hello")
	for (var x = 0; x < condition_builder.children.length; x++) {
		condition_builder.children[x].children[0].innerHTML = ""
		for (let i = 0; i < received_data.length; i++) {

			let mydropdown2 = document.createElement("option");
			mydropdown2.setAttribute("value", received_data[i]);
			mydropdown2.append(received_data[i]);
			condition_builder.children[x].children[0].append(mydropdown2)
			//condition_builder.append(condition_builder.children[x].children[0])
		}

	}

}

function remove_condition(element) {

	let div2select = element.id.replace("button", "div3_id");
	div2select = document.getElementById(div2select);
	if (div2select) {
		div2select.remove();
	}

	for (let ele of condition_builder.children) {
		if (ele.id.replace("div", "") == element.id.replace("button", "")) {
			ele.remove();
		}
	}
	if (condition_builder.children[0].id.includes("div3_id")) {
		condition_builder.children[0].remove()
	}

}



function search_in_db(element) {

	$.ajax({
		url: 'search_in_db_api',
		method: "POST",
		dtaType: "text",
		async: false,
		data: { table_names: table_names.join(','), _csrf: token },


		success: function (l) {
			console.log(l);

		},
		error: function (error) {
			console.log("Service unavailable try again later.");
		}
	});
}

// var btnclk = document.getElementById("submitBtn_latlon");
// btnclk.addEventListener("click", (e) => {
//   e.preventDefault();
//   console.log("function clicked");
//   msGrid();
// });

function msGrid(e) {
	console.log("in function");
	var search = new ol.control.SearchGPS({
		// target: $('.mdi mdi-layers').get(0)
	});
	console.log(search);
	map.addControl(search);

	var latlon_search;
	// Select feature when click on the reference index
	search.on("select", function (e) {
		console.log(e);
		map.getView().animate({
			center: e.search.coordinate,
			zoom: Math.max(map.getView().getZoom(), 14),
		});

		//Point on map of lat lon search
		var lonlat = ol.proj.transform(
			e.search.coordinate,
			"EPSG:3857",
			"EPSG:4326"
		);
		var latlonwkt = "POINT(" + lonlat.toString().replace(",", " ") + ")";
		if (latlon_search != "") {
			map.removeLayer(latlon_search);
		}

		var format = new ol.format.WKT();

		var feature = format.readFeature(latlonwkt, {
			dataProjection: "EPSG:4326",
			featureProjection: "EPSG:3857",
		});

		latlon_search = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [feature],
			}),
			style: new ol.style.Style({
				//		  stroke:new ol.style.Stroke({width:5,color:'blue'}),
				image: new ol.style.Circle({
					radius: 8,
					stroke: new ol.style.Stroke({ width: 3, color: "blue" }),
					fill: new ol.style.Fill({ color: "red" }),
				}),
			}),
		});
		map.addLayer(latlon_search);
	});
}

//---------------------navy ship path
function startpath(path1) {
	console.log("temp9----------------");
	console.log(path1);
	//const url= 'http://192.168.137.10:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Anavxlsxmodel&CQL_FILTER=nameofvessel=%27DDG%20171%20%27&outputFormat=application%2Fjson';
	const url = "vectordata";

	var data = path1;

	var pontarray = data;

	/* create point vector */
	const pontstyle = new ol.style.Style({
		image: new ol.style.Icon({
			src: "customol/images/ship_white.png",
			anchor: [0.5, 1],
			scale: 0.08,
		}),
	});
	var linearray = [];
	var features = [];
	for (var i = 0; i < pontarray.length; i++) {
		if (pontarray[i].table_name == "navxlsxmodel") {
			linearray.push(pontarray[i].st_asgeojson.value);
			const prop = {
				"Activity Date": format_date(pontarray[i].fromdate),
				"UO Number": pontarray[i].docreportnumber,
				"Name of Vessel": pontarray[i].nameofvessel,
			};
			const cords = JSON.parse(pontarray[i].st_asgeojson.value);
			const coordMin = ol.proj.fromLonLat(cords.coordinates, "EPSG:3857");

			var point = new ol.geom.Point(coordMin);
			var feature = new ol.Feature({
				geometry: point,
			});

			feature.setProperties(prop);

			features.push(feature);
		} else if (pontarray[i].table_name == "elintxlsxmodel") {
			linearray.push(pontarray[i].st_asgeojson.value);
			const prop = {
				"Activity Date": format_date(pontarray[i].dateofinterception),
				"UO Number": pontarray[i].docreportnumber,
				Location: pontarray[i].location,
			};
			const cords = JSON.parse(pontarray[i].st_asgeojson.value);
			const coordMin = ol.proj.fromLonLat(cords.coordinates, "EPSG:3857");

			var point = new ol.geom.Point(coordMin);
			var feature = new ol.Feature({
				geometry: point,
			});

			feature.setProperties(prop);

			features.push(feature);
		}
	}
	const pointsource = new ol.source.Vector({
		features,
	});
	pointvector = new ol.layer.Vector({
		source: pointsource,
		style: pontstyle,
	});
	map.addLayer(pointvector);

	/*create line vector*/

	var features = [];
	var points = [];

	for (var j = 0; j < linearray.length; j++) {
		const cords = JSON.parse(linearray[j]);
		//console.log(cords)
		const coordMin = ol.proj.fromLonLat(cords.coordinates, "EPSG:3857");

		points.push(coordMin);
	}

	let line = new ol.geom.LineString(points);
	var feature = new ol.Feature({
		geometry: line,
		name: "Line",
	});

	features.push(feature);

	var linestyles = {
		LineString: new ol.style.Style({
			stroke: new ol.style.Stroke({ color: "red", width: 4 }),
		}),
	};

	const linesource = new ol.source.Vector({
		features,
	});
	linevector = new ol.layer.Vector({
		source: linesource,
		//  style:linestyles
	});
	map.addLayer(linevector);

	// Animation

	var path = linevector.getSource().getFeatures()[0];

	// Triangle style
	var triangle = new ol.style.RegularShape({
		radius: 14,
		points: 3,
		fill: new ol.style.Fill({ color: "#00f" }),
		stroke: new ol.style.Stroke({ color: "#fff", width: 2 }),
	});

	var styleTriangle = new ol.style.Style({
		image: triangle,

		stroke: new ol.style.Stroke({
			color: [0, 0, 255],
			width: 2,
		}),
		fill: new ol.style.Fill({
			color: [0, 0, 255, 0.3],
		}),
	});
	// Add a feature on the map
	var f, anim, controler;
	function animateFeature() {
		if (path) {
			f = new ol.Feature(new ol.geom.Point([0, 0]));
			f.setStyle(styleTriangle);
			anim = new ol.featureAnimation.Path({
				path: path,
				rotate: true,
				easing: ol.easing.inAndOut,
				speed: 200,
				revers: false,
			});

			controler = linevector.animateFeature(f, anim);
		}
	}

	for (var i = 0; i < 1; i++) {
		setTimeout(animateFeature, i * 500);
	}

	//Select  interaction
	var select = new ol.interaction.Select({
		hitTolerance: 5,
		multi: false,
		condition: ol.events.condition.singleClick,
	});
	map.addInteraction(select);

	// Select control
	var popup = new ol.Overlay.PopupFeature({
		popupClass: "default anim",
		select: select,
		canFix: true,
		closeBox: true,

		template: {},
	});
	map.addOverlay(popup);
}

let keyword_condition = document.getElementById("keyword-condition");
keyword_condition.addEventListener("click", () => {

	if (value_flag == 0) {

		let keywordinput = document.createElement("input");
		keywordinput.setAttribute("id", "keywordinput")
		keywordinput.setAttribute("class", "form-control my-2")
		let keyword_builder = document.getElementById("keyword-builder");
		keyword_builder.append(keywordinput);
	}
	else if (value_flag % 2 == 1) {
		keywordinput.style.display = "none";
		keywordinput.value = "";
	}
	else {
		keywordinput.style.display = "block";
	}
	value_flag++;

})
