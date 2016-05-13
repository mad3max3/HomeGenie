[{
  Name: "Thermostat Widget",
  Author: "Mike Tanana",
  Version: "2016-02-05",

  GroupName: '',
  IconImage: 'pages/control/widgets/homegenie/generic/images/temperature.png',
  StatusText: '',
  Description: '',

  levelKnobBindValue: 'Heating',

  RenderView: function (cuid, module) {

    var container = $(cuid);
    var widget = container.find('[data-ui-field=widget]');
    var controlpopup = widget.data('ControlPopUp');
    var _this = this;

    if (!controlpopup) {

      container.find('[data-ui-field=controlpopup]').trigger('create');
      controlpopup = container.find('[data-ui-field=controlpopup]').popup();
      widget.data('ControlPopUp', controlpopup);

      widget.find('[data-ui-field=options]').on('click', function () {
        if ($(cuid).find('[data-ui-field=widget]').data('ControlPopUp')) {
          $(cuid).find('[data-ui-field=widget]').data('ControlPopUp').popup('open');
        }
      });

      controlpopup.find('[data-ui-field=level_knob]').knob({
        'release': function (v) {
          v = Math.round(v * 10) / 10;
          // API expects value to be always in Celsius scale
          if (HG.WebApp.Locales.GetTemperatureUnit() != 'Celsius')
            v = (v-32)/1.8;
          var setPoint = HG.WebApp.Utility.GetModulePropertyByName(module, 'Thermostat.SetPoint.' + _this.levelKnobBindValue);
          if (setPoint != null) setPoint.Value = v;
          HG.Control.Modules.ServiceCall('Thermostat.SetPointSet/' + _this.levelKnobBindValue, module.Domain, module.Address, v, function (data) { });
        },
        'change': function (v) {
          //controlpopup.find('[data-ui-field=status]').html(controlpopup.find('[data-ui-field=level_knob]').val() + '&deg;');
        }
      });

      if (HG.WebApp.Locales.GetTemperatureUnit() == 'Celsius') {
        controlpopup.find('[data-ui-field=level_knob]').trigger('configure', {
          min: 5,
          max: 35,
          step: 0.5
        });
      } else {
        controlpopup.find('[data-ui-field=level_knob]').trigger('configure', {
          min: 40,
          max: 100,
          step: 1
        });
      }

      // settings button
      widget.find('[data-ui-field=settings]').on('click', function () {
        if (module.Domain == 'HomeAutomation.HomeGenie.Automation') {
          HG.WebApp.ProgramEdit._CurrentProgram.Domain = module.Domain;
          HG.WebApp.ProgramEdit._CurrentProgram.Address = module.Address;
          HG.WebApp.ProgramsList.UpdateOptionsPopup();
        }
        else {
          HG.WebApp.Control.EditModule(module);
        }
      });

      // popup values on open
      controlpopup.on('popupbeforeposition', function (evt, ui) {
        if (_this.levelKnobBindValue == 'Heating')
        {
          _this.EditHeatSetPoint(controlpopup, module);
        }
        else
        {
          _this.EditCoolSetPoint(controlpopup, module);
        }
      });
      // set point buttons events
      controlpopup.find('[data-ui-field=cool_setpoint]').on('click', function () {
        _this.EditCoolSetPoint(controlpopup, module);
      });
      controlpopup.find('[data-ui-field=heat_setpoint]').on('click', function () {
        _this.EditHeatSetPoint(controlpopup, module);
      });
      // thermostat mode buttons events
      widget.find('[data-ui-field=mode_off]').on('click', function () {
        widget.find('[data-ui-field=mode_off]').addClass('ui-btn-active');
        widget.find('[data-ui-field=mode_cool]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_heat]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_auto]').removeClass('ui-btn-active');
        HG.Control.Modules.ServiceCall("Thermostat.ModeSet", module.Domain, module.Address, "Off", function (data) { });
      });
      widget.find('[data-ui-field=mode_cool]').on('click', function () {
        widget.find('[data-ui-field=mode_off]').removeClass('ui-bHG.WebApp.GroupModules.CurrentModule.Domaintn-active');
        widget.find('[data-ui-field=mode_cool]').addClass('ui-btn-active');
        widget.find('[data-ui-field=mode_heat]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_auto]').removeClass('ui-btn-active');
        _this.EditCoolSetPoint(controlpopup, module);
        HG.Control.Modules.ServiceCall("Thermostat.ModeSet", module.Domain, module.Address, "Cool", function (data) { });
      });
      widget.find('[data-ui-field=mode_heat]').on('click', function () {
        widget.find('[data-ui-field=mode_off]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_cool]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_heat]').addClass('ui-btn-active');
        widget.find('[data-ui-field=mode_auto]').removeClass('ui-btn-active');
        _this.EditHeatSetPoint(controlpopup, module);
        HG.Control.Modules.ServiceCall("Thermostat.ModeSet", module.Domain, module.Address, "Heat", function (data) { });
      });
      widget.find('[data-ui-field=mode_auto]').on('click', function () {
        widget.find('[data-ui-field=mode_off]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_cool]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_heat]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_auto]').addClass('ui-btn-active');
        HG.Control.Modules.ServiceCall("Thermostat.ModeSet", module.Domain, module.Address, "Auto", function (data) { });
      });
      // thermostate fan button events
      widget.find('[data-ui-field=fanmode_on]').on('click', function () {
        widget.find('[data-ui-field=fanmode_on]').addClass('ui-btn-active');
        widget.find('[data-ui-field=fanmode_auto]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=fanmode_circulate]').removeClass('ui-btn-active');
        HG.Control.Modules.ServiceCall("Thermostat.FanModeSet", module.Domain, module.Address, "OnLow", function (data) { });
      });
      widget.find('[data-ui-field=fanmode_auto]').on('click', function () {
        widget.find('[data-ui-field=fanmode_on]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=fanmode_auto]').addClass('ui-btn-active');
        widget.find('[data-ui-field=fanmode_circulate]').removeClass('ui-btn-active');
        HG.Control.Modules.ServiceCall("Thermostat.FanModeSet", module.Domain, module.Address, "AutoLow", function (data) { });
      });
      widget.find('[data-ui-field=fanmode_circulate]').on('click', function () {
        widget.find('[data-ui-field=fanmode_on]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=fanmode_auto]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=fanmode_circulate]').addClass('ui-btn-active');
        HG.Control.Modules.ServiceCall("Thermostat.FanModeSet", module.Domain, module.Address, "Circulate", function (data) { });
      });

    }

    this.Description = (module.Domain.substring(module.Domain.lastIndexOf('.') + 1)) + ' ' + module.Address;

    widget.find('[data-ui-field=name]').html(module.Name);
    widget.find('[data-ui-field=description]').html(this.Description);
    controlpopup.find('[data-ui-field=group]').html(this.GroupName);
    controlpopup.find('[data-ui-field=name]').html(module.Name);


    var imagesrc = 'pages/control/widgets/homegenie/generic/images/temperature.png';
    // display Temperature
    var temperatureField = HG.WebApp.Utility.GetModulePropertyByName(module, "Sensor.Temperature");
    var temperature = 0;
    if (temperatureField != null) {
      temperature = temperatureField.Value.replace(',', '.');
      widget.find('[data-ui-field=temperature_value]').html(HG.WebApp.Utility.FormatTemperature(temperature));
    } else {
      widget.find('[data-ui-field=temperature_value]').html('');
    }


    // display current Heating SetPoint
    var heatTo = HG.WebApp.Utility.GetModulePropertyByName(module, "Thermostat.SetPoint.Heating");
    if (heatTo == null || heatTo.Value == '') {
      widget.find('[data-ui-field=heat_field]').hide();
      widget.find('[data-ui-field=mode_heat]').hide();
      controlpopup.find('[data-ui-field=heat_setpoint]').hide();
    } else {
      widget.find('[data-ui-field=heat_field]').show();
      widget.find('[data-ui-field=mode_heat]').show();
      controlpopup.find('[data-ui-field=heat_setpoint]').show();
      var temperature = Math.round(heatTo.Value.replace(',', '.') * 100) / 100;
      widget.find('[data-ui-field=heatset_value]').html(HG.WebApp.Utility.FormatTemperature(temperature));
    }

    // display current Cooling SetPoint
    var coolTo = HG.WebApp.Utility.GetModulePropertyByName(module, "Thermostat.SetPoint.Cooling");
    if (coolTo == null || coolTo.Value == '') {
      widget.find('[data-ui-field=cool_field]').hide();
      widget.find('[data-ui-field=mode_cool]').hide();
      controlpopup.find('[data-ui-field=cool_setpoint]').hide();
    } else {
      widget.find('[data-ui-field=cool_field]').show();
      widget.find('[data-ui-field=mode_cool]').show();
      controlpopup.find('[data-ui-field=cool_setpoint]').show();
      var temperature = Math.round(coolTo.Value.replace(',', '.') * 100) / 100;
      widget.find('[data-ui-field=coolset_value]').html(HG.WebApp.Utility.FormatTemperature(temperature));
    }

    // display/hide Fan State in the status bar depending on mode
    var fanState = HG.WebApp.Utility.GetModulePropertyByName(module, "Thermostat.FanState");
    if (fanState == null || fanState.Value == '') {
      widget.find('[data-ui-field=fan_field]').hide();
      //widget.find('[data-ui-field=fan_controls]').hide();
    } else {
      widget.find('[data-ui-field=fan_field]').show();
      //widget.find('[data-ui-field=fan_controls]').show();
      var displayFan = '---';
      switch (fanState.Value) {
        case '1':
        case '2':
        case 'Running':
        case 'RunningHigh':
          displayFan = 'On';
          break;
        default:
          displayFan = 'Off';
          break;
      }
      widget.find('[data-ui-field=fan_value]').html(displayFan);
    }


    // display/hide SetPoints in the status bar depending on mode
    var operatingMode = HG.WebApp.Utility.GetModulePropertyByName(module, "Thermostat.Mode");
    widget.find('[data-ui-field=heat_field]').css('opacity', '0.5');
    widget.find('[data-ui-field=cool_field]').css('opacity', '0.5');
    var displayMode = '---';
    if (operatingMode != null) {
      displayMode = operatingMode.Value;
      switch (displayMode) {
        case 'Off':
        case 'FanOnly':
          //                    widget.find('[data-ui-field=heat_field]').css('opacity', '0');
          //                    widget.find('[data-ui-field=cool_field]').css('opacity', '0');
          break;
        case 'Heat':
        case 'AuxHeat':
        case 'Furnace':
        case 'HeatEconomy':
          widget.find('[data-ui-field=heat_field]').css('opacity', '1');
          break;
        case 'Cool':
        case 'CoolEconomy':
          widget.find('[data-ui-field=cool_field]').css('opacity', '1');
          break;
        default:
          break;
      }
    }
    widget.find('[data-ui-field=mode_value]').html(displayMode);


    // reset mode buttons' state
    widget.find('[data-ui-field=mode_off]').addClass('ui-btn-active');
    widget.find('[data-ui-field=mode_cool]').removeClass('ui-btn-active');
    widget.find('[data-ui-field=mode_heat]').removeClass('ui-btn-active');
    widget.find('[data-ui-field=mode_auto]').removeClass('ui-btn-active');
    // set current mode buttons' state from module properties 'Thermostat.Mode'
    var thermostatMode = HG.WebApp.Utility.GetModulePropertyByName(module, 'Thermostat.Mode');
    if (thermostatMode != null) {
      if (thermostatMode.Value == 'Cool') {
        widget.find('[data-ui-field=mode_off]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_cool]').addClass('ui-btn-active');
        _this.EditCoolSetPoint(controlpopup, module);
      }
      else if (thermostatMode.Value == 'Heat') {
        widget.find('[data-ui-field=mode_off]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_heat]').addClass('ui-btn-active');
        _this.EditHeatSetPoint(controlpopup, module);
      }
      else if (thermostatMode.Value == 'Auto') {
        widget.find('[data-ui-field=mode_off]').removeClass('ui-btn-active');
        widget.find('[data-ui-field=mode_auto]').addClass('ui-btn-active');
      }
    }

    // reset fan mode buttons
    widget.find('[data-ui-field=fanmode_on]').removeClass('ui-btn-active');
    widget.find('[data-ui-field=fanmode_auto]').removeClass('ui-btn-active');
    widget.find('[data-ui-field=fanmode_circulate]').removeClass('ui-btn-active');
    // set current fan mode buttons' state from module properties 'Thermostat.FanMode'
    var fanMode = HG.WebApp.Utility.GetModulePropertyByName(module, 'Thermostat.FanMode');
    if (fanMode != null) {
      if (fanMode.Value == 'On' || fanMode.Value == 'OnLow' || fanMode.Value == 'OnHigh') {
        widget.find('[data-ui-field=fanmode_on]').addClass('ui-btn-active');
      }
      else if (fanMode.Value == 'Auto' || fanMode.Value == 'AutoLow' || fanMode.Value == 'AutoHigh') {
        widget.find('[data-ui-field=fanmode_auto]').addClass('ui-btn-active');
      }
      else if (fanMode.Value == 'Circulate') {
        widget.find('[data-ui-field=fanmode_circulate]').addClass('ui-btn-active');
      }
    }


    // display status line (operating state + mode)
    var displayState = '';
    var operatingState = HG.WebApp.Utility.GetModulePropertyByName(module, "Thermostat.OperatingState");
    var operatingFanMode = HG.WebApp.Utility.GetModulePropertyByName(module, "Thermostat.FanMode");
    if (operatingState != null) displayState = operatingState.Value;
    if (operatingFanMode != null) displayState += ' '+operatingFanMode.Value;
    widget.find('[data-ui-field=operating_value]').html(displayState);

  },

  EditCoolSetPoint: function (controlpopup, module) {
    var levelKnob = controlpopup.find('[data-ui-field=level_knob]');
    controlpopup.find('[data-ui-field=heat_setpoint]').removeClass('ui-btn-active');
    controlpopup.find('[data-ui-field=cool_setpoint]').addClass('ui-btn-active');
    // show current cool setpoint
    var coolSetPoint = HG.WebApp.Utility.GetModulePropertyByName(module, 'Thermostat.SetPoint.Cooling');
    if (coolSetPoint != null) {
      levelKnob.val(HG.WebApp.Utility.GetLocaleTemperature(coolSetPoint.Value)).trigger('change');
      //controlpopup.find('[data-ui-field=status]').html(coolSetPoint.Value + '&deg;');
    }
    this.levelKnobBindValue = 'Cooling';
  },

  EditHeatSetPoint: function (controlpopup, module) {
    var levelKnob = controlpopup.find('[data-ui-field=level_knob]');
    controlpopup.find('[data-ui-field=cool_setpoint]').removeClass('ui-btn-active');
    controlpopup.find('[data-ui-field=heat_setpoint]').addClass('ui-btn-active');
    // show current heat setpoint
    var heatSetPoint = HG.WebApp.Utility.GetModulePropertyByName(module, 'Thermostat.SetPoint.Heating');
    if (heatSetPoint != null) {
      levelKnob.val(HG.WebApp.Utility.GetLocaleTemperature(heatSetPoint.Value)).trigger('change');
      //controlpopup.find('[data-ui-field=status]').html(heatSetPoint.Value + '&deg;');
    }
    this.levelKnobBindValue = 'Heating';
  }

}]