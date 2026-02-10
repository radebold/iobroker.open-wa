/* eslint-disable no-var */
/* global Blockly, systemLang */
(function () {
  try {
    if (typeof Blockly === 'undefined') return;

    Blockly.CustomBlocks = Blockly.CustomBlocks || [];
    if (Blockly.CustomBlocks.indexOf('open-wa') === -1) Blockly.CustomBlocks.push('open-wa');

    Blockly.Words = Blockly.Words || {};
    Blockly.Words['open-wa'] = Blockly.Words['open-wa'] || { en: 'Open-WA', de: 'Open-WA' };
    Blockly.Words['openwa_send'] = Blockly.Words['openwa_send'] || { en: 'send WhatsApp message', de: 'WhatsApp Nachricht senden' };
    Blockly.Words['openwa_instance'] = Blockly.Words['openwa_instance'] || { en: 'instance', de: 'Instanz' };
    Blockly.Words['openwa_to'] = Blockly.Words['openwa_to'] || { en: 'recipient (optional)', de: 'Empfänger (optional)' };
    Blockly.Words['openwa_text'] = Blockly.Words['openwa_text'] || { en: 'message', de: 'Meldung' };

    function instanceDropdown() {
      return [['open-wa.0', 'open-wa.0']];
    }

    Blockly.Blocks['openwa_send'] = {
      init: function () {
        this.appendDummyInput()
          .appendField(Blockly.Words['open-wa'][systemLang] || Blockly.Words['open-wa'].en)
          .appendField(Blockly.Words['openwa_send'][systemLang] || Blockly.Words['openwa_send'].en);

        this.appendDummyInput()
          .appendField(Blockly.Words['openwa_instance'][systemLang] || Blockly.Words['openwa_instance'].en)
          .appendField(new Blockly.FieldDropdown(instanceDropdown), 'INSTANCE');

        this.appendValueInput('TO')
          .setCheck('String')
          .appendField(Blockly.Words['openwa_to'][systemLang] || Blockly.Words['openwa_to'].en);

        this.appendValueInput('TEXT')
          .setCheck('String')
          .appendField(Blockly.Words['openwa_text'][systemLang] || Blockly.Words['openwa_text'].en);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip('Send WhatsApp message via open-wa adapter');
        this.setHelpUrl('');
      }
    };

    Blockly.JavaScript['openwa_send'] = function (block) {
      var instance = block.getFieldValue('INSTANCE') || 'open-wa.0';
      var to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC) || '""';
      var text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';

      return (
        'var __openwa_to = ' + to + ';\n' +
        'if (__openwa_to) { setState(\"' + instance + '.send.to\", __openwa_to); }\n' +
        'setState(\"' + instance + '.send.text\", ' + text + ');\n'
      );
    };
  } catch (e) {
    try { console.error('open-wa blockly.js failed:', e); } catch (ignore) {}
  }
})();
