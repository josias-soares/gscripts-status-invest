/* -------- ADD THIS CODE IN THE HEADER OF GREASEMONKEY ---------

// ==UserScript==
// @name         Carteira -> Ações/FIIs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://statusinvest.com.br/carteira/patrimonio
// @match        https://statusinvest.com.br/carteira/patrimonio?a=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=statusinvest.com.br
// @grant        none
// @require      https://raw.githubusercontent.com/josias-soares/gscripts-status-invest/main/wallet-stocks-patrimony.js
// @require      https://raw.githubusercontent.com/josias-soares/gscripts-status-invest/main/wallet-fiis-patrimony.js
// ==/UserScript==

*/

setTimeout(function() {
    insertLastValueDY()
}, 1000);


function sortDYFII() {
    console.log("sortDY");

    deleteColumnsFIIs();

    setTimeout(function() {
        insertLastValueDY()
    }, 500);
}


async function setValueDY(ativo, tbl, i, currentPrice) {
    const response = await fetch(`https://statusinvest.com.br/fii/companytickerprovents?ticker=${ativo}&chartProventsType=0`);
    var data = await response.json();

    var json = JSON.stringify(data)

    var obj = JSON.parse(json);

    var lastDYvalue = obj.assetEarningsModels[0].v

    var lastDYValueNumber = parseFloat(lastDYvalue);

    var dyPercent = (lastDYValueNumber * 100) / currentPrice

    var color
    if (dyPercent <= 0) {
        color = "red-text"
    } else if (dyPercent < 0.3) {
        color = "orange-text"
    } else if (dyPercent < 0.7) {
        color = "yellow-text"
    } else if (dyPercent < 0.99) {
        color = "blue-text"
    } else {
        color = "green-text"
    }

    createCellFII(tbl.rows[i].insertCell(tbl.rows[i].cells.length), dyPercent, "%", color);
    createCellFII(tbl.rows[i].insertCell(tbl.rows[i].cells.length), lastDYvalue, "R$", color);
}

// append column to the HTML table
function insertLastValueDY() {
    console.log("insertLastValueDY")

    setTimeout(function() {
        var x
        for (x = 1; x < 12; x++) {
            // add listener to sort column
            document.querySelector(`#assets-result > div.card.p-0.groups-container > ul > li:nth-child(2) > div > div > div:nth-child(1) > div.overflow-hidden.normal.w-100 > div > table > thead > tr > th:nth-child(${x})`).addEventListener('click', sortDYFII);
        }
    }, 200);

    var tbl = document.querySelector("#assets-result > div.card.p-0.groups-container > ul > li:nth-child(2) > div").getElementsByTagName('table')[1], // table reference
        i;
    // open loop for each row and append cell
    for (i = 0; i < tbl.rows.length; i++) {

        if (i == 0) {
            createTHeaderLastPercentDy(tbl.rows[i].insertCell(tbl.rows[i].cells.length));
            createTHeaderLastValueDy(tbl.rows[i].insertCell(tbl.rows[i].cells.length));

        } else {
            var ativo = tbl.rows[i].getElementsByTagName("td")[0].innerText;
            var currentPrice = parseFloat(tbl.rows[i].getElementsByTagName("td")[2].getAttribute("title"));

            setValueDY(ativo.trim(), tbl, i, currentPrice)
        }
    }
}

// create DIV element and append to the table cell
function createCellFII(cell, text, symbol, color) {

    var textFormated = (text.toFixed(2)).replace(".", ",")
    var dataKey = ""

    if (symbol == "R$") {
        textFormated = symbol + " " + textFormated
        dataKey = "unitValue"
    } else {
        textFormated = textFormated + symbol
        dataKey = "categoryPercent"
    }

    var div = document.createElement('div'), // create DIV element
        txt = document.createTextNode(textFormated); // create text node

    div.appendChild(txt); // append text node to the DIV

    div.setAttribute('class', `text-right undefined ${color}`); // set DIV class attribute
    div.setAttribute('data-key', dataKey);
    div.setAttribute('title', text.toFixed(2));
    div.setAttribute('style', "height: 0px;");

    cell.appendChild(div); // append DIV to the table cell
}

function createTHeaderLastValueDy(cell) {
    var div = document.createElement('th');

    div.setAttribute('class', 'item text-right undefined');
    div.setAttribute('title', 'Clique para alterar a ordenação.');
    div.setAttribute('data-key', 'currentValue');
    div.setAttribute('style', "height: 0px;");

    div.innerHTML = `<div class="">
    <div>DY<br><small>Atual</small></div>
    <i data-nosnippet aria-hidden="true" role="img" data-icon="lock_open" class="to-fix material-icons" title="Clique no cadeado para fixar essa coluna."></i>
    </div>`

    cell.appendChild(div);
}

function createTHeaderLastPercentDy(cell) {
    var div = document.createElement('th'); // create DIV element

    div.setAttribute('class', 'item text-right undefined');
    div.setAttribute('title', 'Clique para alterar a ordenação.');
    div.setAttribute('data-key', 'currentValue');
    div.setAttribute('style', "height: 0px;");

    div.innerHTML = `<div class="">
    <div>% DY<br><small>Atual</small></div>
    <i data-nosnippet aria-hidden="true" role="img" data-icon="lock_open" class="to-fix material-icons" title="Clique no cadeado para fixar essa coluna."></i>
    </div>`

    cell.appendChild(div); // append DIV to the table cell
}

// delete table columns with index greater then 0
function deleteColumnsFIIs() {
    var tbl = document.querySelector("#assets-result > div.card.p-0.groups-container > ul > li:nth-child(2) > div").getElementsByTagName('table')[1], // table reference
        lastCol = tbl.rows[0].cells.length - 1, // set the last column index
        i;

    if (lastCol > 11) {
        for (i = 0; i < tbl.rows.length; i++) {
            tbl.rows[i].deleteCell(lastCol);
            tbl.rows[i].deleteCell(lastCol - 1);
        }
    }
}
