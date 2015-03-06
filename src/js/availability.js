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
        numberOfMonths: 12,
        weekStart: 6
      }, options);

      displayElement = this;

      mainContainer = document.createElement("div");
      displayElement.append(mainContainer);

      mainContainer.style.opacity = 0;

      draw();
      refreshAvailability();

      // Auto refresh availability
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
  $.fn.gaAvailabilityWidget = function(methodOrOptions) {

    if(methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if(typeof methodOrOptions === "object" || !methodOrOptions) {
      return methods.init.apply( this, arguments );
    } else {
      $.error("Method " +  methodOrOptions + " does not exist on jQuery.availabilityWidget");
    }
  };

  function startMonth() {
    return new CalendarMonth(settings.startYear, settings.startMonth);
  }

  function endMonth() {
    return startMonth().plusMonths(settings.numberOfMonths - 1);
  }

  function monthRange() {
    return new CalendarMonthRange(startMonth(), endMonth());
  }

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

      $(".ga-availability .day").each(function() {
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

  function property() {
    return new GetAway_Property($(displayElement).data("property-id"));
  }


  function draw() {
    $(mainContainer).empty();

    var months = monthRange().getArrayOfAllCalendarMonths();
    for(var i = 0; i < months.length; i++) {
      addMonth(months[i]);
    }
  }

  function addMonth(calendarMonth) {

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
    var dayOfWeek = new DayOfWeek(settings.weekStart);
    var html = '<tr>';
    for(var i = 0; i < 7; i++) {
      html += '<td class="day-of-week-name">' + dayOfWeek.twoLetterName() + '</td>';
      dayOfWeek = dayOfWeek.next();
    }
    html += '</tr>';
    $(table).append(html);


    /*
     * Days of the month numbers
     */
    var skip = ((firstDay.dayOfWeek().getNumber() + 7) - settings.weekStart) % 7;
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