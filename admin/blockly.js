'use strict';

/* global Blockly, systemLang, main */

try {
    Blockly.Words['open-wa']               = {'en': 'Open-WA', 'de': 'Open-WA', 'ru': 'Open-WA', 'pt': 'Open-WA', 'nl': 'Open-WA', 'it': 'Open-WA', 'es': 'Open-WA', 'fr': 'Open-WA', 'pl': 'Open-WA', 'zh-cn': 'Open-WA'};
    Blockly.Words['open-wa_message']       = {'en': 'message', 'de': 'Meldung', 'ru': 'сообщение', 'pt': 'mensagem', 'nl': 'bericht', 'it': 'Messaggio', 'es': 'mensaje', 'fr': 'message', 'pl': 'wiadomość', 'zh-cn': 'message'};
    Blockly.Words['open-wa_to']            = {'en': 'Recipient (optional)', 'de': 'Empfänger (optional)', 'ru': 'получатель (не обяз.)', 'pt': 'Destinatário (opcional)', 'nl': 'Ontvanger (optioneel)', 'it': 'Destinatario (opzionale)', 'es': 'Destinatario (opcional)', 'fr': 'Destinataire (facultatif)', 'pl': 'Odbiorca (opcjonalnie)', 'zh-cn': 'recipient (optional)'};
    Blockly.Words['open-wa_anyInstance']   = {'en': 'all instances', 'de': 'Alle Instanzen', 'ru': 'На все драйвера', 'pt': 'todas as instâncias', 'nl': 'alle instanties', 'it': 'tutte le istanze', 'es': 'todas las instancias', 'fr': 'toutes les instances', 'pl': 'wszystkie instancje', 'zh-cn': 'all instances'};
    Blockly.Words['open-wa_tooltip']       = {'en': 'Send WhatsApp message via open-wa gateway', 'de': 'WhatsApp Nachricht über open-wa Gateway senden', 'ru': 'send', 'pt': 'send', 'nl': 'send', 'it': 'send', 'es': 'send', 'fr': 'send', 'pl': 'send', 'zh-cn': 'send'};
    Blockly.Words['open-wa_log']           = {'en': 'log level', 'de': 'Loglevel', 'ru': 'Протокол', 'pt': 'nível de log', 'nl': 'Log niveau', 'it': 'livello log', 'es': 'nivel de registro', 'fr': 'niveau de journalisation', 'pl': 'poziom dziennika', 'zh-cn': 'log level'};
    Blockly.Words['open-wa_log_none']      = {'en': 'none', 'de': 'keins', 'ru': 'нет', 'pt': 'Nenhum', 'nl': 'geen', 'it': 'nessuna', 'es': 'ninguna', 'fr': 'aucun', 'pl': 'Żaden', 'zh-cn': 'none'};
    Blockly.Words['open-wa_log_info']      = {'en': 'info', 'de': 'info', 'ru': 'инфо', 'pt': 'info', 'nl': 'Info', 'it': 'Informazioni', 'es': 'información', 'fr': 'Info', 'pl': 'informacje', 'zh-cn': 'info'};
    Blockly.Words['open-wa_log_debug']     = {'en': 'debug', 'de': 'debug', 'ru': 'debug', 'pt': 'depurar', 'nl': 'Debug', 'it': 'Debug', 'es': 'depurar', 'fr': 'déboguer', 'pl': 'odpluskwić', 'zh-cn': 'debug'};
    Blockly.Words['open-wa_log_warn']      = {'en': 'warning', 'de': 'warning', 'ru': 'warning', 'pt': 'Atenção', 'nl': 'waarschuwing', 'it': 'avvertimento', 'es': 'advertencia', 'fr': 'Attention', 'pl': 'ostrzeżenie', 'zh-cn': 'warning'};
    Blockly.Words['open-wa_log_error']     = {'en': 'error', 'de': 'error', 'ru': 'ошибка', 'pt': 'erro', 'nl': 'fout', 'it': 'errore', 'es': 'error', 'fr': 'Erreur', 'pl': 'błąd', 'zh-cn': 'error'};

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
            var options = [[Blockly.Words['open-wa_anyInstance'][systemLang], '']];
            if (typeof main !== 'undefined' && main.instances) {
                for (var i = 0; i < main.instances.length; i++) {
                    var m = main.instances[i].match(/^system\\.adapter\\.open-wa\\.(\\d+)$/);
                    if (m) {
                        var k = parseInt(m[1], 10);
                        options.push(['open-wa.' + k, '.' + k]);
                    }
                }
                if (options.length === 1) {
                    for (var u = 0; u <= 4; u++) options.push(['open-wa.' + u, '.' + u]);
                }
            } else {
                for (var n = 0; n <= 4; n++) options.push(['open-wa.' + n, '.' + n]);
            }

            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Words['open-wa'][systemLang])
                .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

            this.appendValueInput('MESSAGE')
                .appendField(Blockly.Words['open-wa_message'][systemLang]);

            var input = this.appendValueInput('TO')
                .setCheck('String')
                .appendField(Blockly.Words['open-wa_to'][systemLang]);

            this.appendDummyInput('LOG')
                .appendField(Blockly.Words['open-wa_log'][systemLang])
                .appendField(new Blockly.FieldDropdown([
                    [Blockly.Words['open-wa_log_none'][systemLang],  ''],
                    [Blockly.Words['open-wa_log_info'][systemLang],  'log'],
                    [Blockly.Words['open-wa_log_debug'][systemLang], 'debug'],
                    [Blockly.Words['open-wa_log_warn'][systemLang],  'warn'],
                    [Blockly.Words['open-wa_log_error'][systemLang], 'error']
                ]), 'LOG');

            if (input.connection) input.connection._optional = true;

            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);

            this.setColour(Blockly.Sendto.HUE);
            this.setTooltip(Blockly.Words['open-wa_tooltip'][systemLang]);
        }
    };

    Blockly.JavaScript['open-wa'] = function(block) {
        var dropdown_instance = block.getFieldValue('INSTANCE');
        var logLevel = block.getFieldValue('LOG');
        var value_message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
        var value_to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC);

        var logText = '';
        if (logLevel) {
            logText = 'console.' + logLevel + '("open-wa' + (value_to ? '[' + value_to + ']' : '') + ': " + ' + value_message + ');\\n';
        }

        return 'sendTo("open-wa' + dropdown_instance + '", "send", {\\n    content: ' +
            value_message + (value_to ? ',\\n    to: ' + value_to : '') +
            '\\n});\\n' + logText;
    };
} catch (e) {
    if (typeof console !== 'undefined') console.error('open-wa blockly.js error', e);
}
