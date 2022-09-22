/*
    Serialization/deserialization of integer set.
    Integer values are in range 0..1000.
    Integer value is serialized into sequence [d1]d0,
       where d1 => 0..27 ('a'..'z','-','+'),
             d0 => 0..35 ('A'..'Z','0'..'9')
    Maximum integer value is 28*36-1 = 1007
*/

const serializePos0Table = createSerializePos0Table();
const serializePos1Table = createSerializePos1Table();
const deserializePos0Table = createDeserializeTable(serializePos0Table);
const deserializePos1Table = createDeserializeTable(serializePos1Table);

const serializeMaxNumber = 1000;
const serializePos0TableSize = 36;
const serializePos1TableSize = 28;
const serializeItemDelimeter = ' ';


// !!! Comment these checks in final version
/*
checkEntry();
checkSerialization();
checkDeserialization();
*/

function createSerializePos0Table () {
    return rangeChars('A', 'Z').concat(rangeChars('0', '9'));
}


function createSerializePos1Table () {
    return rangeChars('a', 'z').concat(['-', '+']);
}


function createDeserializeTable (table) {
    let result = {};
    table.forEach((item, i) => result[item] = i);
    return result;
}


function rangeChars (fromChar, toChar) {
    let result = [];
    let fromCode = fromChar.charCodeAt(0);
    let toCode = toChar.charCodeAt(0);
    for (let code = fromCode; code <= toCode; code++) {
        result.push(String.fromCharCode(code));
    }
    return result;
}


function serialize () {
    let inputElement = document.getElementById('serializeSrcEdit');
    let inputTxt = inputElement.value;

    let result;
    try {
        result = serializeText(inputTxt);
    }
    catch (e) {
        console.log(e);
        result = e;
    }

    let outputElement = document.getElementById('serializeResultEdit');
    outputElement.value = result;
}


function serializeText(txt) {
    let valuesArr = parseInputText(txt);
    return serializeArray(valuesArr);
}


function parseInputText (txt) {
    let valuesArr = [];
    let trimmedTxt = txt.trim();
    if (!trimmedTxt) {
        return valuesArr;
    }

    let splittedTxt = trimmedTxt.split(serializeItemDelimeter);

    for (let str of splittedTxt) {
        str = str.trim();
        if (str.length == 0) {
            continue;
        }

        if (!isNumeric(str)) {
            throw `Text contains non numeric item(${str})`;
        }

        value = parseInt(str);

        if (Number.isNaN(value)) {
            throw `Parse error. Value is NaN'(${str})`;
        }

        if (value < 0 || value > serializeMaxNumber) {
            throw `Parse error. Value is out of range(${value})`;
        }

        valuesArr.push(value);
    }

    return valuesArr;
}


function isNumeric (value) {
    return /^-?\d+$/.test(value);
}


function serializeArray (inArr) {
    return inArr.map(value => serializeValue(value)).join('');
}


function serializeValue (value) {
    let digit0 = value % serializePos0TableSize;
    let digit1 = Math.floor(value / serializePos0TableSize);
    return (digit1 == 0 ? '' : serializePos1Table[digit1]) +
                               serializePos0Table[digit0];
}


function deserialize () {
    let inputElement = document.getElementById('deserializeSrcEdit');
    let inputText = inputElement.value;

    let outputText;
    try {
        let outputArray = deserializeTextToArray(inputText);
        outputText = formatDeserialized(outputArray);
    }
    catch (e) {
        outputText = e;
    }

    let outputElement = document.getElementById('deserializeResultEdit');
    outputElement.value = outputText;
}


function deserializeTextToArray(txt) {
    let outArr = [];

    txt = txt.trim();

    let charIndex = 0;

    let getChar = () => txt[charIndex++];
    let hasChar = () => txt.length > charIndex;
    let isCharOfPos0 = ch => deserializePos0Table[ch] !== undefined;
    let isCharOfPos1 = ch => deserializePos1Table[ch] !== undefined;
    let deserializeOneChar  = singleChar => deserializePos0Table[singleChar];
    let deserializeTwoChars = (firstChar, secondChar) => {
        return deserializePos0Table[secondChar] +
               deserializePos1Table[firstChar] * serializePos0TableSize;
    };
    let deserializeChars = (firstChar, secondChar) => {
        return secondChar === undefined ? deserializeOneChar(firstChar)
                                        : deserializeTwoChars(firstChar, secondChar);
    };

    while (hasChar()) {
        let firstChar = getChar();
        let secondChar = undefined;

        if (isCharOfPos1(firstChar)) {
            secondChar = getChar();
            if (!isCharOfPos0(secondChar)) {
                throw `Unexpected char(${secondChar})`;
            }
        }
        else if (!isCharOfPos0(firstChar)) {
            throw `Unexpected char(${firstChar})`;
        }
        let number = deserializeChars(firstChar, secondChar);
        outArr.push(number);
    }

    return outArr;
}


function formatDeserialized(arr) {
    return arr.join(serializeItemDelimeter);
}


// !!! for tests
// Comment in final version
/*
function checkEntry () {
    {
        let n = serializePos0Table.length;
        checkTrue(n == serializePos0TableSize, `Wrong serialize pos0 table size(${n})`);
    }

    {
        let n = serializePos1Table.length;
        checkTrue(n == serializePos1TableSize, `Wrong serialize pos1 table size(${n})`);
    }

    {
        let n = Object.keys(deserializePos0Table).length;
        checkTrue(n == serializePos0TableSize, `Wrong deserialize pos0 table size(${n})`);
    }

    {
        let n = Object.keys(deserializePos1Table).length;
        checkTrue(n == serializePos1TableSize, `Wrong deserialize pos1 table size(${n})`);
    }

    {
        let n = serializePos0TableSize * serializePos1TableSize;
        checkTrue(n >= serializeMaxNumber, `Serialize max number is too low(${n})`)
    }
}


function checkTrue (value, txt) {
    if (!value) {
        console.log(txt);
    }
}


function checkSerialization() {
    let check = function(fromStr, toStr) {
        let result = 'FAILED';
        try {
            if  (serializeText(fromStr) === toStr) {
                result = 'SUCCESS';
            }
        }
        catch {
        }
        console.log(`(${fromStr}) serialized to (${toStr})... ${result}`);
    };

    check('0 1 2 3 4 5 6 7 8 9', 'ABCDEFGHIJ');
    check('0 500 1000', 'An6+2');
    check('0 36 72 108', 'AbAcAdA');
    check('231 45 999 612', 'gPbJ+1rA');
    check('100 200', 'MUST BE FAILED');
    check('-1', 'MUST BE FAILED');
    check('2000', 'MUST BE FAILED');
    check('NOT INTENGER SET', 'MUST BE FAILED');
}


function checkDeserialization() {
    let check = function(fromStr, toStr) {
        let result = 'FAILED';
        try {
            let outputArray = deserializeTextToArray(fromStr);
            outputText = formatDeserialized(outputArray);
            if (outputText === toStr) {
                result = 'SUCCESS';
            }
        }
        catch {
        }
        console.log(`(${fromStr}) deserialized to (${toStr})... ${result}`);
    }

    check('ABCDEFGHIJ', '0 1 2 3 4 5 6 7 8 9');
    check('An6+2', '0 500 1000');
    check('AbAcAdA', '0 36 72 108');
    check('gPbJ+1rA', '231 45 999 612');
    check('abcdef', 'MUST BE FAILED');
}
*/
