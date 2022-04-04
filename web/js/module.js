var switchIntro = function () {
  var tempIntro = $("#module_wrapper #contents > div.selected >.intro");
  if (tempIntro.length >= 1) {
    if (tempIntro.css("display") == "none") {
      tempIntro.css("display", "flex");
    } else {
      tempIntro.hide().addClass("visited");
    }
  }
};
