const csvToJson = require('convert-csv-to-json')

const input = './worldcities.csv'
const output = './cites.json'

csvToJson.fieldDelimiter(',').formatValueByType().generateJsonFileFromCsv(input, output);