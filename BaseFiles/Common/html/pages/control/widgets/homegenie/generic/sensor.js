﻿$$.widget = {
  name: 'Generic Sensor',
  version: '1.2',
  author: 'Generoso Martello',
  release: '2016-05-06',
  icon: 'pages/control/widgets/homegenie/generic/images/sensor.png'
};

var paramTemplate = null;
var paramIndex = 0;
var tickerTimeout = null;
var updateTime = '';

$$.onStart = function() {
  // Settings button click
  $$.field('settings').on('click', function () {
    $$.ui.EditModule($$.module);
  });
  $$.field('sensorstatus').on('click', function() {
    $$.showNextParam();    
  });
}

$$.onRefresh = function () {
  // Refresh UI fields
  $$.field('name').html($$.module.Name);
  $$.field('description').html(($$.module.Domain.substring($$.module.Domain.lastIndexOf('.') + 1)) + ' ' + $$.module.Address);
  $$.refreshStatus();
  $$.refreshBattery();
  $$.refreshTamper();
  //$$.refreshSleepingStatus();
  $$.refreshParams();
  $$.showNextParam();
}

$$.onUpdate = function(parameter, value) {
  switch(parameter) {
    case 'Status.Level':
    case 'Sensor.Generic':
      $$.refreshStatus();
      $$.refreshParams();
      $$.signalActity('name');
      break;
    case 'Status.Error':
      if (value != '' && $$.field('led').length)
        $$.field('led').attr('src', 'images/common/led_red.png');
      break;
    case 'Status.Battery':
      $$.refreshBattery();
      $$.signalActity('status-battery');
      break;
    case 'Sensor.Alarm':
    case 'Sensor.Tamper':
      $$.refreshTamper();
      $$.signalActity('status-tamper');
      break;
    case 'ZwaveNode_WakeUpSleepingStatus':
      //$$.refreshSleepingStatus();
      break;
    default:
      $$.signalActity();
      $$.refreshParams();
      $$.focusParam(parameter);
      $$.refreshStatus();
  }
}

$$.onStop = function() {
  // TODO: ..
}


$$.refreshBattery = function() {
  var param = $$.module.prop('Status.Battery');
  if (param != null && param.Value !== '') {
    var ctx = $$.ui.GetParameterContext($$.module, param.Name, param.Value);
    $$.field('status-battery-image').attr('src', ctx.iconImage);
    $$.field('status-battery-level').html(ctx.valueText);
    $$.field('status-battery').show();
  } else {
    $$.field('status-battery').hide();
  }
}

$$.refreshTamper = function() {
  var tamper = $$.module.prop('Sensor.Tamper');
  var alarm = $$.module.prop('Sensor.Alarm');
  if (tamper != null && (alarm == null || tamper.UpdateTime >= alarm.UpdateTime)) {
    tamper = Module.getDoubleValue(tamper.Value);
  } else if (alarm != null) {
    tamper = Module.getDoubleValue(alarm.Value);
  } else {
    tamper = 0;
  }
  if (tamper > 0) {
    $$.field('status-tamper').html('<span style="color:red;vertical-align:middle">TAMPERED</span>');
    $$.field('status-tamper').show();
  } else {
    $$.field('status-tamper').hide();
  }
}

$$.refreshStatus = function() {
  HG.Ui.GetModuleIcon($$.module, function(imgPath){
    $$.field('icon').attr('src', imgPath);
    $$.widget.icon = imgPath;
  });
  var d = new Date(updateTime.replace(' ', 'T'));
  $$.field('updatetime').html($$.util.FormatDate(d) + ' ' + $$.util.FormatDateTime(d));
}

$$.focusParam = function(paramName) {
  var param = $$.field('sensorstatus').find('[data-param-name="'+paramName+'"]');
  if (param.length) {
    paramIndex = parseInt(param.attr('data-param-index'));
    $$.showNextParam();
    HG.Ui.BlinkAnim(param);
  }
}

$$.showNextParam = function() {
  var param = $$.field('sensorstatus').children().eq(paramIndex);
  param.clearQueue();
  param.finish();
  param.css('opacity', 1);
  param.fadeIn(500);
  $.each(param.siblings().not(param), function(k,v){
    if ($(this).css('opacity') != '0') {
      $(this).clearQueue();
      $(this).finish();
      $(this).fadeOut(500);
    }
    return true;
  });
  if (paramIndex < $$.field('sensorstatus').children().length - 1)
    paramIndex++;
  else
    paramIndex = 0;
  if (tickerTimeout != null)
    clearTimeout(tickerTimeout);
  tickerTimeout =  setTimeout($$.showNextParam, 5000);
}

$$.refreshParams = function() {
  if (paramTemplate == null)
    paramTemplate = $$.field('template').html();
  $$.field('sensorstatus').empty();
  if ($$.module.Properties != null) {
    var idx = 0;
    for (p = 0; p < $$.module.Properties.length; p++) {
      var parameter = $$.module.Properties[p];
      if (parameter.Name != 'Status.Battery' && parameter.Name != 'Status.Error' && parameter.Name != 'Sensor.Alarm' && parameter.Name != 'Sensor.Tamper') {
        var ctx = $$.ui.GetParameterContext($$.module, parameter.Name, parameter.Value);
        if (!ctx.isUnknown) {
          var paramBox = $(paramTemplate);
          paramBox.find('[data-ui-field=param-icon]').attr('src', ctx.iconImage);
          paramBox.find('[data-ui-field=param-name]').html(ctx.displayName);
          paramBox.find('[data-ui-field=param-value]').html(ctx.valueText);
          $$.field('sensorstatus').append(paramBox);
          if (updateTime < parameter.UpdateTime)
            updateTime = parameter.UpdateTime;
          paramBox.attr('data-param-name', parameter.Name);
          paramBox.attr('data-param-index', idx);
          paramBox.css('opacity', 0);
          idx++;
        }
      }
    }
  }
}