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
            $(".sideTool > div.btn_check").hide();
            $(".sideTool > div.btn_replay").show();
          } else {
            showAnswer(false);
            $(".sideTool > div.btn_replay").hide();
          }
        });
      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkAnswer();
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

var timeoutSeagull;
var durationSeagull = 1000;
var tripSeq = 0;
var makeTrip = function (tar) {
  $(".sideTool > div.btn_replay").show();
  //init
  tar.addClass("selected");
  tripSeq = 0;
  var startY = tar.css("top");
  var startX = tar.css("left");

  var seagull = $(".contents > div.selected").find(".tracker .seagull");
  seagull.removeClass("flying");
  seagull.css("top", startY).css("left", startX);
  //開始飛翔
  seagull.delay(10).queue(function () {
    seagull.addClass("flying");
    tar.parent().addClass("disable");
    //
    makeATrip(tar);
    //
    $(this).dequeue();
  });
};

var makeATrip = function (tar) {
  rootSoundEffect($show);
  var seagull = $(".contents > div.selected").find(".tracker .seagull");
  var trip = tar.attr("trip").split("^");
  var locations = $(".contents > div.selected").find(".locations");
  var desY = locations.find(">div[type='" + trip[tripSeq] + "']").css("top");
  var desX = locations.find(">div[type='" + trip[tripSeq] + "']").css("left");
  seagull.css("top", desY).css("left", desX);
  //marker
  var markers = locations
    .find(">div[type='" + trip[tripSeq] + "']")
    .find(".markers");
  var colour = tar.attr("seagull");
  markers.find("span[class='" + colour + "']").addClass("active");

  //
  timeoutSeagull = setTimeout(function () {
    tripSeq++;
    if (tripSeq < trip.length) {
      //繼續飛
      makeATrip(tar);
    } else {
      //停止
      seagull.removeClass("flying");
      tar.parent().removeClass("disable");
    }
  }, durationSeagull);
};

var showAnswer = function (boolean) {
  if (boolean) {
    $(".sideTool > div.btn_answer").addClass("active");
    rootSoundEffect($help);
    //
    $(".contents > div.selected")
      .find(".quiz span")
      .each(function () {
        if ($(this).attr("type") && $(this).attr("type") == "img") {
          $(this).removeClass("wrong").addClass($(this).attr("ans"));
        } else {
          $(this).removeClass("wrong").html($(this).attr("ans"));
        }
      });
  } else {
    $(".sideTool > div.btn_replay").click();
    rootSoundEffect($show);
  }
};

var checkAnswer = function () {
  var gotWrong = false;
  $(".contents > div.selected")
    .find(".quiz span")
    .each(function () {
      if ($(this).attr("type") && $(this).attr("type") == "img") {
        if (!$(this).hasClass($(this).attr("ans"))) {
          $(this).addClass("wrong");
          gotWrong = true;
        }
      } else {
        if ($(this).attr("ans") != $(this).html()) {
          $(this).addClass("wrong");
          gotWrong = true;
        }
      }
    });
  if (gotWrong) {
    rootSoundEffect($wrong);
  } else {
    bingo();
  }
};

var lowlaged = false;

var bingo = function () {
  rootSoundEffect($correct);
  var uniq = new Date().getTime();
  $(".contents > div.selected")
    .find(".quiz")
    .append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
    );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
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
  elem.find(".wrong").removeClass("wrong");
  elem.find(".disable").removeClass("disable");
  elem.find(".active").removeClass("active");
  elem.find(".flying").removeClass("flying");
  clearTimeout(timeoutSeagull);
  //puzzle

  elem
    .find(".map > .subject")
    .find("span")
    .each(function () {
      $(this)
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("selected");
          rootSoundEffect($pop);
          var type = $(this).attr("type");
          if ($(this).hasClass("selected")) {
            $(this)
              .siblings("span[type='" + type + "']")
              .addClass("disable");
          } else {
            $(this)
              .siblings("span[type='" + type + "']")
              .removeClass("disable");
          }
        });
    });

  elem.find(".quiz span").each(function () {
    $(this)
      .empty()
      .removeClass()
      .unbind()
      .bind("click", function () {
        $(".sideTool > div.btn_answer").removeClass("active");
        $(".sideTool > div.btn_check").show();
        $(this).removeClass("wrong");
        rootSoundEffect($key);
        //
        var options = $(this).attr("str").split("^");
        if ($(this).attr("type") && $(this).attr("type") == "img") {
          //使用class
          var currOption = $(this).attr("class");

          var Oid = options.indexOf(currOption);
          if (Oid == -1) {
            $(this).removeClass().addClass(options[0]);
          } else {
            Oid += 1;
            if (Oid >= options.length) {
              Oid = 0;
            }
            $(this).removeClass().addClass(options[Oid]);
          }
        } else {
          //使用html字串
          var currOption = $(this).html();

          var Oid = options.indexOf(currOption);
          if (Oid == -1) {
            $(this).html(options[0]);
          } else {
            Oid += 1;
            if (Oid >= options.length) {
              Oid = 0;
            }
            $(this).html(options[Oid]);
          }
        }
      });
  });

  $(".smoke").remove();
  $(".resultIcon").remove();
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
