

//ajax shipClass classs=j
//ajax remaining = j
//ajax images 
function loadships() {

    let ships = [];
    let total = [];

    //fetch ships
    $.ajax({
        url: "/api/getShips",
        dataType: "json",
        method: 'get',
        async: false,
        success: function (response) {
            ships = response;
        },
        error: function (error) { },
    });
    //fetch ships Total
    $.ajax({
        url: "/api/getShipTotal",
        dataType: "json",
        method: 'post',
        async: false,
        success: function (response) {
            total = response;
        },
        error: function (error) { },
    });

    // add data to table

    const shipContent = document.getElementById("ship-content");

    let shipContentData = "";

    ships.forEach((name, index) => {
        let currentCountSelect = getSelect(total[index].total, index);
        shipContentData += `<tr>
    <td><input type="checkbox" id="check_${index}" /></td>
    <td><label id="ship_${index}">${name.shipname}</label></td>
    <td>${currentCountSelect}</td>
    <td><input type="text" id="remarks_${index}" /></td>
    <td><input type="text" id="air_${index}" /></td>
    <td><button>View</button></td>
    <td><label id="remaining_${index}">${total[index].total}</label></td>
    </tr>`;
    })

    shipContent.innerHTML = shipContentData

}

function getSelect(count, index) {
    let result = `<select id="count_${index}">`;
    for (let i = 0; i <= count; ++i) {
        let temp = `<option>${i}</option>`
        result += temp;
    }
    result += "</select>";
    return result;
}



$('#search').keyup(function () {
    var $rows = $('#ship-content tr');
    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
    
    $rows.show().filter(function () {
        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
    }).hide();
});
