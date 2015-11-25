assert = require('assert')
sch = require('../src/schema.js');

fs = require('fs')
yaml = require('js-yaml')

function loadYaml (pth){
   return yaml.safeLoad(fs.readFileSync(__dirname +'/' + pth, "utf8"));
}

var tests = loadYaml('./elements-test.yaml')

// describe('conversion', function () {
//     tests.forEach(function(test){
//         it(JSON.stringify(test.element), function () {
//             res  = sch.element2schema(test.element);
//             assert.deepEqual(res, test.result);
//         })
//     })
// })



function generateSchema(s){
    var profiles = require(__dirname + '/../fhir/profiles-resources.json')
    var types = require(__dirname + '/../fhir/profiles-types.json')
    return (profiles.entry.concat(types.entry)).reduce(function(acc, entry){
        if(entry.resource.resourceType == 'StructureDefinition') {
            return sch.addToSchema(acc, entry.resource);
        } else {
            return acc;
        }
    }, s);
}


var schema = sch.buildSchema(function(s){
   return generateSchema(s);
});

// fs.writeFileSync('/tmp/fhir.schema.json', JSON.stringify(schema, null, "  "))

function jlog(x){console.log(JSON.stringify(x,null,"  "))}

var data = {
    resourceType: "Patient",
    name: [{given: ['dups']}],
    birthDate: '1980',
    gender: 'memale'
}
jlog(schema.validate(data));

describe('conversion', function () {
    var items = fs.readdirSync(__dirname + '/../tmp/')
    var errors = 0;
    for (var i=0; i< items.length; i++) {
        var file = items[i];
        it(file, function () {
            if(file.indexOf('.json') > -1 && file.indexOf('questionnaire') == -1 && file.indexOf('testscript') == -1){
                var resource = JSON.parse(fs.readFileSync(__dirname + '/../tmp/' + file))
                var result = schema.validate(resource)
                assert(!result.error)
                if(result.error) {
                    console.log(resource.resourceType, 'from', file)
                    console.log('===============')
                    errors++;
                    console.log(JSON.stringify(result, null, " "))
                }
            }
        })
    }
    console.log("PROCESSED: ", items.length)
    console.log("ERRORS: ", errors)
})