$(function() {
  $(".ga-availability").each(function() {
    $(this).gaAvailabilityWidget();
  });
  $(".ga-onlineBookingModal").each(function() {
    $(this).gaOnlineBookingModalWidget();
  });
});