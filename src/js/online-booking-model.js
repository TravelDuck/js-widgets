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


      property().readFromApi(function(property) {

        initialiseModal();

        hideBookingPrice(0);
        hideLoadingBookingPrice(0);
        hideContactOwnerBookingPrice(0);

        disableDateSection();
        loadColouredAvailability();

        setInterval(function() {
          loadColouredAvailability();
        }, 30000);

      }, function() {
        console.error("");
      });

      return this;
    }
  };


  /**
   * jQuery function.
   *
   * @param methodOrOptions
   * @returns {*}
   */
  $.fn.travelduckOnlineBookingModal = function(methodOrOptions) {

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
   * @returns {TravelDuck_Property}
   */
  function property() {
    if(!this.propertyModel) {
      setProperty(new TravelDuck_Property($(displayElement).data("property-id")));
    }
    return this.propertyModel;
  }


  function setProperty(property) {
    this.propertyModel = property;
  }


  function initialiseModal() {
    var p = property();
    var bookingMode = p.getBookingMode();

    $(mainContainer).append(
      "<div style=\"display:none\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">" +
        "<div class=\"modal-dialog\">" +
        "<div class=\"modal-content\">" +
        "<div class=\"modal-header\">" +
        "<h3 class=\"modal-title\">Book with TravelDuck</h3>" +
        "</div>" +
        "<div class=\"modal-body\">" +
        "<div class=\"datepicker-inputs\">" +
        "<div class=\"inputs-wrapper\">" +
        "<div class=\"col50\"><input readonly class=\"start-date\" placeholder=\"Start date\" /></div>" +
        "<div class=\"col50\"><input readonly class=\"end-date\" placeholder=\"End date\" /></div>" +
        "</div>" +
        "<div class=\"btn btn-secondary reset-btn\">Reset</div>" +
        "</div>" +

        "<div class=\"booking-display-wrapper\">" +
        "<div class=\"booking-display\">" +
        "<div class=\"loading-price\">" +
        "<div class=\"text\">Doing the maths...</div>" +
        "<img src=\"https://travelduck.co/common/img/loading.gif\" />" +
        "</div>" +
        "<div class=\"price-display\">" +
        "<div class=\"text\">Book now from:</div>" +
        "<div class=\"price\"></div>" +
        "<div class=\"btn btn-secondary\">Book now</div>" +
        "</div>" +
        "<div class=\"contact-owner\">" +
        "<div class=\"title\" style='text-align: center'>Contact us for a quote</div>" +
        "<div class=\"text\">" +
        "" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +

        "<table>" +
        "<tr>" +
        "<td style=\"width:80px\">" +
        "<a href='https://travelduck.co'>" +
        "<img class=\"img-round\" style=\"width:100%\" src=\"https://travelduck.co/travelduck/img/logo-square/80x80-fit-circle.png\" />" +
        "</a>" +
        "</td>" +
        "<td>" +
        "<ul class=\"fa-ul\">" +
        "<li class=\"fa fa-check\"><span>Book directly with owner</span></li>" +
        "<li class=\"fa fa-check\"><span>Secured by <a target=\"_blank\" href=\"https://travelduck.co\">TravelDuck</a></span></li>" +
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


    var buttonText = bookingMode == "live" ? "Book now" : "Request to book";
    $(mainContainer).append("<button class=\"btn btn-secondary book-online-btn\">" + buttonText + "</button>");
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
    var bookingPriceDisplayBookButton = $(mainContainer).find(".price-display .btn");

    $(resetInputBtn).click(function() {
      resetDatePickers();
    });



    $(bookingPriceDisplayBookButton).click(function() {
      var calendarDayRange = new CalendarDayRange(startCalendarDay, endCalendarDay);
      var request = new TravelDuck_Property_Booking_Request(property(), calendarDayRange);
      request.submit(function(response) {
        window.location.href = response["url"];
      });
    });
  }



  /**
   * Setup the date pickers.
   */
  function setupDatePickers() {
    var changeOverDay = parseInt(property().getChangeOverDay().getNumber());
    var format = "dd-mm-yyyy";

    var checkin = $(startDateInput).travelduckDatePicker({
      todayBtn: true,
      onRender: function(date) {
        var classes = [];

        classes = addColourClasses(CalendarDay.fromDate(date), colouring, classes, true);
        return classes.join(" ");
      },
      format: format,
      weekStart: changeOverDay
    }).on('changeDate', function(e) {
      setStartCalendarDay(e.date);

      checkout.travelduckDatePicker("setValue", e.date);

      checkin.travelduckDatePicker("update");
      checkout.travelduckDatePicker("update");

      checkin.travelduckDatePicker("hide");
      checkout.focus();

      loadPrice();
    });


    var checkout = $(endDateInput).travelduckDatePicker({
      onRender: function(date) {
        var classes = [];

        classes = addColourClasses(CalendarDay.fromDate(date), colouring, classes, false);
        return classes.join(" ");
      },
      format: format,
      weekStart: changeOverDay
    }).on('changeDate', function(e) {
      setEndCalendarDay(e.date);

      checkin.travelduckDatePicker("update");
      checkout.travelduckDatePicker("update");

      checkout.travelduckDatePicker("hide");

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
            showBookingPrice(amount);
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

    $(startDateInput).val("").travelduckDatePicker("update");
    $(endDateInput).val("").travelduckDatePicker("update");

    loadPrice();
  }


  /**
   * Add colouring classes.
   *
   * @param calendarDay
   * @param colouring
   * @param classes
   * @param selectStartDate
   * @returns {*}
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
   * @param {Amount} price
   */
  function showBookingPrice(price) {
    var animationTime = arguments[1] == null ? 300 : arguments[1];
    $(bookingPriceDisplayWrapper).slideDown(animationTime);
    $(bookingPriceDisplay).html(price.symbol() + price.getValue());
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