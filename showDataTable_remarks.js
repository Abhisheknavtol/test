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
      let cell = `<strong>${record.shipcount} x ${record.shipname}</strong>`;
      if (record.remarks) {
        cell = `<strong>${record.shipcount} x ${record.shipname}</strong> (${record.remarks})`;
      }
      if (result.hasOwnProperty(record.portname + "-" + record.state)) {
        if (
          result[record.portname + "-" + record.state].hasOwnProperty(
            record.date
          )
        ) {
          result[record.portname + "-" + record.state][record.date].push(cell);
        } else {
          result[record.portname + "-" + record.state][record.date] = [cell];
          result[record.portname + "-" + record.state].state = record.state;
          result[record.portname + "-" + record.state].portname =
            record.portname;
        }
      } else {
        let tempObj = {};
        tempObj[record.date] = [cell];
        tempObj.state = record.state;
        tempObj.portname = record.portname;
        result[record.portname + "-" + record.state] = tempObj;
      }
    }
  });

  console.log(result);

  flag = Object.keys(result).length > 0 ? true : false;

  if (flag) {
    dates.sort();

    let th = "";
    let columns = [{ data: "state" }, { data: "portname" }];
    dates.forEach((d) => {
      th += `<th>${d}</th>`;
      columns.push({ data: d });
    });

    let tableHead = `
  <table id="table" class="table table-striped">
    <thead>
        <tr>
            <th>State</th>
            <th>Port</th>
            ${th}
        </tr>
    </thead>
    </table>
    `;
    $("#table").html(tableHead);

    let res = [];

    for (obj of Object.keys(result)) {
      let temp = { portname: result[obj].portname, state: result[obj].state }; // new Change 13

      delete result[obj].portname; // new Change 13
      delete result[obj].state; // new Change 13

      for ([date, content] of Object.entries(result[obj])) {
        if (!date.includes("portname") || !date.includes("state"))
          temp[date] = content.join("<br><br>"); // new Change 13
      }
      res.push(temp);
    }

    // creating dataTable

    new DataTable("#table", {
      data: res,
      columns: columns,
      columnDefs: [{ defaultContent: "-", targets: "_all" }], // new Change 13
    });
  }
}
