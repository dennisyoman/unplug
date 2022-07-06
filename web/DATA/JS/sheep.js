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

      $(".sheeps > div > span").each(function () {
        $(this)
          .unbind()
          .bind("click", function () {
            //move
            moveSheep($(this));
            //
            $(".sideTool > div.btn_replay").removeClass("active").show();
          });
        //
        var w = $(this).parent().parent().attr("w");
        var h = $(this).parent().parent().attr("h");
        $(this).css("width", w + "px");
        $(this).css("height", h + "px");
        $(this).addClass($(this).attr("int")).attr("cur", $(this).attr("int"));
      });

      $(".items > div > span").each(function () {
        $(this)
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
        //
        var w = $(this).parent().parent().attr("w");
        var h = $(this).parent().parent().attr("h");
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

var moveSheep = function (sheep) {
  var index = sheep.index;
  var className = sheep.attr("cur");

  if (
    sheep.next().length > 0 &&
    !sheep.next().hasClass("b") &&
    !sheep.next().hasClass("w")
  ) {
    //往右
    sheep.next().addClass(className).attr("cur", className);
    sheep.removeClass().removeAttr("cur");
    rootSoundEffect($show);
    checkAns();
  } else if (
    sheep.prev().length > 0 &&
    !sheep.prev().hasClass("b") &&
    !sheep.prev().hasClass("w")
  ) {
    //往左
    sheep.prev().addClass(className).attr("cur", className);
    sheep.removeClass().removeAttr("cur");
    rootSoundEffect($show);
    checkAns();
  } else if (
    sheep.next().next().length > 0 &&
    !sheep.next().next().hasClass("b") &&
    !sheep.next().next().hasClass("w")
  ) {
    //往右跳過
    sheep
      .next()
      .next()
      .addClass(className + " jumpLTR")
      .attr("cur", className);
    sheep.removeClass().removeAttr("cur");
    rootSoundEffect($bouncing);
    checkAns();
  } else if (
    sheep.prev().prev().length > 0 &&
    !sheep.prev().prev().hasClass("b") &&
    !sheep.prev().prev().hasClass("w")
  ) {
    //往左跳過
    sheep
      .prev()
      .prev()
      .addClass(className + " jumpRTL")
      .attr("cur", className);
    sheep.removeClass().removeAttr("cur");
    rootSoundEffect($bouncing);
    checkAns();
  } else {
    //無法移動
    rootSoundEffect($stupid);
  }
};

var checkAns = function () {
  var sheeps = $(".contents > div.selected .sheeps > div > span");
  var row = $(".contents > div.selected .items > div");
  if (sheepStep < row.length) {
    for (var i = 0; i < sheeps.length; i++) {
      if (sheeps.eq(i).attr("cur") == "b") {
        row.eq(sheepStep).find(">span").eq(i).addClass("black");
      } else if (sheeps.eq(i).attr("cur") == "w") {
        row.eq(sheepStep).find(">span").eq(i).addClass("white");
      } else {
        row.eq(sheepStep).find(">span").eq(i).removeClass();
      }
    }
    //
    sheepStep++;
  } else {
    //答案是否正確
    var getWrong = false;
    for (var i = 0; i < sheeps.length; i++) {
      if (
        sheeps.eq(i).attr("cur") &&
        sheeps.eq(i).attr("cur") != sheeps.eq(i).attr("ans")
      ) {
        getWrong = true;
      }
    }
    if (getWrong) {
      console.log("wrong");
      rootSoundEffect($wrong);
      var uniq = new Date().getTime();
      $(".contents > div.selected")
        .find(".puzzle")
        .append(
          `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
        );
    } else {
      console.log("right");
      var uniq = new Date().getTime();
      $(".contents > div.selected")
        .find(".puzzle")
        .append(
          `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
        );
      rootSoundEffect($correct);
    }

    $(".contents > div.selected .sheeps").addClass("done");
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案圖片
    $(".contents > div.selected .items > div > span").each(function () {
      var sheep = $(this).attr("ans");
      if (sheep == "") {
        sheep = "none";
      }
      $(this).addClass(sheep);
    });
    $(".contents > div.selected .sheeps").addClass("disabled");
    $(".resultIcon").remove();
    $(".smoke").remove();
    rootSoundEffect($help);
  } else {
    $(".contents > div.selected .items > div > span").removeClass("w b none");
    $(".contents > div.selected .sheeps").removeClass("disabled");
    rootSoundEffect($show);
  }
};

var lowlaged = false;
var sheepStep;

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
  sheepStep = 0;
  //sheeps
  elem.find(".sheeps > div > span").each(function () {
    $(this).removeClass().addClass($(this).attr("int"));
    $(this).removeAttr("cur").attr("cur", $(this).attr("int"));
  });
  elem.find(".sheeps").removeClass("disabled done");
  //items
  elem.find(".items > div > span").removeClass();
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".resultIcon").remove();
  $(".smoke").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
