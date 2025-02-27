const initialCellState = {
    fontFamily_data: 'monospace',
    fontSize_data: '14',
    isBold: false,
    isItalic: false,
    textAlign: 'start',
    isUnderlined: false,
    color: '#000000',
    backgroundColor: '#ffffff',
    content: '',
    formula: ''
}

let sheetsArray = [];
let activeSheetIndex = -1;
let activeSheetObject = false;
let activeCell = false;

// Mathematical functions
const mathFunctions = {
    SUM: (range) => {
        const values = getRangeValues(range);
        return values.reduce((acc, val) => acc + val, 0);
    },
    
    AVERAGE: (range) => {
        const values = getRangeValues(range);
        return values.length > 0 
            ? values.reduce((acc, val) => acc + val, 0) / values.length
            : 0;
    },
    
    MAX: (range) => {
        const values = getRangeValues(range);
        return values.length > 0 ? Math.max(...values) : 0;
    },
    
    MIN: (range) => {
        const values = getRangeValues(range);
        return values.length > 0 ? Math.min(...values) : 0;
    },
    
    COUNT: (range) => {
        return getRangeValues(range).length;
    }
};

function getRangeValues(range) {
    const [startCell, endCell] = range.split(':').map(cell => cell.trim());
    const startCol = startCell.match(/[A-Z]+/)[0];
    const startRow = parseInt(startCell.match(/\d+/)[0]);
    const endCol = endCell.match(/[A-Z]+/)[0];
    const endRow = parseInt(endCell.match(/\d+/)[0]);

    const values = [];
    for(let row = startRow; row <= endRow; row++) {
        for(let col = startCol; col <= endCol; col = nextChar(col)) {
            const cellId = col + row;
            const cell = document.getElementById(cellId);
            if(cell) {
                const value = parseFloat(cell.innerText);
                if(!isNaN(value)) values.push(value);
            }
        }
    }
    return values;
}

function nextChar(c) {
    return c.length === 1 
        ? (c === 'Z' ? 'A' : String.fromCharCode(c.charCodeAt(0) + 1))
        : c;
}

// Existing functionality elements
let fontFamilyBtn = document.querySelector('.font-family');
let fontSizeBtn = document.querySelector('.font-size');
let boldBtn = document.querySelector('.bold');
let italicBtn = document.querySelector('.italic');
let underlineBtn = document.querySelector('.underline');
let leftBtn = document.querySelector('.start');
let centerBtn = document.querySelector('.center');
let rightBtn = document.querySelector('.end');
let colorBtn = document.querySelector('#color');
let bgColorBtn = document.querySelector('#bgcolor');
let addressBar = document.querySelector('.address-bar');
let formula = document.querySelector('.formula-bar');
let downloadBtn = document.querySelector(".download");
let openBtn = document.querySelector(".open");

// Grid header row element
let gridHeader = document.querySelector('.grid-header');

// Add header column
let bold = document.createElement('div');
bold.className = 'grid-header-col';
bold.innerText = 'SL. NO.';
gridHeader.append(bold);

for(let i = 65; i<=90; i++){
    let bold = document.createElement('div');
    bold.className = 'grid-header-col';
    bold.innerText = String.fromCharCode(i);
    bold.id = String.fromCharCode(i);
    gridHeader.append(bold);
}

// Existing grid creation code
for(let i = 1; i<=100; i++){
    let newRow = document.createElement('div')
    newRow.className = 'row';
    document.querySelector('.grid').append(newRow);

    let bold = document.createElement('div');
    bold.className = 'grid-cell';
    bold.innerText = i;
    bold.id = i;
    newRow.append(bold);

    for(let j = 65; j<=90; j++){
        let cell = document.createElement('div');
        cell.className = 'grid-cell cell-focus';
        cell.id = String.fromCharCode(j) + i;
        cell.contentEditable = true;

        cell.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        cell.addEventListener('focus', cellFocus);
        cell.addEventListener('focusout', cellFocusOut);
        cell.addEventListener('input', cellInput);

        newRow.append(cell);
    }
}

function cellFocus(event) {
    let key = event.target.id;
    addressBar.innerHTML = event.target.id;
    activeCell = event.target;
    formula.value = activeSheetObject[key].formula || activeCell.innerText;

    let activeBg = '#c9c8c8';
    let inactiveBg = '#ecf0f1';

    fontFamilyBtn.value = activeSheetObject[key].fontFamily_data;
    fontSizeBtn.value = activeSheetObject[key].fontSize_data;
    boldBtn.style.backgroundColor = activeSheetObject[key].isBold ? activeBg : inactiveBg;
    italicBtn.style.backgroundColor = activeSheetObject[key].isItalic ? activeBg : inactiveBg;
    underlineBtn.style.backgroundColor = activeSheetObject[key].isUnderlined ? activeBg : inactiveBg;
    setAlignmentBg(key, activeBg, inactiveBg);
    colorBtn.value = activeSheetObject[key].color;
    bgColorBtn.value = activeSheetObject[key].backgroundColor;

    document.getElementById(event.target.id.slice(0, 1)).classList.add('row-col-focus');
    document.getElementById(event.target.id.slice(1)).classList.add('row-col-focus');
}

function cellInput() {
    let key = activeCell.id;
    const input = activeCell.innerText.trim();
    
    if(input.startsWith('=')) {
        const formula = input.slice(1);
        processFormula(formula, key);
    } else {
        activeSheetObject[key].content = input;
        activeSheetObject[key].formula = '';
    }
}

function processFormula(formula, key) {
    const [fn, ...args] = formula.split(/[()]/);
    const functionName = fn.trim().toUpperCase();
    
    if(mathFunctions[functionName]) {
        const result = mathFunctions[functionName](args[0]);
        activeCell.innerText = result;
        activeSheetObject[key].content = result;
        activeSheetObject[key].formula = formula;
    } else {
        activeCell.innerText = '#ERROR';
        activeSheetObject[key].content = '#ERROR';
        activeSheetObject[key].formula = formula;
    }
}

// Rest of the existing functions remain unchanged
function setAlignmentBg(key, activeBg, inactiveBg) {
    leftBtn.style.backgroundColor = inactiveBg;
    centerBtn.style.backgroundColor = inactiveBg;
    rightBtn.style.backgroundColor = inactiveBg;
    if(key) {
        document.querySelector('.' + activeSheetObject[key].textAlign).style.backgroundColor = activeBg;
    } else {
        leftBtn.style.backgroundColor = activeBg;
    }
}

function cellFocusOut(event) {
    document.getElementById(event.target.id.slice(0, 1)).classList.remove('row-col-focus');
    document.getElementById(event.target.id.slice(1)).classList.remove('row-col-focus');
}

function REMOVE_DUPLICATES(range) {
    const [startCell, endCell] = range.split(':').map(cell => cell.trim());
    const startCol = startCell.match(/[A-Z]+/)[0];
    const startRow = parseInt(startCell.match(/\d+/)[0]);
    const endCol = endCell.match(/[A-Z]+/)[0];
    const endRow = parseInt(endCell.match(/\d+/)[0]);

    // Create an array to store rows
    let rows = [];

    // Get all rows in the range
    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
        let row = [];
        for (let colCharCode = startCol.charCodeAt(0); colCharCode <= endCol.charCodeAt(0); colCharCode++) {
            let col = String.fromCharCode(colCharCode);
            let cellId = col + rowNum;
            let cell = document.getElementById(cellId);
            if (cell) {
                row.push(cell.innerText);
            } else {
                row.push('');  // Handle missing cells
            }
        }
        rows.push(row);
    }

    // Identify and remove duplicate rows
    let uniqueRows = [];
    let seen = new Set();
    for (let i = 0; i < rows.length; i++) {
        let rowString = JSON.stringify(rows[i]);
        if (!seen.has(rowString)) {
            uniqueRows.push(rows[i]);
            seen.add(rowString);
        } else {
            // This is a duplicate row, so clear cells
            for (let colCharCode = startCol.charCodeAt(0); colCharCode <= endCol.charCodeAt(0); colCharCode++) {
                let col = String.fromCharCode(colCharCode);
                let cellId = col + (startRow + i);  // Corrected row number
                let cell = document.getElementById(cellId);
                if (cell) {
                    cell.innerText = '';
                }
            }
        }
    }
}

function processFormula(formula, key) {
    const [fn, ...args] = formula.split(/[()]/);
    const functionName = fn.trim().toUpperCase();

    if (mathFunctions[functionName]) {
        const result = mathFunctions[functionName](args[0]);
        activeCell.innerText = result;
    } else if (functionName === 'REMOVE_DUPLICATES') {
        REMOVE_DUPLICATES(args[0]);
    } else if (functionName === 'FIND_AND_REPLACE') {  // Add this
        const [range, findText, replaceText] = args[0].split(',').map(arg => arg.trim());
        FIND_AND_REPLACE(range, findText, replaceText);
    } else {
        activeCell.innerText = '#ERROR';
    }
}


function FIND_AND_REPLACE(range, findText, replaceText) {
    const [startCell, endCell] = range.split(':').map(cell => cell.trim());
    const startCol = startCell.match(/[A-Z]+/)[0];
    const startRow = parseInt(startCell.match(/\d+/)[0]);
    const endCol = endCell.match(/[A-Z]+/)[0];
    const endRow = parseInt(endCell.match(/\d+/)[0]);

    findText = findText.trim();
    replaceText = replaceText.trim();
    // Iterate through the cells in the range
    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
        for (let colCharCode = startCol.charCodeAt(0); colCharCode <= endCol.charCodeAt(0); colCharCode++) {
            let col = String.fromCharCode(colCharCode);
            let cellId = col + rowNum;
            let cell = document.getElementById(cellId);
            if (cell) {
                let originalText = cell.innerText;
                // Replace all occurrences of findText with replaceText
                let newText = originalText.replace(new RegExp(findText, 'g'), replaceText);
                cell.innerText = newText;
            }
        }
    }
}




