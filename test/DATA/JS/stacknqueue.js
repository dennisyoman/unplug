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
          $(this).hide();
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

var duration = 800;
var cloneMe = function (tar) {
  tar.removeClass("active");
  var aim = tar.attr("des").split("_");
  var cloner = $(".contents > div.selected").find(".stack > .clone");
  cloner.css("transition", "all " + 0 + "ms");
  cloner.css("left", tar.css("left")).css("top", tar.css("top"));
  var avatar = tar.clone();
  avatar.css("animation-duration", duration + "ms");
  avatar.delay(5).queue(function () {
    cloner.css("transition", "all " + duration + "ms");
    cloner
      .css(
        "left",
        $("#" + aim[0])
          .find("span")
          .eq(parseInt(aim[1]) - 1)
          .css("left"),
      )
      .css(
        "top",
        $("#" + aim[0])
          .find("span")
          .eq(parseInt(aim[1]) - 1)
          .css("top"),
      );
    $(this).dequeue();
    $(".contents > div.selected").find(".balls").addClass("disable");
    //
  });

  cloner
    .append(avatar)
    .delay(duration)
    .queue(function () {
      //target react
      $("#" + aim[0])
        .find("span")
        .eq(parseInt(aim[1]) - 1)
        .addClass("active");
      ////complete group?
      if (tar.parent().find("> span.active").length == 0) {
        $("#" + aim[0])
          .addClass("active")
          .siblings(".active")
          .removeClass(".active");
        //multistep?
        if (
          $(".contents > div.selected").find(".stack").hasClass("multisteps")
        ) {
          $(".contents > div.selected").find(".stack").addClass("nextstep");
        }
      }
      //
      $(".contents > div.selected").find(".balls").removeClass("disable");
      $(this).empty().dequeue();
    });
};
var moveQueue = function (tar) {
  $(".sideTool > div.btn_replay").show();
  //
  tar.find(">span").removeClass();
  tar.delay(5).queue(function () {
    $(this)
      .find("> span")
      .each(function (index) {
        if (index == 0) {
          if ($(this).find("span").length > 0) {
            $(".contents > div.selected")
              .find(".notice > span:not(.done)")
              .eq(0)
              .addClass("done")
              .text($(this).find("span").text());
            rootSoundEffect($good);
          } else {
            rootSoundEffect($show);
          }
        }
        if ($(this).next().length > 0) {
          var child = $(this).next().html();
          $(this).empty().append(child);
        } else {
          $(this).empty();
        }
        $(this).addClass($(this).attr("dir"));
      });
    $(this).dequeue();
  });
};

var lowlaged = false;

var openContent = function (id) {
  resetAudio();
  resetTool();
  //20260204
  removeToggleAttachment();
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  elem.find(".selected").removeClass("selected");
  elem.find(".active").removeClass("active");
  elem.find(".disable").removeClass("disable");
  //stack
  elem
    .find(".balls")
    .find("> span")
    .unbind()
    .bind("click", function () {
      if (
        $(this).prev().length < 1 ||
        ($(this).prev().length > 0 && !$(this).prev().hasClass("active"))
      ) {
        rootSoundEffect($bouncing);
        $(".sideTool > div.btn_replay").show();
        //clone
        cloneMe($(this));
      } else {
        rootSoundEffect($stupid);
      }
    });

  //reset stack & balls
  elem.find(".stack").removeClass("nextstep");
  elem
    .find(".balls")
    .eq(0)
    .addClass("active")
    .find("> span")
    .addClass("active");
  //reset queue
  elem.find(".queue > .customers > span").each(function () {
    $(this).removeClass().empty();
    if ($(this).attr("custom")) {
      $(this).append(
        `<img src="./DATA/PT/BOOK10/IMAGES/customer_${$(this).attr(
          "custom",
        )}.png"/><span>${$(this).attr("custom")}</span>`,
      );
    }
  });
  elem
    .find(".queue > .customers")
    .delay(5)
    .queue(function () {
      $(this)
        .find("> span")
        .each(function () {
          $(this).addClass($(this).attr("dir"));
        });
      $(this).dequeue();
    });
  elem.find(".queue > .notice > span").removeClass("done").text("");
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
