(function($) {

  var displayElement;
  var mainContainer;


  var startDateInput;
  var endDateInput;
  var dateInputWrapper;

  var infoDisplay;

  var bookBtn;
  var onlineBookingBlock;

  var bookingPriceDisplayWrapper;
  var bookingPriceDisplay;
  var bookingPeriodDisplay;

  var bookingPriceLoadingWrapper;
  var bookingPriceContactOwnerWrapper;

  var currentMonth = CalendarMonth.currentMonth();
  var calendarMonthRange = new CalendarMonthRange(currentMonth.minusMonths(1), currentMonth.plusMonths(40));


  var availability = {
    available: [],
    unavailable: []
  };


  var startDatepickerColouring = [];
  var endDatepickerColouring = [];


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

        // Create interface
        initialise();

        // Setup interface
        hideBookingPrice(0);
        hideLoadingBookingPrice(0);
        hideContactOwnerBookingPrice(0);
        disableDateSection();


        loadColouredAvailability(function() {
          setupDatePickers();
          enableDateSection();
        }, function() {
          // Failed to load availability
        });


        //
        // Auto refresh the property availability
        //
        setInterval(function() {
          loadColouredAvailability(function() {
            // Refresh successful
          }, function() {
            // Refresh unsuccessful
          });
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
  $.fn.travelduckOnlineBookingBlock = function(methodOrOptions) {

    if(methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if(typeof methodOrOptions === "object" || !methodOrOptions) {
      return methods.init.apply( this, arguments );
    } else {
      $.error("Method " +  methodOrOptions + " does not exist on jQuery.travelduckOnlineBookingBlock");
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
    console.log(this.propertyModel);
    return this.propertyModel;
  }


  function setProperty(property) {
    this.propertyModel = property;
  }


  function initialise() {

    $(mainContainer).append(
      "<div class='online-booking-block'>" +

        "<div class='minimum-price-wrapper'>" +
          "<span class='minimum-price'></span>" +
          "<span class='price-period'></span>" +
        "</div>" +

        "<div class='datepicker-wrapper'>" +
          "<div class='inputs-wrapper'>" +
            "<div class='col50'><div><input readonly class='start-date' placeholder='Start date' /></div></div>" +
            "<div class='col50'><div><input readonly class='end-date' placeholder='End date' /></div></div>" +
          "</div>" +
        "</div>" +

        "<div class='price-wrapper'>" +
          "<div class='booking-display'>" +
            "<div class='info-display'></div>" +
            "<div class='loading-price'>" +
              "<div class='text'>Doing the maths...</div>" +
              "<img src='https://travelduck.co/common/img/loading.gif'/>" +
            "</div>" +
            "<div class='price-display'>" +
              "<div class='text'>Book now from:</div>" +
              "<div class='price'></div>" +
              "<div class='period'></div>" +
            "</div>" +
            "<div class='no-price-display' style='text-align: center'>" +
              "<div class='title'>Request a price</div>" +
              "<div class='text'></div>" +
            "</div>" +
          "</div>" +
        "</div>" +

        "<div class='button-wrapper'>" +
          "<div class='btn btn-secondary'>Book Now</div>" +
        "</div>" +

        "<div class='secured-by-wrapper'>" +
          "<div class='cards'></div>" +
          "<i class='fa fa-lock'></i> Secured by <a target='_blank' href='https://travelduck.co'>TravelDuck</a>" +
        "</div>" +

      "</div>"
    );


    //
    // Identify Elements
    //
    onlineBookingBlock = $(mainContainer).find(".online-booking-block");

    bookBtn = $(mainContainer).find(".button-wrapper .btn");


    dateInputWrapper = $(mainContainer).find(".datepicker-wrapper .inputs-wrapper");
    startDateInput = $(mainContainer).find(".start-date");
    endDateInput = $(mainContainer).find(".end-date");


    // Set up the booking button.
    setBookingButtonAsLoading();
    setBookingButtonFromPropertyBookingMode();


    infoDisplay = $(mainContainer).find(".info-display");

    var p = property();
    var changeOverDay = p.getChangeOverDay();

    setInfo(
      "<div>Change over <b>" + changeOverDay.name() + "</b></div>"
    );


    bookingPriceDisplay = $(mainContainer).find(".price-display .price");
    bookingPeriodDisplay = $(mainContainer).find(".price-display .period");


    bookingPriceDisplayWrapper = $(mainContainer).find(".price-display");

    bookingPriceLoadingWrapper = $(mainContainer).find(".loading-price");
    bookingPriceContactOwnerWrapper = $(mainContainer).find(".no-price-display");


    $(bookBtn).click(function() {
      var calendarDayRange = new CalendarDayRange(startCalendarDay, endCalendarDay);
      submitBookingRequest(calendarDayRange);
    });

  }





  /*
   *
   *   BOOKING BUTTON
   *
   */



  /**
   * Set the booking button from the property booking mode.
   */
  function setBookingButtonFromPropertyBookingMode() {
    var p = property();
    var bookingMode = p.getBookingMode();


    if(bookingMode == "live") {
      setBookingButtonAsBookNow();
    } else {
      setBookingButtonAsRequestToBook();
    }
  }


  /**
   * Show booking button as loading
   */
  function setBookingButtonAsLoading() {
    disableBookingButton();
    bookBtn.html("Loading...");
  }


  /**
   * Show booking button as book now.
   */
  function setBookingButtonAsBookNow() {
    bookBtn.html("Book now");
    enableBookingButton();
  }


  /**
   * Show booking button as request to book.
   */
  function setBookingButtonAsRequestToBook() {
    bookBtn.html("Request to book");
    enableBookingButton();
  }


  /**
   * Enable the booking button so it responds on click.
   */
  function enableBookingButton() {
    // TODO
  }


  /**
   * Disable the booking button so it does not respond on click.
   */
  function disableBookingButton() {
    // TODO
  }






  /*
   *
   *   BOOKING DATE-PICKERS
   *
   */

  function colourDatepickerAsError() {
    dateInputWrapper.addClass("has-error");
  }


  function colorDatepickerAsClear() {
    dateInputWrapper.removeClass("has-error");
  }


  function setDatepickerError(error) {
    colourDatepickerAsError();
  }


  function clearDatepickerError() {
    colorDatepickerAsClear();
  }







  /*
   *
   *   DISPLAY CONTROLS
   *
   */


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
   * Set the booking period display.
   *
   * @param bookingPeriod
   */
  function setBookingPeriodDisplay(bookingPeriod) {
    $(bookingPeriodDisplay).html(bookingPeriod);
  }


  /**
   * Clear the booking period display.
   */
  function clearBookingPeriodDisplay() {
    $(bookingPeriodDisplay).html("");
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


  /**
   * Show the info display.
   */
  function showInfoDisplay() {
    var animationTime = arguments[0] == null ? 300 : arguments[0];
    $(infoDisplay).slideDown(animationTime);
  }


  /**
   * Hide the info display.
   */
  function hideInfoDisplay() {
    var animationTime = arguments[0] == null ? 300 : arguments[0];
    $(infoDisplay).slideUp(animationTime);
  }


  /**
   * Set the info to display.
   *
   * @param info
   */
  function setInfo(info) {
    infoDisplay.html(info);
  }


  /**
   * Clear the displayed info
   */
  function clearInfo() {
    infoDisplay.html("");
  }






  /*
   *
   *   DATEPICKERS
   *
   */


  /**
   * Setup the date pickers.
   */
  function setupDatePickers() {
    var changeOverDay = parseInt(property().getChangeOverDay().getNumber());
    var format = "dd-mm-yyyy";



    $.fn.travelduckDateRangePicker({
      format: format,
      weekStart: changeOverDay,
      startDateInput: startDateInput,
      endDateInput: endDateInput,


      onChangeStartDate: function(startCalendarDay) {
        setStartCalendarDay(startCalendarDay);
      },


      onChangeEndDate: function(endCalendarDay) {
        setEndCalendarDay(endCalendarDay);
      },


      onChangeDateRange: function(dateRange) {
        clearDatepickerError();
        loadPrice(dateRange);
      },


      onClear: function() {
        clearCalendarDays();
        loadPrice(null);
      },




      startDatepickerOnRender: function(calendarDay) {
        var calendarDayAsString = calendarDay.toYearMonthDayString();
        var classes = [];


        // Continuity range limiting (based on previously selected end date)
        // Can't select start date where one or days within the range is unavailable
        if(
            (afterStartCalendarDayLimit && calendarDay.isGreaterThan(afterStartCalendarDayLimit)) ||
            (beforeEndCalendarDayLimit && calendarDay.isLessThan(beforeEndCalendarDayLimit))
          ) {
          classes.push("disabled");
        }


        if(startDatepickerColouring && (calendarDayAsString in startDatepickerColouring)) {
          $.merge(classes, startDatepickerColouring[calendarDayAsString]);
        }

        return classes;
      },



      endDatepickerOnRender: function(calendarDay) {
        var calendarDayAsString = calendarDay.toYearMonthDayString();
        var classes = [];


        // Continuity range limiting (based on previously selected start date)
        // Can't select end date where one or days within the range is unavailable
        if(
          (afterStartCalendarDayLimit && calendarDay.isGreaterThan(afterStartCalendarDayLimit)) ||
            (beforeEndCalendarDayLimit && calendarDay.isLessThan(beforeEndCalendarDayLimit))
          ) {
          classes.push("disabled");
        }


        if(endDatepickerColouring && (calendarDayAsString in endDatepickerColouring)) {
          $.merge(classes, endDatepickerColouring[calendarDayAsString]);
        }

        return classes;
      }

    });

  }








  /**
   * Set the start date of the booking.
   */
  function setStartCalendarDay(calendarDay) {
    startCalendarDay = calendarDay;
    afterStartCalendarDayLimit = calculateAfterStartDateLimit(startCalendarDay, availability.available);
    beforeEndCalendarDayLimit = calculateBeforeEndDateLimit(startCalendarDay, availability.available);
  }


  /**
   * Set the end date of the booking.
   */
  function setEndCalendarDay(calendarDay) {
    endCalendarDay = calendarDay;
    afterStartCalendarDayLimit = calculateAfterStartDateLimit(endCalendarDay, availability.available);
    beforeEndCalendarDayLimit = calculateBeforeEndDateLimit(endCalendarDay, availability.available);
  }


  function clearCalendarDays() {
    startCalendarDay = null;
    endCalendarDay = null;
    afterStartCalendarDayLimit = null;
    beforeEndCalendarDayLimit = null;
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
   * Submit a booking request for the given startDay and endDay.
   *
   * @param {CalendarDayRange} calendarDayRange
   */
  function submitBookingRequest(calendarDayRange) {
    setBookingButtonAsLoading();


    if(!calendarDayRange.getStartCalendarDay() || !calendarDayRange.getEndCalendarDay()) {
      setDatepickerError("Select booking dates");
      setBookingButtonFromPropertyBookingMode();
      return;
    }


    var request = new TravelDuck_Property_Booking_Request(property(), calendarDayRange);
    request.submit(function(response) {

      // Success
      window.location.href = response["url"];

    }, function() {

      // Failure
      setBookingButtonFromPropertyBookingMode();

    });
  }


  /**
   * Load the price of the current property for the current booking specification.
   *
   * @param {CalendarDayRange} calendarDayRange
   */
  function loadPrice(calendarDayRange) {

    if(calendarDayRange) {
      showLoadingBookingPrice();
      hideBookingPrice();
      hideInfoDisplay();
      hideContactOwnerBookingPrice();

      var numberOfAdults = 1;
      var numberOfChildren = 0;
      var numberOfInfants = 0;
      var numberOfPets = 0;


      property().bookingQuote(
        calendarDayRange, numberOfAdults, numberOfChildren, numberOfInfants, numberOfPets, function(amount) {
          hideLoadingBookingPrice();
          if(amount != null) {
            var numberOfNights = calendarDayRange.countNights();
            var period = numberOfNights + (numberOfNights > 1 ? " Nights" : " Night");

            showBookingPrice(amount);
            setBookingPeriodDisplay(period);
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
      showInfoDisplay();
    }
  }




  function startDatepickerColouringAsArray(colouring) {
    return datepickerColouringAsArray(colouring, true);
  }


  function endDatepickerColouringAsArray(colouring) {
    return datepickerColouringAsArray(colouring, false);
  }


  function datepickerColouringAsArray(colouring, selectStartDate) {

    var colouringClassesArray = [];

    var calendarDaysToColour = calendarMonthRange.getArrayOfAllCalendarDays();
    var numberOfDaysToColour = calendarDaysToColour.length;


    for(var i = 0; i < numberOfDaysToColour; i++) {
      /** {CalendarDay} calendarDay */
      var calendarDay = calendarDaysToColour[i];
      var classes = [];

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

      colouringClassesArray[calendarDay.toYearMonthDayString()] = classes;
    }

    return colouringClassesArray;
  }






  /**
   * Load the coloured availability of the current property.
   */
  function loadColouredAvailability(successCallback, failureCallback) {

    // Establish call backs
    successCallback = successCallback != null ? successCallback : function() {};
    failureCallback = failureCallback != null ? failureCallback : function() {};

    property().colouredAvailability(calendarMonthRange, function(loadedColouring, loadedAvailability) {

      startDatepickerColouring = startDatepickerColouringAsArray(loadedColouring);
      endDatepickerColouring = endDatepickerColouringAsArray(loadedColouring);
      availability = loadedAvailability;

      successCallback(loadedColouring, loadedAvailability, calendarMonthRange);

    }, function() {
      failureCallback();
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














}(jQuery));