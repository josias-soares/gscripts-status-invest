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
    insertValuation()
}, 1000);


function lastTwoToUpper(string) {
    string = string.toLowerCase();

    const myArray = string.split("");

    myArray[myArray.length - 1] = myArray[myArray.length - 1].toUpperCase()
    myArray[myArray.length - 2] = myArray[myArray.length - 2].toUpperCase()

    var newString = myArray.join("")

    return newString;
}

function sortDY() {
    console.log("sortDY");

    deleteColumns();

    setTimeout(function() {
        insertValuation()
    }, 600);
}


async function addCellWithValuation(ativo, tbl, i) {
    const response = await fetch(`https://statusinvest.com.br/acao/indicatorhistoricallist?codes=${ativo}&time=5`);
    var data = await response.json();

    var json = JSON.stringify(data)
    //console.log('json ====>:'+ json);

    var obj = JSON.parse(json);
    console.log("Ativo: " + ativo)

    var field
    var valuations

    try {
        field = lastTwoToUpper(ativo)
        valuations = obj.data[field]
    } catch (err) {
        //console.log("ERRO Ativo: " + ativo)
        field = ativo.toLowerCase()
        valuations = obj.data[field]
    }

    var passivoAtivo = 0
    var dyAnnual = 0
    var dyMonth = 0
    var color

    valuations.forEach(v => {
        // console.log("key: " + v.key)

        if (v.key == "passivo_ativo") {
            passivoAtivo = v.actual

            //console.log("passivoAtivo: " + passivoAtivo)
        }

        if (v.key == "dy") {
            dyAnnual = v.actual

            //console.log("dy: " + dyAnnual)
        }

    });

    if (dyAnnual > 0) {
        dyMonth = (dyAnnual / 12).toFixed(2)

        console.log("dyMonth: " + dyAnnual)

        if (dyMonth < 0.3) {
            color = "orange-text"
        } else if (dyMonth < 0.7) {
            color = "yellow-text"
        } else if (dyMonth < 0.99) {
            color = "blue-text"
        } else {
            color = "green-text"
        }
    } else {
        color = "red-text"
    }

    createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), parseFloat(dyMonth), "%", color);
    createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), parseFloat(dyAnnual), "%", color);
    createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), parseFloat(passivoAtivo), "", color);
}

// append column to the HTML table
function insertValuation() {
    console.log("insertValuation")

    setTimeout(function() {
        var x
        for (x = 1; x < 12; x++) {
            // add listener to sort column
            document.querySelector(`#assets-result > div.card.p-0.groups-container > ul > li:nth-child(1) > div > div > div:nth-child(1) > div.overflow-hidden.normal.w-100 > div > table > thead > tr > th:nth-child(${x})`).addEventListener('click', sortDY);
        }
    }, 200);

    var tbl = document.querySelector("#assets-result > div.card.p-0.groups-container > ul > li:nth-child(1) > div").getElementsByTagName('table')[1], // table reference
        i;
    // open loop for each row and append cell
    for (i = 0; i < tbl.rows.length; i++) {

        if (i == 0) {

            createTHeaderMonthPercentDy(tbl.rows[i].insertCell(tbl.rows[i].cells.length));
            createTHeaderAnnualPercentDy(tbl.rows[i].insertCell(tbl.rows[i].cells.length));
            createTHeaderPassiveActive(tbl.rows[i].insertCell(tbl.rows[i].cells.length));
          
        } else {
            var ativo = tbl.rows[i].getElementsByTagName("td")[0].getAttribute("title");

            addCellWithValuation(ativo.trim(), tbl, i)
        }
    }
}

// create DIV element and append to the table cell
function createCell(cell, text, symbol, color) {

    console.log("createCell:" + text)


    var textFormated = text
    var dataKey = ""
    var classColor = ""

    if (symbol == "%") {
        classColor = color
        textFormated = (text.toFixed(2)).replace(".", ",")

        textFormated = textFormated + symbol
        dataKey = "categoryPercent"
    } else {
        textFormated = textFormated
        dataKey = "unitValue"
    }

    var div = document.createElement('div'), // create DIV element
        txt = document.createTextNode(textFormated); // create text node

    div.appendChild(txt); // append text node to the DIV
    //div.innerHTML =`${textFormated}`

    div.setAttribute('class', `text-right undefined ${classColor}`); // set DIV class attribute
    div.setAttribute('data-key', dataKey);
    div.setAttribute('title', text.toFixed(2));
    div.setAttribute('style', "height: 0px;");

    cell.appendChild(div); // append DIV to the table cell
}

function createTHeaderMonthPercentDy(cell) {
    var div = document.createElement('th');

    div.setAttribute('class', 'item text-right undefined');
    div.setAttribute('title', 'Clique para alterar a ordenação.');
    div.setAttribute('data-key', 'currentValue');
    div.setAttribute('style', "height: 0px;");

    div.innerHTML = `<div class="">
    <div>% DY<br><small>Mensal</small></div>
    <i data-nosnippet aria-hidden="true" role="img" data-icon="lock_open" class="to-fix material-icons" title="Clique no cadeado para fixar essa coluna."></i>
    </div>`

    cell.appendChild(div);
}

function createTHeaderAnnualPercentDy(cell) {
    var div = document.createElement('th'); // create DIV element

    div.setAttribute('class', 'item text-right undefined');
    div.setAttribute('title', 'Clique para alterar a ordenação.');
    div.setAttribute('data-key', 'currentValue');
    div.setAttribute('style', "height: 0px;");

    div.innerHTML = `<div class="">
    <div>% DY<br><small>Anual</small></div>
    <i data-nosnippet aria-hidden="true" role="img" data-icon="lock_open" class="to-fix material-icons" title="Clique no cadeado para fixar essa coluna."></i>
    </div>`

    cell.appendChild(div); // append DIV to the table cell
}

function createTHeaderPassiveActive(cell) {
    var div = document.createElement('th'); // create DIV element

    div.setAttribute('class', 'item text-right undefined');
    div.setAttribute('title', 'Clique para alterar a ordenação.');
    div.setAttribute('data-key', 'currentValue');
    div.setAttribute('style', "height: 0px;");

    div.innerHTML = `<div class="">
    <div>P/A<br><small>.</small></div>
    <i data-nosnippet aria-hidden="true" role="img" data-icon="lock_open" class="to-fix material-icons" title="Clique no cadeado para fixar essa coluna."></i>
    </div>`

    cell.appendChild(div); // append DIV to the table cell
}

// delete table columns with index greater then 0
function deleteColumns() {
    var tbl = document.querySelector("#assets-result > div.card.p-0.groups-container > ul > li:nth-child(1) > div").getElementsByTagName('table')[1], // table reference
        lastCol = tbl.rows[0].cells.length - 1, // set the last column index
        i;

    if (lastCol > 11) {
        for (i = 0; i < tbl.rows.length; i++) {
            tbl.rows[i].deleteCell(lastCol);
            tbl.rows[i].deleteCell(lastCol - 1);
            tbl.rows[i].deleteCell(lastCol - 2);
        }
    }
}
