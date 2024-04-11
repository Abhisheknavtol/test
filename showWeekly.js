function handleData() {
  //   let tableData = [
  //     {
  //       date: "01-04-2024",
  //       ship_name: "ABC",
  //       ship_present: "1",
  //     },
  //     {
  //       date: "01-04-2024",
  //       ship_name: "DEF",
  //       ship_present: "2",
  //     },
  //     {
  //       date: "02-04-2024",
  //       ship_name: "ABC",
  //       ship_present: "1",
  //     },
  //     {
  //       date: "02-04-2024",
  //       ship_name: "DEF",
  //       ship_present: "1",
  //     },
  //     {
  //       date: "02-04-2024",
  //       ship_name: "XYZ",
  //       ship_present: "4",
  //     },
  //   ];

  let tableData = [
    {
      ship_name: "S1",
      date: "09-04-2024",
      ship_present: "2",
      portname: "BB1",
    },
    {
      ship_name: "S2",
      date: "09-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "SP1",
      date: "09-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "09-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "08-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "08-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "08-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "08-04-2024",
      ship_present: "2",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "07-04-2024",
      ship_present: "2",
      portname: "BB1",
    },
    {
      ship_name: "S2",
      date: "07-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "SP1",
      date: "07-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "07-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "06-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "06-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "06-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "06-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "05-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "05-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "05-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "05-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "04-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "04-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "04-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "04-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "03-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "03-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "03-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "03-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "02-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "02-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "02-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "02-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "01-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "01-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "01-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "01-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
    {
      ship_name: "PO1",
      date: "10-04-2024",
      ship_present: "3",
      portname: "BB1",
    },
    {
      ship_name: "D2",
      date: "10-04-2024",
      ship_present: "1",
      portname: "BB1",
    },
    {
      ship_name: "S11",
      date: "10-04-2024",
      ship_present: "4",
      portname: "BB1",
    },
    {
      ship_name: "S1",
      date: "10-04-2024",
      ship_present: "5",
      portname: "BB1",
    },
  ];

  let result = [];
  //   let tempData = Object.groupBy(tableData, ({ date }) => date);
  let tempData = {};
  let names = [];

  for (obj of tableData) {
    if (tempData.hasOwnProperty(obj.date)) {
      tempData[obj.date].push(obj);
    } else {
      tempData[obj.date] = [obj];
    }
  }

  console.log(tempData);

  for (date of Object.keys(tempData)) {
    let temp = { date };
    for (content of tempData[date]) {
      if (!names.includes(content.ship_name)) {
        names.push(content.ship_name);
      }
      temp[content.ship_name] = parseInt(content.ship_present);
      temp[content.portname] = content.portname;
    }
    result.push(temp);
  }

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
