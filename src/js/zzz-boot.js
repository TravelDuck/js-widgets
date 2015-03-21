$(function() {
  $(".travelduck.availability").each(function() {
    $(this).travelduckAvailability();
  });
  $(".travelduck.onlineBookingModal").each(function() {
    $(this).travelduckOnlineBookingModal();
  });
});