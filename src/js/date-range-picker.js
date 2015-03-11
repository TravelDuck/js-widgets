(function($) {

  var displayElement;
  var mainContainer;
  var settings;

  var selectedStartDay;
  var selectedEndDay;


  var methods = {
    init : function(options) {

      settings = $.extend({

        // Not specified by default.
        startDateInput: null,
        endDateInput: null,

        // Default display options
        format: "dd-mm-yyyy",
        weekStart: 6

      }, options);

      setupDatePickers();

      return this;
    },

    clear: function() {
      clear();
    }
  };


  /**
   * jQuery function.
   *
   * @param methodOrOptions
   * @returns {*}
   */
  $.fn.gaDateRangePicker = function(methodOrOptions) {

    if(methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if(typeof methodOrOptions === "object" || !methodOrOptions) {
      return methods.init.apply( this, arguments );
    } else {
      $.error("Method " +  methodOrOptions + " does not exist on jQuery.gaDateRangePicker");
    }
  };

  /**
   * Setup the date pickers.
   */
  function setupDatePickers() {

    var startDateInput = settings.startDateInput;
    var endDateInput = settings.endDateInput;

    if(!startDateInput) {
      console.error("You must specify the start date input. Specify a selector such as \"#start-date\" as the 'startDateInput' option.");
      return;
    }

    if(!endDateInput) {
      console.error("You must specify the end date input. Specify a selector such as \"#end-date\" as the 'endDateInput' option.");
      return;
    }

    // --- --- ---


    var checkin = $(startDateInput).prop(
      "readonly", true
    ).gaDatePicker({
      todayBtn: true,
      onRender: function(date) {
        var classes = generateClasses(CalendarDay.fromDate(date));
        return classes.join(" ");
      },

      // Display settings
      format: settings.format,
      weekStart: settings.weekStart

    }).on("focus", function(e) {

      checkout.gaDatePicker("hide");

    }).on('changeDate', function(e) {
      setSelectedStartDayFromDate(e.date);

      //checkout.gaDatePicker("setValue", e.date);

      checkin.gaDatePicker("update");
      checkout.gaDatePicker("update");

      checkin.gaDatePicker("hide");

      if(!checkout.val()) {
        checkout.gaDatePicker("setViewDate", e.date);
      }

      checkout.focus();

      //loadPrice();
    }).on("mousedown", function(e) {

      //checkout.gaDatePicker("hide");
      checkin.gaDatePicker("show");

    });


    var checkout = $(endDateInput).prop(
      "readonly", true
    ).gaDatePicker({
      onRender: function(date) {
        var classes = generateClasses(CalendarDay.fromDate(date));

        //classes = addColourClasses(CalendarDay.fromDate(date), colouring, classes, false);
        return classes.join(" ");
      },

      // Display settings
      format: settings.format,
      weekStart: settings.weekStart

    }).on('changeDate', function(e) {
      setSelectedEndDayFromDate(e.date);

      checkin.gaDatePicker("update");
      checkout.gaDatePicker("update");

      //checkout.gaDatePicker("hide");
      checkout.blur();

      //loadPrice();
    }).on("focus", function(e) {

      checkin.gaDatePicker("hide");

      if(!checkin.val()) {
        clear();
        checkout.gaDatePicker("hide");
        checkin.focus();
      }

    }).on("hide", function() {

      if(!checkout.val()) {
        clear();
      }

    }).on("hoverDate", function(e) {

      console.log("hover");

      setSelectedEndDayFromDate(e.date);
      checkin.gaDatePicker("update");
      checkout.gaDatePicker("update");

    });

  }


  /**
   * Clear the selected dates.
   */
  function clear() {

    selectedStartDay = null;
    selectedEndDay = null;

    $(settings.startDateInput).val("").gaDatePicker("update");
    $(settings.endDateInput).val("").gaDatePicker("update");

  }




  /**
   * Set the start date of the booking.
   */
  function setSelectedStartDayFromDate(startDate) {
    selectedStartDay = CalendarDay.fromDate(startDate);
  }


  /**
   * Set the end date of the booking.
   */
  function setSelectedEndDayFromDate(endDate) {
    selectedEndDay = CalendarDay.fromDate(endDate);
  }



  function generateClasses(calendarDay) {
    var classes = [];

    if(selectedStartDay && calendarDay.isEqualTo(selectedStartDay)) {
      classes.push("start-date");
    }

    if(selectedEndDay && calendarDay.isEqualTo(selectedEndDay)) {
      classes.push("end-date");
    }

    if(
      selectedStartDay && selectedEndDay &&
        calendarDay.isGreaterThan(selectedStartDay) &&
        calendarDay.isLessThan(selectedEndDay)
      ) {
      classes.push("selected-date");
    }

    return classes;
  }


}(jQuery));