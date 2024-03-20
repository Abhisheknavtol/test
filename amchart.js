function addDays(days = 1) {
  let theDate = new Date();
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}
function getChart(data) {
  am5.ready(function () {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("chartdiv");
    root.dateFormatter.setAll({
      dateFormat: "yyyy-MM-dd HH:mm",
      dateFields: ["valueX", "openValueX"],
    });

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
        paddingLeft: 0,
      })
    );

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    var colors = chart.get("colors");

    
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "parking",
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          minorGridEnabled: true,
        }),
        tooltip: am5.Tooltip.new(root, {
          themeTags: ["axis"],
          animationDuration: 200,
        }),
      })
    );

    let ar = [];
    let temp = [];
    for (key of data) {
      if (temp.includes(key.parking)) continue;
      ar.push({ parking: key.parking });
      temp.push(key.parking);
    }

    //   let temp = Object.groupBy(data, ({ parking }) => parking);
    //   let ar = [];
    //   for (key of Object.keys(temp)) {
    //     ar.push({ parking: key });
    //   }

    let tempp = {};
    let todaydate = new Date();
    let d = `${todaydate.getFullYear()}-${
      todaydate.getMonth() + 1
    }-${todaydate.getDate()}`; //just for the reference doesn't need to be edited

    for (obj of data) {
      if (tempp.hasOwnProperty(obj.parking)) {
        let tempdate = addDays(tempp[obj.parking]);
        tempp[obj.parking] = tempp[obj.parking] + 1;
        obj["fromDate"] = `${tempdate.getFullYear()}-${
          tempdate.getMonth() + 1
        }-${tempdate.getDate()} 00:00`;
        obj["toDate"] = `${tempdate.getFullYear()}-${
          tempdate.getMonth() + 1
        }-${tempdate.getDate()} 23:00`;
      } else {
        obj["fromDate"] = d + " 00:00";
        obj["toDate"] = d + " 23:00";

        tempp[obj.parking] = 1;
      }
      obj["columnSettings"] = {
        fill: am5.Color.brighten(
          colors.getIndex(Math.floor(Math.random() * 30)),
          0
        ),
      };
    }
    /* yAxis.data.setAll([
                { category: "John" },
                { category: "Jane" },
                { category: "Peter" },
                { category: "Melania" },
                { category: "Donald" }
            ]); */
    yAxis.data.setAll(ar);

    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "minute", count: 1 },
        visible: false,
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: false,
        }),
      })
    );

    var xRenderer = xAxis.get("renderer");
    xRenderer.grid.template.setAll({
      stroke: 0,
    });

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        openValueXField: "fromDate",
        valueXField: "toDate",
        categoryYField: "parking",
        sequencedInterpolation: true,
      })
    );

    series.columns.template.setAll({
      templateField: "columnSettings",
      strokeOpacity: 0,
      tooltipText: "{shipname}, {shippresent}",
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        sprite: am5.Label.new(root, {
          text: "{shipname}, {shippresent}",
          fill: root.interfaceColors.get("alternativeText"),
          centerY: am5.p50,
          centerX: am5.p50,
          populateText: true,
        }),
      });
    });

    series.data.processor = am5.DataProcessor.new(root, {
      dateFields: ["fromDate", "toDate"],
      dateFormat: "yyyy-MM-dd HH:mm",
    });
    series.data.setAll(data);

    // Add scrollbars
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear();
    chart.appear(1000, 100);
  }); // end am5.ready()
}
