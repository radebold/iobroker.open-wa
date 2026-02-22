'use strict';

/* global Blockly, systemLang, main */

try {
    Blockly.Words['open-wa']            = {'en': 'Open-WA', 'de': 'Open-WA'};
    Blockly.Words['open-wa_message']    = {'en': 'text', 'de': 'Text'};
    Blockly.Words['open-wa_to']         = {'en': 'to', 'de': 'Empfänger'};
    Blockly.Words['open-wa_result']     = {'en': 'result state id', 'de': 'Ergebnis-State-ID'};
    Blockly.Words['open-wa_log']        = {'en': 'log level', 'de': 'Loglevel'};
    Blockly.Words['open-wa_log_none']   = {'en': 'none', 'de': 'keins'};
    Blockly.Words['open-wa_log_info']   = {'en': 'info', 'de': 'info'};
    Blockly.Words['open-wa_log_debug']  = {'en': 'debug', 'de': 'debug'};
    Blockly.Words['open-wa_log_warn']   = {'en': 'warning', 'de': 'warning'};
    Blockly.Words['open-wa_log_error']  = {'en': 'error', 'de': 'error'};

    function getInstanceOptions() {
        var options = [];
        if (typeof main !== 'undefined' && main.instances) {
            for (var i = 0; i < main.instances.length; i++) {
                var m = main.instances[i].match(/^system\.adapter\.open-wa\.(\d+)$/);
                if (m) {
                    var k = parseInt(m[1], 10);
                    options.push(['open-wa.' + k, '.' + k]);
                }
            }
        }
        if (!options.length) options.push(['open-wa.0', '.0']);
        return options;
    }

    function logDropdown() {
        return new Blockly.FieldDropdown([
            [Blockly.Words['open-wa_log_none'][systemLang]  || Blockly.Words['open-wa_log_none'].en,  ''],
            [Blockly.Words['open-wa_log_info'][systemLang]  || Blockly.Words['open-wa_log_info'].en,  'log'],
            [Blockly.Words['open-wa_log_debug'][systemLang] || Blockly.Words['open-wa_log_debug'].en, 'debug'],
            [Blockly.Words['open-wa_log_warn'][systemLang]  || Blockly.Words['open-wa_log_warn'].en,  'warn'],
            [Blockly.Words['open-wa_log_error'][systemLang] || Blockly.Words['open-wa_log_error'].en, 'error']
        ]);
    }

    // ---- send (no result) ----
    Blockly.Sendto.blocks['open-wa'] =
        '<block type="open-wa">'
        + '  <value name="INSTANCE"></value>'
        + '  <value name="TO"><shadow type="text"><field name="TEXT">+491701234567</field></shadow></value>'
        + '  <value name="TEXT"><shadow type="text"><field name="TEXT">Gateway läuft sauber 🚀</field></shadow></value>'
        + '  <value name="LOG"></value>'
        + '</block>';

    Blockly.Blocks['open-wa'] = {
        init: function() {
            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Words['open-wa'][systemLang] || Blockly.Words['open-wa'].en)
                .appendField(new Blockly.FieldDropdown(getInstanceOptions), 'INSTANCE');

            this.appendValueInput('TO').setCheck('String')
                .appendField(Blockly.Words['open-wa_to'][systemLang] || Blockly.Words['open-wa_to'].en);

            this.appendValueInput('TEXT')
                .appendField(Blockly.Words['open-wa_message'][systemLang] || Blockly.Words['open-wa_message'].en);

            this.appendDummyInput('LOG')
                .appendField(Blockly.Words['open-wa_log'][systemLang] || Blockly.Words['open-wa_log'].en)
                .appendField(logDropdown(), 'LOG');

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(Blockly.Sendto.HUE);
        }
    };

    Blockly.JavaScript['open-wa'] = function(block) {
        var inst = block.getFieldValue('INSTANCE');
        var logLevel = block.getFieldValue('LOG');
        var to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);
        var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);

        var logText = '';
        if (logLevel) logText = 'console.' + logLevel + '("open-wa: " + ' + text + ');\n';

        return 'sendTo("open-wa' + inst + '", "send", {\n    to: ' + to + ',\n    text: ' + text + '\n});\n' + logText;
    };

    // ---- send (with result) ----
    Blockly.Sendto.blocks['open-wa-result'] =
        '<block type="open-wa-result">'
        + '  <value name="INSTANCE"></value>'
        + '  <value name="TO"><shadow type="text"><field name="TEXT">+491701234567</field></shadow></value>'
        + '  <value name="TEXT"><shadow type="text"><field name="TEXT">Gateway läuft sauber 🚀</field></shadow></value>'
        + '  <value name="RESULT"><shadow type="text"><field name="TEXT">0_userdata.0.openwa.lastCallback</field></shadow></value>'
        + '</block>';

    Blockly.Blocks['open-wa-result'] = {
        init: function() {
            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Words['open-wa'][systemLang] || Blockly.Words['open-wa'].en)
                .appendField('(result)')
                .appendField(new Blockly.FieldDropdown(getInstanceOptions), 'INSTANCE');

            this.appendValueInput('TO').setCheck('String')
                .appendField(Blockly.Words['open-wa_to'][systemLang] || Blockly.Words['open-wa_to'].en);

            this.appendValueInput('TEXT')
                .appendField(Blockly.Words['open-wa_message'][systemLang] || Blockly.Words['open-wa_message'].en);

            this.appendValueInput('RESULT').setCheck('String')
                .appendField(Blockly.Words['open-wa_result'][systemLang] || Blockly.Words['open-wa_result'].en);

            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(Blockly.Sendto.HUE);
        }
    };

    Blockly.JavaScript['open-wa-result'] = function(block) {
        var inst = block.getFieldValue('INSTANCE');
        var to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);
        var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
        var resultId = Blockly.JavaScript.valueToCode(block, 'RESULT', Blockly.JavaScript.ORDER_ATOMIC);

        return 'sendTo("open-wa' + inst + '", "send", {\n    to: ' + to + ',\n    text: ' + text + '\n}, function(res){\n' +
               '  var __rid = ' + resultId + ';\n' +
               '  if (__rid) setState(__rid, JSON.stringify(res));\n' +
               '});\n';
    };
} catch (e) {
    if (typeof console !== 'undefined') console.error('open-wa blockly.js error', e);
}
