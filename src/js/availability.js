(function($) {

  var displayElement;
  var mainContainer;
  var settings;


  var methods = {
    init : function(options) {

      var currentMonth = CalendarMonth.currentMonth();

      settings = $.extend({

        startMonth: currentMonth.getMonth(),
        startYear: currentMonth.getYear(),

        // By default display 12 months of calendars
        numberOfMonthsToDisplay: 12,

        //
        // Day of the week is represented as an int where:
        //   1 -> Monday
        //   2 -> Tuesday
        //   ...
        //   7 -> Sunday
        //
        // Saturday (6) is the most common change over day,
        // so we choose this as the default.
        //
        weekChangeOverDay: 6

      }, options);

      // --- --- --- --- --- ---

      displayElement = this;

      mainContainer = document.createElement("div");
      displayElement.append(mainContainer);

      // Hide calendars by default
      mainContainer.style.opacity = 0;

      draw();
      refreshAvailability();

      //
      // Auto refresh displayed availability every 30 seconds.
      //
      // If property availability if updated, calendar
      // colouring is updated on the displayed calendars.
      //
      setInterval(function() {
        refreshAvailability();
      }, 30000);

      return this;
    }
  };


  /**
   * jQuery function.
   *
   * @param methodOrOptions
   * @returns {*}
   */
  $.fn.travelduckAvailability = function(methodOrOptions) {

    if(methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if(typeof methodOrOptions === "object" || !methodOrOptions) {
      return methods.init.apply( this, arguments );
    } else {
      $.error("Method " +  methodOrOptions + " does not exist on jQuery.travelduckAvailability");
    }
  };


  /**
   * Get the Property to display the availability of.
   *
   * @returns {TravelDuck_Property}
   */
  function property() {
    return new TravelDuck_Property($(displayElement).data("property-id"));
  }


  /**
   * Get the day of the week that each week should start with (The change over day).
   *
   * @returns {DayOfWeek}
   */
  function weekChangeOverDay() {
    var changeOverDay = new DayOfWeek(settings.weekChangeOverDay);

    // Read from data if available.
    var dataWeekChangeOverDay = $(displayElement).data("week-change-over-day");
    if(dataWeekChangeOverDay !== null) {
      changeOverDay = new DayOfWeek(dataWeekChangeOverDay)
    }

    return changeOverDay;
  }


  /**
   * Get the number of months that should be displayed.
   *
   * @returns {number}
   */
  function numberOfMonthsToDisplay() {
    var numberOfMonthsToDisplay = settings.numberOfMonthsToDisplay;

    // Read from data if available.
    var dataNumberOfMonthsToDisplay = $(displayElement).data("number-of-months-to-display");
    if(dataNumberOfMonthsToDisplay) {
      numberOfMonthsToDisplay = dataNumberOfMonthsToDisplay;
    }

    return numberOfMonthsToDisplay;
  }


  /**
   * Get the first month that should be displayed.
   *
   * @returns {CalendarMonth}
   */
  function startMonth() {
    return new CalendarMonth(settings.startYear, settings.startMonth);
  }


  /**
   * Get the last month that should be displayed.
   *
   * @returns {CalendarMonth}
   */
  function endMonth() {
    return startMonth().plusMonths(numberOfMonthsToDisplay() - 1);
  }


  /**
   * Get the range of months to be displayed.
   *
   * @returns {CalendarMonthRange}
   */
  function monthRange() {
    return new CalendarMonthRange(startMonth(), endMonth());
  }


  /**
   * Refresh the availability displayed.
   */
  function refreshAvailability() {

    // Create new calendar month range for months to load availability for
    // This is one month either side of the months to be displayed to avoid unknowns
    var firstMonthToLoadAvailability = monthRange().getStartCalendarMonth().previous();
    var lastMonthToLoadAvailability = monthRange().getEndCalendarMonth().next();
    var months = new CalendarMonthRange(firstMonthToLoadAvailability, lastMonthToLoadAvailability);

    property().colouredAvailability(months, function(availability) {
      var availableToAvailable = availability.availableToAvailable;
      var availableToUnavailable = availability.availableToUnavailable;
      var availableToUnknown = availability.availableToUnknown;
      var unavailableToAvailable = availability.unavailableToAvailable;
      var unavailableToUnavailable = availability.unavailableToUnavailable;
      var unavailableToUnknown = availability.unavailableToUnknown;
      var unknownToAvailable = availability.unknownToAvailable;
      var unknownToUnavailable = availability.unknownToUnavailable;
      var unknownToUnknown = availability.unknownToUnknown;

      $(".travelduck.availability .day").each(function() {
        $(this).removeClass("available-to-available available-to-unavailable available-to-unknown");
      });

      var i;
      var currentDay;
      var classIdentifier;

      /*
       * Available to available
       */
      for(i = 0; i < availableToAvailable.length; i++) {
        currentDay = availableToAvailable[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("available-to-available");
      }

      /*
       * Available to unavailable
       */
      for(i = 0; i < availableToUnavailable.length; i++) {
        currentDay = availableToUnavailable[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("available-to-unavailable");
      }

      /*
       * Available to unknown
       */
      for(i = 0; i < availableToUnknown.length; i++) {
        currentDay = availableToUnknown[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("available-to-unknown");
      }

      /*
       * Unavailable to available
       */
      for(i = 0; i < unavailableToAvailable.length; i++) {
        currentDay = unavailableToAvailable[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("unavailable-to-available");
      }

      /*
       * Unavailable to unavailable
       */
      for(i = 0; i < unavailableToUnavailable.length; i++) {
        currentDay = unavailableToUnavailable[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("unavailable-to-unavailable");
      }

      /*
       * Unavailable to unknown
       */
      for(i = 0; i < unavailableToUnknown.length; i++) {
        currentDay = unavailableToUnknown[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("unavailable-to-unknown");
      }

      /*
       * Unknown to available
       */
      for(i = 0; i < unknownToAvailable.length; i++) {
        currentDay = unknownToAvailable[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("unknown-to-available");
      }

      /*
       * Unknown to unavailable
       */
      for(i = 0; i < unknownToUnavailable.length; i++) {
        currentDay = unknownToUnavailable[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("unknown-to-unavailable");
      }

      /*
       * Unknown to unknown
       */
      for(i = 0; i < unknownToUnknown.length; i++) {
        currentDay = unknownToUnknown[i];
        classIdentifier = currentDay.toYearMonthDayString("-");
        $("." + classIdentifier).addClass("unknown-to-unknown");
      }

      // Fade main container in if hidden
      $(mainContainer).animate({opacity: 1});

    }, function() {});
  }


  /**
   * Draw the calendars.
   */
  function draw() {
    $(mainContainer).empty();

    var months = monthRange().getArrayOfAllCalendarMonths();
    for(var i = 0; i < months.length; i++) {
      addMonth(months[i]);
    }
  }


  /**
   * Add a month to the output.
   *
   * @param calendarMonth
   */
  function addMonth(calendarMonth) {

    var changeOverDay = weekChangeOverDay();
    var days = calendarMonth.days();
    var firstDay = days[0];

    var table = document.createElement("table");
    table.style.marginBottom = "15px";


    /*
     * Month name
     */
    $(table).append(
      '<tr><td colspan="7" class="month-name">' + calendarMonth.name() + ' ' + calendarMonth.getYear() + '</td></tr>'
    );


    /*
     * Days of the week names
     */
    var html = '<tr>';
    for(var i = 0; i < 7; i++) {
      html += '<td class="day-of-week-name">' + changeOverDay.twoLetterName() + '</td>';
      changeOverDay = changeOverDay.next();
    }
    html += '</tr>';
    $(table).append(html);


    /*
     * Days of the month numbers
     */
    var skip = ((firstDay.dayOfWeek().getNumber() + 7) - changeOverDay.getNumber()) % 7;
    var rows = 6;
    html = '<tr>';
    for(i = 0; i < rows * 7; i++) {
      if(i % 7 == 0 && i != 0) {
        html += '</tr><tr>';
      }
      if(i - skip >= 0 && i - skip < days.length) {
        var currentDay = days[i - skip];
        var classIdentifier = currentDay.toYearMonthDayString("-");
        html += '<td class="day ' + classIdentifier + '">' + currentDay.getDay() + '</td>';
      } else {
        html += '<td class="day"></td>';
      }
    }
    html += '</tr>';
    $(table).append(html);


    mainContainer.appendChild(table);
  }


}(jQuery));