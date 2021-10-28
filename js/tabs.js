$(function() {
  var taeb = $(".taeb-switch");
  taeb.find(".taeb").on("click", function() {
    var $this = $(this);

    if ($this.hasClass("active")) return;

    var direction = $this.attr("taeb-direction");

    taeb.removeClass("left right").addClass(direction);
    taeb.find(".taeb.active").removeClass("active");
    $this.addClass("active");
  });
})