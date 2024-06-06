function changeDate(d) {
  let tempDate = d.split("-");
  return `${tempDate[2]}-${tempDate[1]}-${tempDate[0]}`;
}

function handleData() {
  am5.ready(function () {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("chartdiv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
        pinchZoomX: true,
      })
    );
    let tableData = [
      {
        date: "2024-04-01",
        ship_name: "ABC",
        ship_present: "1",
        portname: "BB1",
      },
      {
        date: "2024-04-03",
        ship_name: "DEF",
        ship_present: "1",
        portname: "BB1",
      },
      {
        date: "2024-04-04",
        ship_name: "XYZ",
        ship_present: "1",
        portname: "BB1",
      },
      {
        date: "2024-04-01",
        ship_name: "ABC",
        ship_present: "2",
        portname: "BB2",
      },
      {
        date: "2024-04-01",
        ship_name: "DEF",
        ship_present: "2",
        portname: "BB1",
      },
      {
        date: "2024-04-02",
        ship_name: "ABC",
        ship_present: "1",
        portname: "BB1",
      },
      {
        date: "2024-04-02",
        ship_name: "DEF",
        ship_present: "1",
        portname: "BB1",
      },
      {
        date: "2024-04-02",
        ship_name: "XYZ",
        ship_present: "3",
        portname: "BB2",
      },
      {
        date: "2024-04-05",
        ship_name: "XYZ",
        ship_present: "4",
        portname: "BB1",
      },
    ];

    let tempResult = {};
    let shipNames = {};

    tableData.forEach((content) => {
      shipNames[content.ship_name] = 1;
      if (tempResult.hasOwnProperty(content.date)) {
        if (tempResult[content.date].hasOwnProperty(content.ship_name)) {
          tempResult[content.date][content.ship_name] += parseInt(
            content.ship_present
          );
        } else {
          tempResult[content.date][content.ship_name] = parseInt(
            content.ship_present
          );
        }
      } else {
        let obj = {};
        obj[content.ship_name] = parseInt(content.ship_present);
        tempResult[content.date] = obj;
      }
    });

    let data = [];

    let dates = Object.keys(tempResult);
    dates.sort();
    dates.forEach((content) => {
      let temp = { date: changeDate(content), ...tempResult[content] };
      data.push(temp);
    });

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
    });
    xRenderer.grid.template.set("location", 0.5);
    xRenderer.labels.template.setAll({
      location: 0.5,
      multiLocation: 0.5,
    });

    chart.get("colors").set("step", 7);

    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "date",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
        snapTooltip: true,
      })
    );

    xAxis.data.setAll(data);

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxPrecision: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: false,
        }),
      })
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        alwaysShow: true,
        xAxis: xAxis,
        positionX: 1,
      })
    );

    cursor.lineY.set("visible", false);
    cursor.lineX.set("focusable", true);

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/

    function createSeries(name, field) {
      var series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          categoryXField: "date",
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "[bold]{name}[/]: {valueY}",
          }),
        })
      );

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 5,
            fill: series.get("fill"),
          }),
        });
      });

      // create hover state for series and for mainContainer, so that when series is hovered,
      // the state would be passed down to the strokes which are in mainContainer.
      series.set("setStateOnChildren", true);
      series.states.create("hover", {});

      series.mainContainer.set("setStateOnChildren", true);
      series.mainContainer.states.create("hover", {});

      series.strokes.template.states.create("hover", {
        strokeWidth: 4,
      });

      series.data.setAll(data);
      series.appear(1000);
    }

    Object.keys(shipNames).forEach((shipName) => {
      createSeries(shipName, shipName);
    });

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
        marginBottom: 20,
      })
    );

    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    // Make series change state when legend item is hovered
    legend.itemContainers.template.states.create("hover", {});

    legend.itemContainers.template.events.on("pointerover", function (e) {
      e.target.dataItem.dataContext.hover();
    });
    legend.itemContainers.template.events.on("pointerout", function (e) {
      e.target.dataItem.dataContext.unhover();
    });

    legend.data.setAll(chart.series.values);

    chart.plotContainer.events.on("pointerout", function () {
      cursor.set("positionX", 1);
    });

    chart.plotContainer.events.on("pointerover", function () {
      cursor.set("positionX", undefined);
    });

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);
  }); // end am5.ready()
}
