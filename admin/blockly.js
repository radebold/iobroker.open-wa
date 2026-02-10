'use strict';

/* global Blockly, systemLang, main */

try {
    // --- SendTo open-wa --------------------------------------------------
    Blockly.Words['open-wa']               = {'en': 'Open-WA', 'de': 'Open-WA', 'ru': 'Open-WA', 'pt': 'Open-WA', 'nl': 'Open-WA', 'it': 'Open-WA', 'es': 'Open-WA', 'fr': 'Open-WA', 'pl': 'Open-WA', 'zh-cn': 'Open-WA'};
    Blockly.Words['open-wa_message']       = {'en': 'message', 'de': 'Meldung', 'ru': 'сообщение', 'pt': 'mensagem', 'nl': 'bericht', 'it': 'Messaggio', 'es': 'mensaje', 'fr': 'message', 'pl': 'wiadomość', 'zh-cn': 'message'};
    Blockly.Words['open-wa_to']            = {'en': 'Recipient (optional)', 'de': 'Empfänger (optional)', 'ru': 'получатель (не обяз.)', 'pt': 'Destinatário (opcional)', 'nl': 'Ontvanger (optioneel)', 'it': 'Destinatario (opzionale)', 'es': 'Destinatario (opcional)', 'fr': 'Destinataire (facultatif)', 'pl': 'Odbiorca (opcjonalnie)', 'zh-cn': 'recipient (optional)'};
    Blockly.Words['open-wa_tooltip']       = {'en': 'Send WhatsApp message via open-wa gateway', 'de': 'WhatsApp Nachricht über open-wa Gateway senden'};
    Blockly.Words['open-wa_log']           = {'en': 'log level', 'de': 'Loglevel'};
    Blockly.Words['open-wa_log_none']      = {'en': 'none', 'de': 'keins'};
    Blockly.Words['open-wa_log_info']      = {'en': 'info', 'de': 'info'};
    Blockly.Words['open-wa_log_debug']     = {'en': 'debug', 'de': 'debug'};
    Blockly.Words['open-wa_log_warn']      = {'en': 'warning', 'de': 'warning'};
    Blockly.Words['open-wa_log_error']     = {'en': 'error', 'de': 'error'};

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
            // Only show instances that actually exist
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

            // Fallback (shouldn't happen often). Do NOT add 0..4, just one placeholder.
            if (!options.length) {
                options.push(['open-wa.0', '.0']);
            }

            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Words['open-wa'][systemLang] || Blockly.Words['open-wa'].en)
                .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

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

        // IMPORTANT: Use real newlines in generated JS (no "\n" escapes outside strings)
        return 'sendTo("open-wa' + dropdown_instance + '", "send", {\n    content: ' +
            value_message + (value_to ? ',\n    to: ' + value_to : '') +
            '\n});\n' + logText;
    };
} catch (e) {
    if (typeof console !== 'undefined') console.error('open-wa blockly.js error', e);
}
