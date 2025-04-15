var switchIntro = function () {
  var tempIntro = $("#module_wrapper #contents > div.selected >.intro");
  if (tempIntro.length >= 1) {
    if (tempIntro.css("display") == "none") {
      tempIntro.css("display", "flex");
      //暫時把複製品藏起來
      $(".cardAvatar").hide().addClass("hide-temp");
    } else {
      tempIntro.hide().addClass("visited");
      //恢復複製品
      $(".hide-temp").show().removeClass("hide-temp");
    }
  }
};
