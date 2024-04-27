function handleData() {
  let tableData = [
    {
      date: "01-04-2024",
      ship_name: "ABC",
      ship_present: "1",
      portname: "BB1",
    },
    {
      date: "01-04-2024",
      ship_name: "ABC",
      ship_present: "2",
      portname: "BB2",
    },
    {
      date: "01-04-2024",
      ship_name: "DEF",
      ship_present: "2",
      portname: "BB1",
    },
    {
      date: "02-04-2024",
      ship_name: "ABC",
      ship_present: "1",
      portname: "BB1",
    },
    {
      date: "02-04-2024",
      ship_name: "DEF",
      ship_present: "1",
      portname: "BB1",
    },
    {
      date: "02-04-2024",
      ship_name: "XYZ",
      ship_present: "3",
      portname: "BB2",
    },
    {
      date: "02-04-2024",
      ship_name: "XYZ",
      ship_present: "4",
      portname: "BB1",
    },
  ];

  let result = [];
  //   let tempData = Object.groupBy(tableData, ({ date }) => date);
  let tempData = {};
  let names = [];

  for (obj of tableData) {
    let key = obj.date;
    if (!names.includes(obj.ship_name)) {
      names.push(obj.ship_name);
    }
    if (tempData.hasOwnProperty(key)) {
      if (tempData[key].hasOwnProperty(obj.ship_name)) {
        tempData[key][obj.ship_name] += parseInt(obj.ship_present);
      } else {
        tempData[key][obj.ship_name] = parseInt(obj.ship_present);
      }
    } else {
      tempData[key] = {
        date: obj.date,
      };
      tempData[key][obj.ship_name] = parseInt(obj.ship_present);
    }
  }

  result = Object.values(tempData);

  showWeeklyChart(result, names);
}

function showWeeklyChart(data, names) {
  am5.ready(function () {
    var root = am5.Root.new("chartdiv");
    root._logo.dispose();

    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        layout: root.verticalLayout,
      })
    );

    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

    var xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
    });

    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "date",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xRenderer.grid.template.setAll({
      location: 1,
    });

    xAxis.data.setAll(data);

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1,
        }),
      })
    );

    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    function makeSeries(name, fieldName) {
      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: fieldName,
          categoryXField: "date",
        })
      );

      series.columns.template.setAll({
        tooltipText: "{name}, {valueY}",
        tooltipY: am5.percent(10),
      });
      series.data.setAll(data);

      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: "{valueY}",
            fill: root.interfaceColors.get("alternativeText"),
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        });
      });

      legend.data.push(series);
    }

    for (naam of names) {
      makeSeries(naam, naam);
    }

    chart.appear(1000, 100);
  });
}
