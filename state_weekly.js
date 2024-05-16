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
      let d = `${record.date} ${record.time}`;
      if (!dates.includes(d)) {
        dates.push(d);
      }

      let cell = `<strong>${record.shipcount} x </strong> ${record.state}`;

      if (result.hasOwnProperty(record.shipname)) {
        if (result[record.shipname].hasOwnProperty(d)) {
          result[record.shipname][d].push(cell);
        } else {
          result[record.shipname][d] = [cell];
          result[record.shipname].shiptotal = record.shiptotal;
        }
      } else {
        let tempObj = {};
        tempObj[d] = [cell];
        tempObj.shiptotal = record.shiptotal;
        result[record.shipname] = tempObj;
      }
    }
  });

  flag = Object.keys(result).length > 0 ? true : false;

  if (flag) {
    dates.sort();

    let th = "";
    let columns = [{ data: "shipname" }, { data: "shiptotal" }];
    dates.forEach((d) => {
      th += `<th>${d}</th>`;
      columns.push({ data: d });
    });

    let tableHead = `
  <table id="table" class="table table-striped">
    <thead>
        <tr>
            <th>Ship Name</th>
            <th>Total Ships</th>
            ${th}
        </tr>
    </thead>
    </table>
    `;
    $("#table").html(tableHead);

    let res = [];

    for (obj of Object.keys(result)) {
      let temp = {
        shipname: obj,
        shiptotal: result[obj].shiptotal,
      };

      for ([date, content] of Object.entries(result[obj])) {
        if (!date.includes("shiptotal")) {
          temp[date] = content.join("<br>");
        }
      }
      
      res.push(temp);
    }
    // creating dataTable

    new DataTable("#table", {
      data: res,
      columns: columns,
      columnDefs: [{ defaultContent: "-", targets: "_all" }],
    });
  }
}
