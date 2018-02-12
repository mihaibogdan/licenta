var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var _ = require('lodash');

var firebase = require('../lib/firebase');
var communication_service = require('./communication_service');

request = request.defaults({jar: true});

var hiddenInputs = [
    '__VIEWSTATE',
    '__VIEWSTATEGENERATOR',
    '__EVENTVALIDATION'
];

var payloadsGrades = {
    '__WPPS': 'u',
    '__EVENTTARGET': 'ctl00$WebPartManagerPanel1$WebPartManager1$wp1153997053$wp964809087$gridStudenti',
    '__EVENTARGUMENT': 'Select$0',
    '__VIEWSTATE': '',
    '__VIEWSTATEGENERATOR': '',
    '__VIEWSTATEENCRYPTED': '',
    '__EVENTVALIDATION': ''
};


module.exports = {
    disciplines: {
        "Structuri de date": true,
        "Arhitectura calculatoarelor şi sisteme de operare": true,
        "Logică pentru informatică": true,
        "Matematică": true,
        "Introducere în programare": true,
        "Limba engleză I": true,
        "Programare competitivă I": true,
        "Dezvoltare personală sportivă şi psihologică pentru informaticieni": true,
        "Psihologia educaţiei": true,
        "Programare orientată-obiect": true,
        "Sisteme de operare": true,
        "Fundamente algebrice ale informaticii": true,
        "Probabilităţi şi statistică": true,
        "Proiectarea algoritmilor": true,
        "Limba engleză II": true,
        "Programare competitivă II": true,
        "Pedagogie I (Fundamentele pedagogiei + Teoria şi metodologia curriculumului)": true,
        "Reţele de calculatoare": true,
        "Baze de date": true,
        "Limbaje formale, automate şi compilatoare": true,
        "Algoritmica grafurilor": true,
        "Calculabilitate, decidabilitate şi complexitate": true,
        "Principii ale limbajelor de programare": true,
        "Algoritmi genetici": true,
        "Limba engleză III": true,
        "Programare competitivă III": true,
        "Practică în industrie I": true,
        "Pedagogie II (Teoria şi metodologia instruirii + Teoria şi metodologia evaluării)": true,
        "Tehnologii WEB": true,
        "Programare avansată": true,
        "Ingineria Programării": true,
        "Practică SGBD": true,
        "Programare funcţională O2": true,
        "Modele continue şi Matlab": true,
        "Introducere in criptografie": true,
        "Limba engleză IV": true,
        "Programare competitivă IV": true,
        "Didactica informaticii": true,
        "Învățare automată": true,
        "Securitatea informaţiei": true,
        "Inteligenţă artificială": true,
        "Introducere în .NET": true,
        "Dezvoltarea sistemelor fizice utilizând microprocesoare": true,
        "Rețele neuronale": true,
        "Animaţie 3D: algoritmi şi tehnici fundamentale": true,
        "Programare și modelare probabilistă": true,
        "Dezvoltarea aplicațiilor Web la nivel de client": true,
        "Capitole speciale de sisteme de operare": true,
        "Practică - Programare în Python": true,
        "Programare competitivă V": true,
        "Practică în industrie II": true,
        "Instruire asistată de calculator": true,
        "Practică pedagogică în învăţământul preuniversitar obligatoriu (1)": true,
        "Calcul numeric": true,
        "Grafică pe calculator": true,
        "Programare bazată pe reguli": true,
        "Tehnici de programare pe platforma Android": true,
        "Analiza reţelelor media sociale": true,
        "Aspecte computaţionale în teoria numerelor": true,
        "Psihologia comunicării profesionale în domeniul IT-lui": true,
        "Programare MS-Office": true,
        "Cloud Computing": true,
        "Metodologii de lucru în mediul Open Source": true,
        "Reţele Petri şi aplicaţii": true,
        "Smart Card-uri şi Aplicaţii": true,
        "Topici speciale de programare .NET": true,
        "Elaborare lucrare de licenţă": true,
        "Programare competitivă VI": true,
        "Managementul clasei de elevi": true,
        "Practică pedagogică în învăţământul preuniversitar obligatoriu (2)": true
    },
    abbreviations: {
        sd: ["Structuri de date"],
        acso: ["Arhitectura calculatoarelor şi sisteme de operare"],
        logica: ['Logică pentru informatică'],
        matematica: ["Matematică"],
        mate: ["Matematică"],
        pc: ["Programare competitivă I", "Programare competitivă II", "Programare competitivă III", "Programare competitivă IV", "Programare competitivă V"],
        poo: ['Programare orientată-obiect'],
        so: ['Sisteme de operare'],
        fai: ['Fundamente algebrice ale informaticii'],
        ps: ['Probabilităţi şi statistică'],
        pa: ['Proiectarea algoritmilor', 'Programare avansată'],
        rc: ['Reţele de calculatoare'],
        bd: ['Baze de date'],
        lfac: ['Limbaje formale, automate şi compilatoare'],
        plp: ['Principii ale limbajelor de programare'],
        cdc: ['Calculabilitate, decidabilitate şi complexitate'],
        ag: ['Algoritmica grafurilor', 'Algoritmi genetici'],
        tw: ['Tehnologii WEB'],
        ip: ['Ingineria Programării'],
        sgbd: ['Practică SGBD'],
        matlab: ['Modele continue şi Matlab'],
        cripto: ['Introducere in criptografie'],
        ml: ['Învățare automată'],
        si: ['Securitatea informaţiei'],
        ia: ['Inteligenţă artificială'],
        '.net': ['Introducere în .NET'],
        rn: ['Rețele neuronale'],
        '3d': ['Animaţie 3D: algoritmi şi tehnici fundamentale'],
        'animatie 3d': ['Animaţie 3D: algoritmi şi tehnici fundamentale'],
        cn: ['Calcul numeric'],
        gpc: ['Grafică pe calculator'],
        msoffice: ['Programare MS-Office'],
        cc: ['Cloud Computing'],
        petri: ['Reţele Petri şi aplicaţii']
    },
    getPayload: function() {
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        return new Promise(function(resolve, reject) {
            request(url, function(err, resp, body) {
                if (err)
                    throw err;
                var $ = cheerio.load(body);

                _.forEach(hiddenInputs, function (input) {
                    payloadsGrades[input] = $('#' + input).val();
                });

                resolve(payloadsGrades);
            });
        });
    },

    getMarks: function(semester, payload) {
        var marks = [];
        var url = 'http://simsweb.uaic.ro/eSIMS/Members/StudentPage.aspx';
        payload.__EVENTARGUMENT = 'Select$' + semester;
        var options = {
            method: 'post',
            form: payload,
            url: url
        };

        console.log(payload.__EVENTARGUMENT);
        return new Promise(function(resolve, reject) {
            request(options, function(err, resp, body) {
                if (err)
                    throw err;
                var $ = cheerio.load(body);

                var discipline = $('table[id$="GridViewNote"] tr');

                for(var i = 1; i < discipline.length; i++) {
                    marks.push({ name: discipline[i].children[4].children[0].children[0].data, value: discipline[i].children[5].children[0].children[0].data})
                }

                resolve(marks);
            });
        })
    },
    scrapeMarks:function(senderID, year, semesters) {
        console.log('semesters', semesters);
        async.eachSeries(semesters, function semesterIteree(semester, semesterCallback) {
            communication_service.sendTextMessage(senderID, '-Anul ' + year + ', semestrul ' + ((semester % 2) + 1) + '-');

            module.exports.getPayload().then(function(payload) {
                module.exports.getMarks(semester, payload).then(function(marks) {
                    async.eachSeries(marks, function markIteree(mark, markCallback) {
                        communication_service.sendTextMessage(senderID, mark.name + ' ' + mark.value).then((function() {
                            markCallback(null);
                        }));
                    }, function done() {
                        semesterCallback(null);
                    });

                })
            });

        }, function done() {})
    },

    findMarks: function(senderID, disciplines, semesters) {
        return new Promise(function (resolve, reject) {
            var finalMarks = [];
            async.each(semesters, function semesterIteree(semester, semesterCallback) {
                module.exports.getPayload().then(function (payload) {
                    module.exports.getMarks(semester, payload).then(function (marks) {
                        _.forEach(marks, function (mark) {
                            for(var i = 0; i < disciplines.length; i++) {
                                if (mark.name.indexOf(disciplines[i]) !== -1) {
                                    finalMarks.push(mark);
                                }
                            }
                        });
                        semesterCallback();
                    })
                });
            }, function done() {
                async.eachSeries(finalMarks, function markIteree(mark, markCallback) {
                    communication_service.sendTextMessage(senderID, mark.name + ' ' + mark.value).then((function () {
                        markCallback(null);
                    }));
                }, function done() {
                    resolve(finalMarks);
                });
            })
        });
    }
};