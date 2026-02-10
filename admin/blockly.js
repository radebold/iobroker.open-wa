'use strict';
/* global Blockly, systemLang, getAdapterInstances */

(function () {
  if (typeof Blockly === 'undefined') return;

  Blockly.CustomBlocks = Blockly.CustomBlocks || [];
  if (!Blockly.CustomBlocks.includes('open-wa')) Blockly.CustomBlocks.push('open-wa');

  Blockly.Words = Blockly.Words || {};

  Blockly.Words['open-wa'] = {
    en: 'Open-WA',
    de: 'Open-WA',
    ru: 'Open-WA',
    pt: 'Open-WA',
    nl: 'Open-WA',
    fr: 'Open-WA',
    it: 'Open-WA',
    es: 'Open-WA',
    pl: 'Open-WA',
    'zh-cn': 'Open-WA'
  };

  Blockly.Words['openwa_send'] = {
    en: 'send WhatsApp message',
    de: 'WhatsApp Nachricht senden'
  };

  Blockly.Words['openwa_instance'] = {
    en: 'instance',
    de: 'Instanz'
  };

  Blockly.Words['openwa_to'] = {
    en: 'recipient (optional)',
    de: 'Empfänger (optional)'
  };

  Blockly.Words['openwa_text'] = {
    en: 'message',
    de: 'Meldung'
  };

  function getInstancesDropdown() {
    try {
      if (typeof getAdapterInstances === 'function') {
        const list = getAdapterInstances('open-wa');
        if (list && list.length) return list;
      }
    } catch (e) {
      // ignore
    }
    return [['open-wa.0', 'open-wa.0']];
  }

  Blockly.Blocks['openwa_send'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(Blockly.Words['open-wa'][systemLang] || Blockly.Words['open-wa'].en)
        .appendField(Blockly.Words['openwa_send'][systemLang] || Blockly.Words['openwa_send'].en);

      this.appendDummyInput()
        .appendField(Blockly.Words['openwa_instance'][systemLang] || Blockly.Words['openwa_instance'].en)
        .appendField(new Blockly.FieldDropdown(getInstancesDropdown), 'INSTANCE');

      this.appendValueInput('TO')
        .setCheck('String')
        .appendField(Blockly.Words['openwa_to'][systemLang] || Blockly.Words['openwa_to'].en);

      this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField(Blockly.Words['openwa_text'][systemLang] || Blockly.Words['openwa_text'].en);

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(Blockly.Sendto ? Blockly.Sendto.HUE : 210);
      this.setTooltip('Send WhatsApp message via open-wa adapter');
      this.setHelpUrl('');
    }
  };

  Blockly.JavaScript['openwa_send'] = function (block) {
    const instance = block.getFieldValue('INSTANCE') || 'open-wa.0';
    const to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_ATOMIC) || '""';
    const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';

    return (
      `if (${to} && ${to} !== '""') { setState('${instance}.send.to', ${to}); }\n` +
      `setState('${instance}.send.text', ${text});\n`
    );
  };
})();
