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

var trigMe = function (tar) {
  var frame = $(".contents > div.selected").find(".puzzle .items.selected");
  //
  if (tar.parent().parent().hasClass("code")) {
    if (frame.length > 0) {
      rootSoundEffect($pop);
      frame.append(tar.clone());
    }
  }
  if (tar.parent().parent().hasClass("puzzle")) {
    rootSoundEffect($show);
    tar
      .parent()
      .addClass("selected")
      .siblings(".selected")
      .removeClass("selected");
    tar.remove();
    window.event.stopPropagation();
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    rootSoundEffect($help);
    //秀出答案圖片
    if ($(".contents > div.selected .puzzle").find(".ans").length > 0) {
      $(".contents > div.selected .puzzle").addClass("showAnswer");
    }
  } else {
    $(".contents > div.selected .puzzle").removeClass("showAnswer");
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
  elem.find(".showAnswer").removeClass("showAnswer");
  elem.find(".done").removeClass("done");
  elem.find(".selected").removeClass("selected");
  //
  if (elem.find(".ans").length > 0) {
    $(".sideTool > div.btn_answer").removeClass("active").show();
  }
  //reset sub
  elem.find(".puzzle .items").removeClass("selected").empty();
  elem
    .find(".puzzle .items")
    .unbind()
    .bind("click", function () {
      $(this)
        .toggleClass("selected")
        .siblings(".selected")
        .removeClass("selected");
    });
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
