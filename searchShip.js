// JavaScript code

shipNames = ["ABC", "XYZ", "PPP", "ZZZ"];

function populate() {
  const content = document.getElementById("content");
  shipNames.forEach((element, index) => {
    let row = `<div class="row content_rows p-1">
                <div class="col" id="ship_${index}">${element}</div>
                <div class="col"><input id="count_${index}" type="text" /></div>
                <div class="col"><input id="remarks_${index}" type="text" /></div>
                <div class="col"><input id="air_${index}" type="text" /></div>
            </div>`;
    content.innerHTML+=row;
  });
}
populate()

function search_animal() {
  let input = document.getElementById("searchbar").value;
  input = input.toLowerCase();
  let x = document.getElementsByClassName("content_rows");

  for (i = 0; i < x.length; i++) {
    if (!x[i].children[0].innerHTML.toLowerCase().includes(input)) {
      x[i].style.display = "none";
    } else {
      x[i].style.display = "";
    }
  }
}
