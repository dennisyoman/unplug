$(document).ready(function () {
  //載入完成要執行init
  $("#module_wrapper")
    .unbind()
    .bind("compLoaded", function () {
      //lowlag audios
      var tempSound = $(this).find("audio");
      if (tempSound.length > 0) {
        tempSound.each(function () {
          if ($SFXNameAr.indexOf($(this).attr("src")) == -1) {
            $SFXNameAr.push($(this).attr("src"));
            $SFXAr.push(new Audio($(this).attr("src")));
          }
        });
      }

      //tabs
      $(".tabs > span")
        .unbind()
        .bind("click", function () {
          if (!$(this).hasClass("selected")) {
            if (!lowlaged) {
              lowlaged = true;
              lowlagSFX();
              activeSFX();
            }
            //init
            $(this)
              .addClass("selected")
              .siblings(".selected")
              .removeClass("selected");
            openContent($(this).index());
          }
        });
      if ($(".tabs > span").length < 2) {
        $(".tabs").hide();
      }

      //sidetool
      $(".sideTool > div.btn_answer")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showAnswer(true);
          } else {
            showAnswer(false);
          }
        });

      //init

      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          $(".tabs > span").eq(0).click();
          $(this).dequeue().unbind();
        });
      deactiveLoading();
    });
  //assetsPreload img
  $("#module_wrapper")
    .find("img")
    .each(function () {
      var src = $(this).attr("src");
      $("#module_wrapper > .assetsPreload").append(`<img src="${src}" />`);
    });
  //check loading
  checkCompLoading("#module_wrapper");
  $("#module_wrapper .units-title")
    .addClass("l" + lid)
    .text(getLessonName());
  $("#module_wrapper .tabs").addClass("l" + lid);
});

var showAnswer = function (boolean) {
  if (boolean) {
    $(".contents > div.selected .puzzle").addClass("showAnswer");
    $(".contents > div.selected .pattern").addClass("showAnswer");
  } else {
    $(".contents > div.selected .puzzle").removeClass("showAnswer");
    $(".contents > div.selected .pattern").removeClass("showAnswer");
  }
};
var lowlaged = false;

var switchSample = function (tar, repeat) {
  var newSRC = tar.attr("url");
  var target = $(".contents > div.selected .sample > img");
  target.attr("src", newSRC);
  var ansTarget = $(".contents > div.selected .pattern");
  ansTarget.addClass("showAnswer").find("p > span").text(repeat);
  //
  tar.addClass("selected").siblings(".selected").removeClass("selected");
};

var openContent = function (id) {
  resetAudio();
  resetTool();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  elem.find(".showAnswer").removeClass("showAnswer");
  if (elem.find(".ans").length > 0) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
  }
  //sample
  elem.find(".selected").removeClass("selected");
  var newSRC = elem.find(".sample").attr("url");
  var target = elem.find(".sample > img");
  target.attr("src", newSRC);
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
