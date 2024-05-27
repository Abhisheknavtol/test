function changeDate(d) {
  let tempDate = d.split("-");
  return `${tempDate[2]}-${tempDate[1]}-${tempDate[0]}`;
}

function showDataTable(data, from, to) {
  let parkings = [];
  let result = {};

  let flag = true;

  let fromDate = new Date(from);
  let toDate = new Date(to);

  data.forEach((record) => {
    let currDate = new Date(changeDate(record.date));

    if (currDate >= fromDate && currDate <= toDate) {
      let d = `${record.date} ${record.time}`;
      if (!parkings.includes(record.parking_position)) {
        parkings.push(record.parking_position);
      }

      let cell = `<strong>${record.shipcount} x </strong> ${record.shipname}`;

      if (result.hasOwnProperty(d)) {
        if (result[d].hasOwnProperty(record.parking_position)) {
          result[d][record.parking_position].push(cell);
        } else {
          result[d][record.parking_position] = [cell];
        }
      } else {
        let tempObj = {};
        tempObj['datetime'] = d;
        tempObj[record.parking_position] = [cell];
        result[d] = tempObj;
      }
    }
  });
  
  flag = Object.keys(result).length > 0 ? true : false;

  if (flag) {
    parkings.sort();

    let th = "";
    let columns = [{ data: "datetime" }];
    parkings.forEach((d) => {
      th += `<th>${d}</th>`;
      columns.push({ data: d });
    });

    let tableHead = `
  <table id="table" class="table table-striped">
    <thead>
        <tr>
            <th>Date & Time</th>
            ${th}
        </tr>
    </thead>
    </table>
    `;
    $("#table").html(tableHead);

    let res = [];

    for (datetime of Object.keys(result)) {
      let temp = {
        datetime: datetime,
      };

      for ([date, content] of Object.entries(result[datetime])) {
        if (!date.includes("datetime")) {
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
