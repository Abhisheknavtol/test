function changeDate(d) {
  let tempDate = d.split("-");
  return `${tempDate[2]}-${tempDate[1]}-${tempDate[0]}`;
}

function showDataTable(data, from, to) {
  let dates = [];
  let result = {};

  let flag = true;

  let fromDate = new Date(from);
  let toDate = new Date(to);

  data.forEach((record) => {
    let currDate = new Date(changeDate(record.date));
    if (currDate >= fromDate && currDate <= toDate) {
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
    }
  });

  flag = Object.keys(result).length > 0 ? true : false;

  if (flag) {
    dates.sort();

    let th = "";
    let columns = [{ data: "portname" }];
    dates.forEach((d) => {
      th += `<th>${d}</th>`;
      columns.push({ data: d });
    });

    let tableHead = `
  <table id="table" class="table table-striped">
    <thead>
        <tr>
            <th>Port</th>
            ${th}
        </tr>
    </thead>
    </table>
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
}
