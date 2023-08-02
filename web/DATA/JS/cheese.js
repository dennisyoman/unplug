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

      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          resetElem($(".contents > div.selected"));
        });

      //init

      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          $(".tabs > span").eq(pid).click();
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

var lowlaged = false;

var toggleCheese = function () {
  $(".contents > div.selected").find(".btn_cheese").toggleClass("active");
  if ($(".contents > div.selected").find(".btn_cheese").hasClass("active")) {
    $(".contents > div.selected").find(".encryption").addClass("active");
  } else {
    $(".contents > div.selected").find(".encryption").removeClass("active");
  }
};

var togglePoke = function () {
  $(".contents > div.selected").find(".btn_poke").toggleClass("active");
};

var toggleDraw = function () {
  $(".contents > div.selected").find(".btn_draw").toggleClass("active");
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
  elem.find(".selected").removeClass("selected");
  elem.find(".done").removeClass("done");
  elem.find(".active").removeClass("active");
  //actions
  elem.find(".btn_cheese").click();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").show();
};
