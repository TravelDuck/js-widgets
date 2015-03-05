function fatalError(message) {
  console.log("Build Bookings - Aborted: " + message);
}
function loadjQuery(successCallback) {
  if(typeof jQuery === "undefined") {
    var jqueryLoader = document.createElement('script');
    jqueryLoader.setAttribute("src", "https://code.jquery.com/jquery-1.11.1.min.js");
    jqueryLoader.onload = successCallback;
    jqueryLoader.onreadystatechange = function() {
      if(this.readyState == 'complete' || this.readyState == 'loaded') { successCallback(); }
    };
    jqueryLoader.onerror = function() {
      fatalError("Failed to load jQuery");
    };
    document.getElementsByTagName("head")[0].appendChild(jqueryLoader);
  } else {
    successCallback();
  }
}
function loadBootstrap(successCallback) {
  if(typeof $().modal != 'function') {
    var jqueryLoader = document.createElement('script');
    jqueryLoader.setAttribute("src", "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js");
    jqueryLoader.onload = successCallback;
    jqueryLoader.onreadystatechange = function() {
      if(this.readyState == 'complete' || this.readyState == 'loaded') { successCallback(); }
    };
    jqueryLoader.onerror = function() {
      fatalError("Failed to load Bootstrap");
    };
    document.getElementsByTagName("head")[0].appendChild(jqueryLoader);
  } else {
    successCallback();
  }
}
function loadFontAwesome() {
  var head  = document.getElementsByTagName('head')[0];
  var link  = document.createElement('link');
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css';
  link.media = 'all';
  head.appendChild(link);
}
function loadBuildBookingsModels(successCallback) {
  var loader = document.createElement('script');
  loader.setAttribute("src", "https://get-away.com/libraries/models/.js");
  loader.onload = successCallback;
  loader.onreadystatechange = function() {
    if(this.readyState == 'complete' || this.readyState == 'loaded') { successCallback(); }
  };
  loader.onerror = function() {
    fatalError("Failed to Build Bookings models.");
  };
  document.getElementsByTagName("head")[0].appendChild(loader);
}
function loadWidgetsCss() {
  var head  = document.getElementsByTagName('head')[0];
  var link  = document.createElement('link');
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://buildbookings.com/libraries/widgets.css';
  link.media = 'all';
  head.appendChild(link);
}
if(typeof buildBookingsWigetsJsLoaded == "undefined") {
  buildBookingsWigetsJsLoaded = true;
  loadjQuery(function() {
    loadBootstrap(function() {
      loadWidgetsCss();
      loadFontAwesome();
      loadBuildBookingsModels(function() {
        boot();
      });
    });
  });
}

function boot() {
  bootAvailabilityWidget();
  bootOnlineBookingWidget();
  bootDatePicker();
  $(".bb-availability").each(function() {
    $(this).bbAvailabilityWidget();
  });
  $(".bb-onlineBooking").each(function() {
    $(this).bbOnlineBookingWidget();
  });
}
function bootAvailabilityWidget() {
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
    $.fn.bbAvailabilityWidget = function(methodOrOptions) {

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

        $(".bb-availability .day").each(function() {
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
      return new BuildBookings_Property($(displayElement).data("property-id"));
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
}
function bootOnlineBookingWidget() {
  (function($) {

    var displayElement;
    var mainContainer;


    var startDateInput;
    var endDateInput;
    var resetInputBtn;

    var bookingPriceDisplayWrapper;
    var bookingPriceDisplay;
    var bookingPriceLoadingWrapper;
    var bookingPriceContactOwnerWrapper;

    var currentMonth = CalendarMonth.currentMonth();
    var calendarMonthRange = new CalendarMonthRange(currentMonth.minusMonths(1), currentMonth.plusMonths(40));


    var availability = {
      available: [],
      unavailable: []
    };

    var colouring = {
      availableToAvailable: [],
      availableToUnavailable: [],
      availableToUnknown: [],
      unavailableToAvailable: [],
      unavailableToUnavailable: [],
      unavailableToUnknown: [],
      unknownToAvailable: [],
      unknownToUnavailable: [],
      unknownToUnknown: []
    };


    var startCalendarDay = null;
    var endCalendarDay = null;
    var afterStartCalendarDayLimit = null;
    var beforeEndCalendarDayLimit = null;



    var settings;


    var methods = {
      init : function(options) {
        settings = $.extend({

        }, options);

        displayElement = this;
        mainContainer = document.createElement("div");
        displayElement.append(mainContainer);


        initialiseModal();

        hideBookingPrice(0);
        hideLoadingBookingPrice(0);
        hideContactOwnerBookingPrice(0);

        disableDateSection();
        loadColouredAvailability();

        setInterval(function() {
          loadColouredAvailability();
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
    $.fn.bbOnlineBookingWidget = function(methodOrOptions) {

      if(methods[methodOrOptions]) {
        return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if(typeof methodOrOptions === "object" || !methodOrOptions) {
        return methods.init.apply( this, arguments );
      } else {
        $.error("Method " +  methodOrOptions + " does not exist on jQuery.availabilityWidget");
      }
    };


    /*
     * ###################################################################################################################
     *
     * Controls
     *
     * ###################################################################################################################
     */


    /**
     * Get the property this online booking widget is for.
     *
     * @returns {BuildBookings_Property}
     */
    function property() {
      return new BuildBookings_Property($(displayElement).data("property-id"));
    }



    function initialiseModal() {
      $(mainContainer).append(
      "<div style=\"display:none\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">" +
        "<div class=\"modal-dialog\">" +
          "<div class=\"modal-content\">" +
            "<div class=\"modal-header\">" +
              "<h3 class=\"modal-title\">Book online</h3>" +
            "</div>" +
            "<div class=\"modal-body\">" +
              "<div class=\"datepicker-inputs\">" +
                "<div class=\"inputs-wrapper\">" +
                  "<div class=\"col50\"><input readonly class=\"start-date\" placeholder=\"Start date\" /></div>" +
                  "<div class=\"col50\"><input readonly class=\"end-date\" placeholder=\"End date\" /></div>" +
                "</div>" +
                "<div class=\"reset-btn\">Reset</div>" +
              "</div>" +

              "<div class=\"booking-display-wrapper\">" +
                "<div class=\"booking-display\">" +
                  "<div class=\"loading-price\">" +
                    "<div class=\"text\">Doing the maths...</div>" +
                    "<img src=\"https://buildbookings.com/common/img/loading.gif\" />" +
                  "</div>" +
                  "<div class=\"price-display\">" +
                    "<div class=\"text\">Book now from:</div>" +
                    "<div class=\"price\"></div>" +
                    "<div class=\"button\">Book now</div>" +
                  "</div>" +
                  "<div class=\"contact-owner\">" +
                    "<div class=\"title\">Contact us for a quote</div>" +
                    "<div class=\"text\">" +
                      "" +
                    "</div>" +
                  "</div>" +
                "</div>" +
              "</div>" +

              "<table>" +
              "<tr>" +
                "<td style=\"width:80px\">" +
                  "<img class=\"img-round\" style=\"width:100%\" src=\"https://buildbookings.com/build-bookings/img/logo-square.png\" />" +
                "</td>" +
                "<td>" +
                  "<ul class=\"fa-ul\">" +
                    "<li class=\"fa fa-check\"><span>Book directly with owner</span></li>" +
                    "<li class=\"fa fa-check\"><span>Secured by <a target=\"_blank\" href=\"https://buildbookings.com\">Build Bookings</a></span></li>" +
                    "<li class=\"fa fa-check\"><span>Credit / debit card payment</span></li>" +
                    "<li class=\"fa fa-check\"><span>No booking fee</span></li>" +
                  "</ul>" +
                "</td>" +
              "</tr>" +
              "</table>" +


            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
      );

      var modal = $(mainContainer).find(".modal");
      $(modal).modal({show:false});


      $(mainContainer).append("<button class=\"book-online-btn\">Book online</button>");
      var bookOnlineButton = $(mainContainer).find(".book-online-btn");
      $(bookOnlineButton).click(function() {
        $(modal).modal('show')
      });


      startDateInput = $(mainContainer).find(".start-date");
      endDateInput = $(mainContainer).find(".end-date");
      resetInputBtn = $(mainContainer).find(".reset-btn");


      bookingPriceDisplayWrapper = $(mainContainer).find(".price-display");
      bookingPriceDisplay = $(mainContainer).find(".price-display .price");
      bookingPriceLoadingWrapper = $(mainContainer).find(".loading-price");
      bookingPriceContactOwnerWrapper = $(mainContainer).find(".contact-owner");
      var bookingPriceDisplayBookButton = $(mainContainer).find(".price-display .button");

      $(resetInputBtn).click(function() {
        resetDatePickers();
      });



      $(bookingPriceDisplayBookButton).click(function() {
        var calendarDayRange = new CalendarDayRange(startCalendarDay, endCalendarDay);
        var request = new BuildBookings_Property_Booking_Request(property(), calendarDayRange);
        request.submit(function(response) {

          var bookingIdentifier = btoa(response["id"] + "-" + response["access-token"]);
          window.location.href = "https://buildbookings.com/booking/" + bookingIdentifier;

        });
      });
    }



    /**
     * Setup the date pickers.
     */
    function setupDatePickers() {
      var checkin = $(startDateInput).bbDatepicker({
        todayBtn: true,
        onRender: function(date) {
          var classes = [];

          classes = addColourClasses(CalendarDay.fromDate(date), colouring, classes, true);
          return classes.join(" ");
        },
        format: "dd-mm-yyyy",
        weekStart: 6
      }).on('changeDate', function(e) {
          setStartCalendarDay(e.date);

          checkout.bbDatepicker("setValue", e.date);

          checkin.bbDatepicker("update");
          checkout.bbDatepicker("update");

          checkin.bbDatepicker("hide");
          checkout.focus();

          loadPrice();
        });


      var checkout = $(endDateInput).bbDatepicker({
        onRender: function(date) {
          var classes = [];

          classes = addColourClasses(CalendarDay.fromDate(date), colouring, classes, false);
          return classes.join(" ");
        },
        format: "dd-mm-yyyy",
        weekStart: 6
      }).on('changeDate', function(e) {
        setEndCalendarDay(e.date);

        checkin.bbDatepicker("update");
        checkout.bbDatepicker("update");

        checkout.bbDatepicker("hide");

        loadPrice();
      });

    }



    /**
     * Load the price of the current property for the current booking specification.
     */
    function loadPrice() {

      if(startCalendarDay && endCalendarDay) {
        showLoadingBookingPrice();
        hideBookingPrice();
        hideContactOwnerBookingPrice();

        var calendarDayRange = new CalendarDayRange(startCalendarDay, endCalendarDay);
        var numberOfAdults = 1;
        var numberOfChildren = 0;
        var numberOfInfants = 0;
        var numberOfPets = 0;


        property().bookingQuote(
          calendarDayRange, numberOfAdults, numberOfChildren, numberOfInfants, numberOfPets, function(amount) {
            hideLoadingBookingPrice();
            if(amount != null) {
              showBookingPrice(amount.symbol() + amount.getValue());
            } else {
              showContactOwnerBookingPrice();
            }
          }, function() {
            hideLoadingBookingPrice();
            showContactOwnerBookingPrice();
          }
        );

      } else {
        hideBookingPrice();
        hideContactOwnerBookingPrice();
      }
    }


    /**
     * Load the coloured availability of the current property.
     */
    function loadColouredAvailability() {

      property().colouredAvailability(calendarMonthRange, function(loadedColouring, loadedAvailability) {
        colouring = loadedColouring;
        availability = loadedAvailability;
        enableDateSection();
        setupDatePickers();
      }, function() {
        disableDateSection();
      });
    }


    /**
     * Disable date selection.
     */
    function disableDateSection() {
      $(startDateInput).prop('disabled', true);
      $(endDateInput).prop('disabled', true);
    }


    /**
     * Enable date selection.
     */
    function enableDateSection() {
      $(startDateInput).prop('disabled', false);
      $(endDateInput).prop('disabled', false);
    }


    /**
     * Reset the date picker values.
     */
    function resetDatePickers() {
      startCalendarDay = null;
      endCalendarDay = null;
      afterStartCalendarDayLimit = null;
      beforeEndCalendarDayLimit = null;

      $(startDateInput).val("").bbDatepicker("update");
      $(endDateInput).val("").bbDatepicker("update");

      loadPrice();
    }


    /**
     * Add colouring classes.
     *
     * @param calendarDay
     * @param colouring
     * @param classes
     * @param selectStartDate
     *  @returns {*}
     */
    function addColourClasses(calendarDay, colouring, classes, selectStartDate) {

      if(startCalendarDay && calendarDay.isEqualTo(startCalendarDay)) {
        classes.push("start-date");
      }

      if(endCalendarDay && calendarDay.isEqualTo(endCalendarDay)) {
        classes.push("end-date");
      }

      if(
        startCalendarDay && endCalendarDay &&
        calendarDay.isGreaterThan(startCalendarDay) &&
        calendarDay.isLessThan(endCalendarDay)
      ) {
        classes.push("selected-date");
      }


      if(
        (
          (afterStartCalendarDayLimit && calendarDay.isGreaterThan(afterStartCalendarDayLimit)) ||
          (beforeEndCalendarDayLimit && calendarDay.isLessThan(beforeEndCalendarDayLimit))
        )
        ||
        (
          (!selectStartDate && startCalendarDay && calendarDay.isLessThanOrEqualTo(startCalendarDay)) ||
          (selectStartDate && endCalendarDay && calendarDay.isGreaterThanOrEqualTo(endCalendarDay))
        )
      ) {
        classes.push("disabled");
      }


      if(colouring.availableToAvailable.contains(calendarDay)) {
        classes.push("available-to-available");
      }
      if(colouring.availableToUnavailable.contains(calendarDay)) {
        classes.push("available-to-unavailable");
        if(selectStartDate) {
          classes.push("disabled");
        }
      }
      if(colouring.availableToUnknown.contains(calendarDay)) {
        classes.push("available-to-unknown");
        if(selectStartDate) {
          classes.push("disabled");
        }
      }
      if(colouring.unavailableToAvailable.contains(calendarDay)) {
        classes.push("unavailable-to-available");
        if(!selectStartDate) {
          classes.push("disabled");
        }
      }
      if(colouring.unavailableToUnavailable.contains(calendarDay)) {
        classes.push("unavailable-to-unavailable");
        classes.push("disabled");
      }
      if(colouring.unavailableToUnknown.contains(calendarDay)) {
        classes.push("unavailable-to-unknown");
      }
      if(colouring.unknownToAvailable.contains(calendarDay)) {
        classes.push("unknown-to-available");
        if(!selectStartDate) {
          classes.push("disabled");
        }
      }
      if(colouring.unknownToUnavailable.contains(calendarDay)) {
        classes.push("unknown-to-unavailable")
      }
      if(colouring.unknownToUnknown.contains(calendarDay)) {
        classes.push("unknown-to-unknown")
      }

      return classes;
    }


    /**
     * Set the start date of the booking.
     */
    function setStartCalendarDay(startDate) {
      startCalendarDay = CalendarDay.fromDate(startDate);
      afterStartCalendarDayLimit = calculateAfterStartDateLimit(startCalendarDay, availability.available);
      beforeEndCalendarDayLimit = calculateBeforeEndDateLimit(startCalendarDay, availability.available);
    }


    /**
     * Set the end date of the booking.
     */
    function setEndCalendarDay(endDate) {
      endCalendarDay = CalendarDay.fromDate(endDate);
      afterStartCalendarDayLimit = calculateAfterStartDateLimit(endCalendarDay, availability.available);
      beforeEndCalendarDayLimit = calculateBeforeEndDateLimit(endCalendarDay, availability.available);
    }


    /**
     * Calculate the date limit after the start date.
     */
    function calculateAfterStartDateLimit(currentCalendarDay, available) {
      do {
        currentCalendarDay = currentCalendarDay.plusDays(1);
      } while(available.contains(currentCalendarDay));

      return currentCalendarDay;
    }


    /**
     * Calculate the date limit before the end date.
     */
    function calculateBeforeEndDateLimit(currentCalendarDay, available) {
      do {
        currentCalendarDay = currentCalendarDay.minusDays(1);
      } while(available.contains(currentCalendarDay));

      return currentCalendarDay;
    }


    /**
     * Show the given booking price.
     *
     * @param price
     */
    function showBookingPrice(price) {
      var animationTime = arguments[1] == null ? 300 : arguments[1];
      $(bookingPriceDisplayWrapper).slideDown(animationTime);
      $(bookingPriceDisplay).html(price);
    }


    /**
     * Hide the booking price.
     */
    function hideBookingPrice() {
      var animationTime = arguments[0] == null ? 300 : arguments[0];
      $(bookingPriceDisplayWrapper).slideUp(animationTime);
    }


    /**
     * Show the loading price display.
     */
    function showLoadingBookingPrice() {
      var animationTime = arguments[1] == null ? 300 : arguments[1];
      $(bookingPriceLoadingWrapper).slideDown(animationTime);
    }


    /**
     * Hide the loading price display.
     */
    function hideLoadingBookingPrice() {
      var animationTime = arguments[0] == null ? 300 : arguments[0];
      $(bookingPriceLoadingWrapper).slideUp(animationTime);
    }


    /**
     * Show the "contact owner" display.
     */
    function showContactOwnerBookingPrice() {
      var animationTime = arguments[1] == null ? 300 : arguments[1];
      $(bookingPriceContactOwnerWrapper).slideDown(animationTime);
    }


    /**
     * Hide the "contact owner" display.
     */
    function hideContactOwnerBookingPrice() {
      var animationTime = arguments[0] == null ? 300 : arguments[0];
      $(bookingPriceContactOwnerWrapper).slideUp(animationTime);
    }


  }(jQuery));
}
function bootDatePicker() {
// Picker object

  var Datepicker = function(element, options){
    this.element = $(element);
    this.format = DPGlobal.parseFormat(options.format||this.element.data('date-format')||'mm/dd/yyyy');
    this.picker = $(DPGlobal.template)
      .appendTo('body')
      //.appendTo(element.parentNode)
      .on({
        click: $.proxy(this.click, this)//,
        //mousedown: $.proxy(this.mousedown, this)
      });
    this.isInput = this.element.is('input');
    this.component = this.element.is('.date') ? this.element.find('.add-on') : false;

    if (this.isInput) {
      this.element.on({
        focus: $.proxy(this.show, this),
        //blur: $.proxy(this.hide, this),
        keyup: $.proxy(this.update, this)
      });
    } else {
      if (this.component){
        this.component.on('click', $.proxy(this.show, this));
      } else {
        this.element.on('click', $.proxy(this.show, this));
      }
    }

    this.minViewMode = options.minViewMode||this.element.data('date-minviewmode')||0;
    if (typeof this.minViewMode === 'string') {
      switch (this.minViewMode) {
        case 'months':
          this.minViewMode = 1;
          break;
        case 'years':
          this.minViewMode = 2;
          break;
        default:
          this.minViewMode = 0;
          break;
      }
    }
    this.viewMode = options.viewMode||this.element.data('date-viewmode')||0;
    if (typeof this.viewMode === 'string') {
      switch (this.viewMode) {
        case 'months':
          this.viewMode = 1;
          break;
        case 'years':
          this.viewMode = 2;
          break;
        default:
          this.viewMode = 0;
          break;
      }
    }
    this.startViewMode = this.viewMode;
    this.weekStart = options.weekStart||this.element.data('date-weekstart')||0;
    this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
    this.onRender = options.onRender;
    this.fillDow();
    this.fillMonths();
    this.update();
    this.showMode();
  };

  Datepicker.prototype = {
    constructor: Datepicker,

    show: function(e) {
      this.picker.show();
      this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
      this.place();
      $(window).on('resize', $.proxy(this.place, this));
      if (e ) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (!this.isInput) {
      }
      var that = this;
      $(document).on('mousedown', function(ev){
        if ($(ev.target).closest('.datepicker').length == 0) {
          that.hide();
        }
      });
      this.element.trigger({
        type: 'show',
        date: this.date
      });
    },

    hide: function(){
      this.picker.hide();
      $(window).off('resize', this.place);
      this.viewMode = this.startViewMode;
      this.showMode();
      if (!this.isInput) {
        $(document).off('mousedown', this.hide);
      }
      //this.set();
      this.element.trigger({
        type: 'hide',
        date: this.date
      });
    },

    set: function() {
      var formated = DPGlobal.formatDate(this.date, this.format);
      if (!this.isInput) {
        if (this.component){
          this.element.find('input').prop('value', formated);
        }
        this.element.data('date', formated);
      } else {
        this.element.prop('value', formated);
      }
    },

    setValue: function(newDate) {
      if (typeof newDate === 'string') {
        this.date = DPGlobal.parseDate(newDate, this.format);
      } else {
        this.date = new Date(newDate);
      }
      this.set();
      this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
      this.fill();
    },

    place: function(){
      var offset = this.component ? this.component.offset() : this.element.offset();
      this.picker.css({
        top: offset.top + this.height,
        left: offset.left
      });
    },

    update: function(newDate){
      this.date = DPGlobal.parseDate(
        typeof newDate === 'string' ? newDate : (this.isInput ? this.element.prop('value') : this.element.data('date')),
        this.format
      );
      this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
      this.fill();
    },

    fillDow: function(){
      var dowCnt = this.weekStart;
      var html = '<tr>';
      while (dowCnt < this.weekStart + 7) {
        html += '<th class="dow">'+DPGlobal.dates.daysMin[(dowCnt++)%7]+'</th>';
      }
      html += '</tr>';
      this.picker.find('.datepicker-days thead').append(html);
    },

    fillMonths: function(){
      var html = '';
      var i = 0
      while (i < 12) {
        html += '<span class="month">'+DPGlobal.dates.monthsShort[i++]+'</span>';
      }
      this.picker.find('.datepicker-months td').append(html);
    },

    fill: function() {
      var d = new Date(this.viewDate),
        year = d.getFullYear(),
        month = d.getMonth(),
        currentDate = this.date.valueOf();
      this.picker.find('.datepicker-days th:eq(1)')
        .text(DPGlobal.dates.months[month]+' '+year);
      var prevMonth = new Date(year, month-1, 28,0,0,0,0),
        day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
      prevMonth.setDate(day);
      prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7)%7);
      var nextMonth = new Date(prevMonth);
      nextMonth.setDate(nextMonth.getDate() + 42);
      nextMonth = nextMonth.valueOf();
      var html = [];
      var clsName,
        prevY,
        prevM;
      while(prevMonth.valueOf() < nextMonth) {
        if (prevMonth.getDay() === this.weekStart) {
          html.push('<tr>');
        }
        clsName = this.onRender(prevMonth);
        prevY = prevMonth.getFullYear();
        prevM = prevMonth.getMonth();
        if ((prevM < month &&  prevY === year) ||  prevY < year) {
          clsName += ' old';
        } else if ((prevM > month && prevY === year) || prevY > year) {
          clsName += ' new';
        }
        if (prevMonth.valueOf() === currentDate) {
          clsName += ' active';
        }
        html.push('<td class="day '+clsName+'">'+prevMonth.getDate() + '</td>');
        if (prevMonth.getDay() === this.weekEnd) {
          html.push('</tr>');
        }
        prevMonth.setDate(prevMonth.getDate()+1);
      }
      this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
      var currentYear = this.date.getFullYear();

      var months = this.picker.find('.datepicker-months')
        .find('th:eq(1)')
        .text(year)
        .end()
        .find('span').removeClass('active');
      if (currentYear === year) {
        months.eq(this.date.getMonth()).addClass('active');
      }

      html = '';
      year = parseInt(year/10, 10) * 10;
      var yearCont = this.picker.find('.datepicker-years')
        .find('th:eq(1)')
        .text(year + '-' + (year + 9))
        .end()
        .find('td');
      year -= 1;
      for (var i = -1; i < 11; i++) {
        html += '<span class="year'+(i === -1 || i === 10 ? ' old' : '')+(currentYear === year ? ' active' : '')+'">'+year+'</span>';
        year += 1;
      }
      yearCont.html(html);
    },

    click: function(e) {
      e.stopPropagation();
      e.preventDefault();
      var target = $(e.target).closest('span, td, th');
      if (target.length === 1) {
        switch(target[0].nodeName.toLowerCase()) {
          case 'th':
            switch(target[0].className) {
              case 'switch':
                this.showMode(1);
                break;
              case 'prev':
              case 'next':
                this.viewDate['set'+DPGlobal.modes[this.viewMode].navFnc].call(
                  this.viewDate,
                  this.viewDate['get'+DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) +
                    DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1)
                );
                this.fill();
                this.set();
                break;
            }
            break;
          case 'span':
            if (target.is('.month')) {
              var month = target.parent().find('span').index(target);
              this.viewDate.setMonth(month);
            } else {
              var year = parseInt(target.text(), 10)||0;
              this.viewDate.setFullYear(year);
            }
            if (this.viewMode !== 0) {
              this.date = new Date(this.viewDate);
              this.element.trigger({
                type: 'changeDate',
                date: this.date,
                viewMode: DPGlobal.modes[this.viewMode].clsName
              });
            }
            this.showMode(-1);
            this.fill();
            this.set();
            break;
          case 'td':
            if (target.is('.day') && !target.is('.disabled')){
              var day = parseInt(target.text(), 10)||1;
              var month = this.viewDate.getMonth();
              if (target.is('.old')) {
                month -= 1;
              } else if (target.is('.new')) {
                month += 1;
              }
              var year = this.viewDate.getFullYear();
              this.date = new Date(year, month, day,0,0,0,0);
              this.viewDate = new Date(year, month, Math.min(28, day),0,0,0,0);
              this.fill();
              this.set();
              this.element.trigger({
                type: 'changeDate',
                date: this.date,
                viewMode: DPGlobal.modes[this.viewMode].clsName
              });
            }
            break;
        }
      }
    },

    mousedown: function(e){
      e.stopPropagation();
      e.preventDefault();
    },

    showMode: function(dir) {
      if (dir) {
        this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
      }
      this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
    }
  };

  $.fn.bbDatepicker = function ( option, val ) {
    return this.each(function () {
      var $this = $(this),
        data = $this.data('datepicker'),
        options = typeof option === 'object' && option;
      if (!data) {
        $this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.bbDatepicker.defaults,options))));
      }
      if (typeof option === 'string') data[option](val);
    });
  };

  $.fn.bbDatepicker.defaults = {
    onRender: function(date) {
      return '';
    }
  };
  $.fn.bbDatepicker.Constructor = Datepicker;

  var DPGlobal = {
    modes: [
      {
        clsName: 'days',
        navFnc: 'Month',
        navStep: 1
      },
      {
        clsName: 'months',
        navFnc: 'FullYear',
        navStep: 1
      },
      {
        clsName: 'years',
        navFnc: 'FullYear',
        navStep: 10
      }],
    dates:{
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    },
    isLeapYear: function (year) {
      return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
    },
    getDaysInMonth: function (year, month) {
      return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
    },
    parseFormat: function(format){
      var separator = format.match(/[.\/\-\s].*?/),
        parts = format.split(/\W+/);
      if (!separator || !parts || parts.length === 0){
        throw new Error("Invalid date format.");
      }
      return {separator: separator, parts: parts};
    },
    parseDate: function(date, format) {
      var parts = date.split(format.separator),
        date = new Date(),
        val;
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      if (parts.length === format.parts.length) {
        var year = date.getFullYear(), day = date.getDate(), month = date.getMonth();
        for (var i=0, cnt = format.parts.length; i < cnt; i++) {
          val = parseInt(parts[i], 10)||1;
          switch(format.parts[i]) {
            case 'dd':
            case 'd':
              day = val;
              date.setDate(val);
              break;
            case 'mm':
            case 'm':
              month = val - 1;
              date.setMonth(val - 1);
              break;
            case 'yy':
              year = 2000 + val;
              date.setFullYear(2000 + val);
              break;
            case 'yyyy':
              year = val;
              date.setFullYear(val);
              break;
          }
        }
        date = new Date(year, month, day, 0 ,0 ,0);
      }
      return date;
    },
    formatDate: function(date, format){
      var val = {
        d: date.getDate(),
        m: date.getMonth() + 1,
        yy: date.getFullYear().toString().substring(2),
        yyyy: date.getFullYear()
      };
      val.dd = (val.d < 10 ? '0' : '') + val.d;
      val.mm = (val.m < 10 ? '0' : '') + val.m;
      var date = [];
      for (var i=0, cnt = format.parts.length; i < cnt; i++) {
        date.push(val[format.parts[i]]);
      }
      return date.join(format.separator);
    },
    headTemplate: '<thead>'+
      '<tr>'+
      '<th class="prev">&lsaquo;</th>'+
      //'<th colspan="5" class="switch"></th>'+
      '<th colspan="5"></th>'+
      '<th class="next">&rsaquo;</th>'+
      '</tr>'+
      '</thead>',
    contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
  };
  DPGlobal.template = '<div class="bb-datepicker datepicker dropdown-menu">'+
    '<div class="datepicker-days">'+
    '<table class=" table-condensed">'+
    DPGlobal.headTemplate+
    '<tbody></tbody>'+
    '</table>'+
    '</div>'+
    '<div class="datepicker-months">'+
    '<table class="table-condensed">'+
    DPGlobal.headTemplate+
    DPGlobal.contTemplate+
    '</table>'+
    '</div>'+
    '<div class="datepicker-years">'+
    '<table class="table-condensed">'+
    DPGlobal.headTemplate+
    DPGlobal.contTemplate+
    '</table>'+
    '</div>'+
    '</div>';

}