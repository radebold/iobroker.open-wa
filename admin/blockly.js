'use strict';

/* global Blockly, systemLang, main */

try {
    // ---------- TEXT (send) ----------
    Blockly.Words['open-wa']               = {'en': 'Open-WA', 'de': 'Open-WA'};
    Blockly.Words['open-wa_message']       = {'en': 'message', 'de': 'Meldung'};
    Blockly.Words['open-wa_to']            = {'en': 'Recipient (optional)', 'de': 'Empfänger (optional)'};
    Blockly.Words['open-wa_tooltip']       = {'en': 'Send WhatsApp message via open-wa gateway', 'de': 'WhatsApp Nachricht über open-wa Gateway senden'};
    Blockly.Words['open-wa_log']           = {'en': 'log level', 'de': 'Loglevel'};
    Blockly.Words['open-wa_log_none']      = {'en': 'none', 'de': 'keins'};
    Blockly.Words['open-wa_log_info']      = {'en': 'info', 'de': 'info'};
    Blockly.Words['open-wa_log_debug']     = {'en': 'debug', 'de': 'debug'};
    Blockly.Words['open-wa_log_warn']      = {'en': 'warning', 'de': 'warning'};
    Blockly.Words['open-wa_log_error']     = {'en': 'error', 'de': 'error'};

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

    Blockly.Sendto.blocks['open-wa'] =
        '<block type="open-wa">'
        + '     <value name="INSTANCE"></value>'
        + '     <value name="MESSAGE">'
        + '         <shadow type="text"><field name="TEXT">text</field></shadow>'
        + '     </value>'
        + '     <value name="TO"></value>'
        + '     <value name="LOG"></value>'
        + '</block>';

    Blockly.Blocks['open-wa'] = {
        init: function() {
            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Words['open-wa'][systemLang] || Blockly.Words['open-wa'].en)
                .appendField(new Blockly.FieldDropdown(getInstanceOptions), 'INSTANCE');

            this.appendValueInput('MESSAGE')
                .appendField(Blockly.Words['open-wa_message'][systemLang] || Blockly.Words['open-wa_message'].en);

            var input = this.appendValueInput('TO')
                .setCheck('String')
                .appendField(Blockly.Words['open-wa_to'][systemLang] || Blockly.Words['open-wa_to'].en);

            this.appendDummyInput('LOG')
                .appendField(Blockly.Words['open-wa_log'][systemLang] || Blockly.Words['open-wa_log'].en)
                .appendField(new Blockly.FieldDropdown([
                    [Blockly.Words['open-wa_log_none'][systemLang]  || Blockly.Words['open-wa_log_none'].en,  ''],
                    [Blockly.Words['open-wa_log_info'][systemLang]  || Blockly.Words['open-wa_log_info'].en,  'log'],
                    [Blockly.Words['open-wa_log_debug'][systemLang] || Blockly.Words['open-wa_log_debug'].en, 'debug'],
                    [Blockly.Words['open-wa_log_warn'][systemLang]  || Blockly.Words['open-wa_log_warn'].en,  'warn'],
                    [Blockly.Words['open-wa_log_error'][systemLang] || Blockly.Words['open-wa_log_error'].en, 'error']
                ]), 'LOG');

            if (input.connection) input.connection._optional = true;

            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);

            this.setColour(Blockly.Sendto.HUE);
            this.setTooltip(Blockly.Words['open-wa_tooltip'][systemLang] || Blockly.Words['open-wa_tooltip'].en);
        }
    };

    Blockly.JavaScript['open-wa'] = function(block) {
        var dropdown_instance = block.getFieldValue('INSTANCE'); // like ".0"
        var logLevel = block.getFieldValue('LOG');
        var value_message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
        var value_to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);

        var logText = '';
        if (logLevel) {
            logText =
                'console.' + logLevel + '("open-wa' +
                (value_to ? '[' + value_to + ']' : '') +
                ': " + ' + value_message + ');\n';
        }

        return 'sendTo("open-wa' + dropdown_instance + '", "send", {\n    content: ' +
            value_message + (value_to ? ',\n    to: ' + value_to : '') +
            '\n});\n' + logText;
    };

    // ---------- IMAGE (sendImage) ----------
    Blockly.Words['open-wa_image']         = {'en': 'send image', 'de': 'Bild senden'};
    Blockly.Words['open-wa_file']          = {'en': 'file path / url', 'de': 'Datei (Pfad/URL)'};
    Blockly.Words['open-wa_filename']      = {'en': 'filename', 'de': 'Dateiname'};
    Blockly.Words['open-wa_caption']       = {'en': 'caption', 'de': 'Text (Caption)'};
    Blockly.Words['open-wa_image_tooltip'] = {'en': 'Send image via /sendImage', 'de': 'Bild über /sendImage senden'};

    Blockly.Sendto.blocks['open-wa-image'] =
        '<block type="open-wa-image">'
        + '     <value name="INSTANCE"></value>'
        + '     <value name="TO"></value>'
        + '     <value name="FILE">'
        + '         <shadow type="text"><field name="TEXT">/opt/iobroker/iobroker-data/files/test.jpg</field></shadow>'
        + '     </value>'
        + '     <value name="FILENAME">'
        + '         <shadow type="text"><field name="TEXT">test.jpg</field></shadow>'
        + '     </value>'
        + '     <value name="CAPTION">'
        + '         <shadow type="text"><field name="TEXT"></field></shadow>'
        + '     </value>'
        + '</block>';

    Blockly.Blocks['open-wa-image'] = {
        init: function() {
            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Words['open-wa'][systemLang] || Blockly.Words['open-wa'].en)
                .appendField(Blockly.Words['open-wa_image'][systemLang] || Blockly.Words['open-wa_image'].en)
                .appendField(new Blockly.FieldDropdown(getInstanceOptions), 'INSTANCE');

            var inputTo = this.appendValueInput('TO')
                .setCheck('String')
                .appendField(Blockly.Words['open-wa_to'][systemLang] || Blockly.Words['open-wa_to'].en);

            if (inputTo.connection) inputTo.connection._optional = true;

            this.appendValueInput('FILE')
                .setCheck('String')
                .appendField(Blockly.Words['open-wa_file'][systemLang] || Blockly.Words['open-wa_file'].en);

            this.appendValueInput('FILENAME')
                .setCheck('String')
                .appendField(Blockly.Words['open-wa_filename'][systemLang] || Blockly.Words['open-wa_filename'].en);

            this.appendValueInput('CAPTION')
                .setCheck('String')
                .appendField(Blockly.Words['open-wa_caption'][systemLang] || Blockly.Words['open-wa_caption'].en);

            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(Blockly.Sendto.HUE);
            this.setTooltip(Blockly.Words['open-wa_image_tooltip'][systemLang] || Blockly.Words['open-wa_image_tooltip'].en);
        }
    };

    Blockly.JavaScript['open-wa-image'] = function(block) {
        var dropdown_instance = block.getFieldValue('INSTANCE');
        var value_to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);
        var value_file = Blockly.JavaScript.valueToCode(block, 'FILE', Blockly.JavaScript.ORDER_ATOMIC);
        var value_filename = Blockly.JavaScript.valueToCode(block, 'FILENAME', Blockly.JavaScript.ORDER_ATOMIC);
        var value_caption = Blockly.JavaScript.valueToCode(block, 'CAPTION', Blockly.JavaScript.ORDER_ATOMIC);

        return 'sendTo("open-wa' + dropdown_instance + '", "sendImage", {\n' +
            (value_to ? '    to: ' + value_to + ',\n' : '') +
            '    file: ' + value_file + ',\n' +
            '    filename: ' + value_filename + ',\n' +
            '    caption: ' + value_caption + '\n' +
            '});\n';
    };
} catch (e) {
    if (typeof console !== 'undefined') console.error('open-wa blockly.js error', e);
}
