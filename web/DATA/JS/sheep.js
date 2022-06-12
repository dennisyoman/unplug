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

      $(".items > span")
        .unbind()
        .bind("click", function () {
          $(".sideTool > div.btn_replay").removeClass("active").show();
          //
          if ($(this).hasClass("black")) {
            $(this).removeClass("black").addClass("white");
            rootSoundEffect($pop);
          } else if ($(this).hasClass("white")) {
            $(this).removeClass("white");
            rootSoundEffect($show);
          } else {
            $(this).removeClass("black").addClass("black");
            rootSoundEffect($pop);
          }
        });
      $(".items > span").each(function () {
        var w = $(this).parent().attr("w");
        var h = $(this).parent().attr("h");
        $(this).css("width", w + "px");
        $(this).css("height", h + "px");
      });

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
      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          $(this).hide();
          resetElem($(".contents > div.selected"));
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
    //秀出答案圖片
    $(".contents > div.selected .items > span").each(function () {
      var sheep = $(this).attr("ans");
      if (sheep == "") {
        sheep = "none";
      }
      $(this).addClass(sheep);
    });
  } else {
    $(".contents > div.selected .items > span").removeClass("w b none");
  }
};

var lowlaged = false;

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
  elem.find(".items > span").removeClass();
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
