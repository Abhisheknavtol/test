function showDataTable(data) {
  let dates = [];

  let result = {};

  data.forEach((record) => {
    if (!dates.includes(record.date)) {
      dates.push(record.date);
    }
    let cell = `${record.shipname}-${record.shipcount}`;
    if (result.hasOwnProperty(record.portname)) {
      if (result[record.portname].hasOwnProperty(record.date)) {
        result[record.portname][record.date].push(cell);
      } else {
        result[record.portname][record.date] = [cell];
      }
    } else {
      let tempObj = {};
      tempObj[record.date] = [cell];
      result[record.portname] = tempObj;
    }
  });

  dates.sort();

  let th = "";
  let columns = [{ data: "portname" }];
  dates.forEach((d) => {
    th += `<th>${d}</th>`;
    columns.push({ data: d });
  });

  let tableHead = `
    <thead>
        <tr>
            <th>Port</th>
            ${th}
        </tr>
    </thead>
    `;
  $("#table").html(tableHead);

  let res = [];

  for (portname of Object.keys(result)) {
    let temp = { portname: portname };

    for ([date, content] of Object.entries(result[portname])) {
      temp[date] = content.toSorted().join("<br>");
    }
    res.push(temp);
  }

  // creating dataTable

  new DataTable("#table", {
    data: res,
    columns: columns,
  });
}
