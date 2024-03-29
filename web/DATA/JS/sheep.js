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
            $(".sideTool > div.btn_check").removeClass("active").show();
            //
            $(this).removeClass("wrong");
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
            $(".sideTool > div.btn_check").hide();
          } else {
            showAnswer(false);
            $(".sideTool > div.btn_check").show();
          }
        });
      $(".sideTool > div.btn_replay")
        .unbind()
        .bind("click", function () {
          $(this).hide();
          resetElem($(".contents > div.selected"));
        });
      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkcheck();
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

var moveSheep = function (sheep) {
  console.log(lastSheep);
  if (lastSheep != sheep.attr("cur")) {
    $(".alert").hide();
    //
    if (!sheep.hasClass("choise")) {
      $(".sheeps .pending").removeClass("pending");
      $(".sheeps .choise").removeClass("choise");
      $(".sheeps .jumpLTR").removeClass("jumpLTR");
      $(".sheeps .jumpRTL").removeClass("jumpRTL");
      $(".sheeps .LTR").removeClass("LTR");
      $(".sheeps .RTL").removeClass("RTL");
      var className = sheep.attr("cur");
      //點在羊上面
      //往右
      if (
        sheep.next().length > 0 &&
        !sheep.next().hasClass("b") &&
        !sheep.next().hasClass("w")
      ) {
        //右移1格
        sheep.addClass("pending");
        sheep.next().addClass("choise LTR");
        //移動成立
        lastSheep = sheep.attr("cur");
      } else if (
        sheep.next().next().length > 0 &&
        !sheep.next().next().hasClass("b") &&
        !sheep.next().next().hasClass("w")
      ) {
        //右移2格
        sheep.addClass("pending");
        sheep.next().next().addClass("choise jumpLTR");
        //移動成立
        lastSheep = sheep.attr("cur");
      }
      //往左
      if (
        sheep.prev().length > 0 &&
        !sheep.prev().hasClass("b") &&
        !sheep.prev().hasClass("w")
      ) {
        //左移1格
        sheep.addClass("pending");
        sheep.prev().addClass("choise RTL");
        //移動成立
        lastSheep = sheep.attr("cur");
      } else if (
        sheep.prev().prev().length > 0 &&
        !sheep.prev().prev().hasClass("b") &&
        !sheep.prev().prev().hasClass("w")
      ) {
        //左移2格
        sheep.addClass("pending");
        sheep.prev().prev().addClass("choise jumpRTL");
        //移動成立
        lastSheep = sheep.attr("cur");
      }

      if ($(".sheeps .choise").length == 0) {
        //無法移動
        rootSoundEffect($stupid);
      } else if ($(".sheeps .choise").length == 1) {
        moveSheep($(".sheeps .choise"));
      }
    } else {
      var className = $(".sheeps .pending").attr("cur");

      //選擇方向
      sheep.addClass(className).attr("cur", className);
      $(".sheeps .pending").removeClass().removeAttr("cur");
      $(".sheeps .choise").removeClass("choise");
      rootSoundEffect($show);
      checkAns();
    }
  } else {
    console.log("same colour");
    rootSoundEffect($wrong);
  }
};
var checkcheck = function () {
  var items = $(".contents > div.selected .items > div > span");
  items.each(function () {
    var ans = $(this).attr("ans");
    if (ans == "b" && !$(this).hasClass("black")) {
      $(this).addClass("wrong");
    }
    if (ans == "w" && !$(this).hasClass("white")) {
      $(this).addClass("wrong");
    }
  });
  if ($(".contents > div.selected .items > div > span.wrong").length >= 1) {
    rootSoundEffect($wrong);
  } else {
    var uniq = new Date().getTime();
    $(".contents > div.selected")
      .find(".puzzle")
      .append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
      );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
      });
    rootSoundEffect($correct);
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
    $(".alert").hide();
    $(".contents > div.selected .items > div > span").each(function () {
      var sheep = $(this).attr("ans");
      if (sheep == "") {
        sheep = "none";
      }
      $(this).removeClass("wrong").addClass(sheep);
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
var lastSheep = "";

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
  lastSheep = "";
  resetTool();
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
  $(".alert").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
