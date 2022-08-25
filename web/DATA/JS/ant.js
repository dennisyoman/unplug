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
      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            checkAnswer(true);
          } else {
            checkAnswer(false);
          }
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

var moveAnt = function (ant) {
  $(".contents > div.selected").find(".map").addClass("disabled");
  ant.addClass("walk");
  var path = ant.siblings(".path").find(">span");
  var keepgoing = false;
  for (var i = 0; i < path.length; i++) {
    if (!path.eq(i).hasClass("visited")) {
      keepgoing = true;
      var targetPoint = path.eq(i);
      targetPoint.addClass("visited");
      var intX = targetPoint.get(0).style.left;
      var intY = targetPoint.get(0).style.top;
      ant.css("top", intY).css("left", intX);
      rootSoundEffect($pop);
      //check input output
      if (targetPoint.attr("input")) {
        if (ant.hasClass(targetPoint.attr("input"))) {
          ant
            .removeClass(targetPoint.attr("input"))
            .addClass(targetPoint.attr("output"));
          rootSoundEffect($right);
          //
          var uniq = new Date().getTime();
          ant.append(
            `<span class="smoke"><img src="./DATA/IMAGES/common/smoke.gif?uniq=${uniq}"/></span>`
          );
          $(".smoke")
            .delay(1100)
            .queue(function () {
              $(this).dequeue().remove();
            });
        } else {
          //rootSoundEffect($wrong);
        }
      }
      //check guess
      if (targetPoint.find(".guess").length > 0) {
        var guess = targetPoint.find(".guess");
        if (guess.hasClass(guess.attr("ans"))) {
          rootSoundEffect($chimes);
          var uniq = new Date().getTime();
          guess.append(
            `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
          );
          $(".smoke")
            .delay(1800)
            .queue(function () {
              $(".resultIcon").remove();
              $(this).dequeue().remove();
            });
          //
        } else {
          rootSoundEffect($wrong);
          ant.addClass("pending");
          guess
            .addClass("wrong")
            .append(
              `<span class="smoke wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
            );
          keepgoing = false;
        }
      }
      break;
    }
  }
  //continue walk?
  if (keepgoing) {
    antTimeout = setTimeout(function () {
      moveAnt(ant);
    }, antDuration);
  } else {
    if ($(".contents > div.selected").find(".wrong").length == 0) {
      $(".contents > div.selected").find(".map").removeClass("disabled");
      //
      var path = $(".contents > div.selected").find(".path>span:not(.visited)");
      var extraAnt = $(".contents > div.selected").find(".who").find(".ant");
      if (extraAnt.length > 0 && path.length == 0) {
        $(".contents > div.selected").find(".map").addClass("disabled");
        if (extraAnt.hasClass(extraAnt.attr("ans"))) {
          console.log("right");
          extraAnt.addClass("right");
          rootSoundEffect($correct);
        } else {
          extraAnt.addClass("wrong");
          rootSoundEffect($fail);
        }
      }
    }
    ant.removeClass("walk");
  }
};

var showAnswer = function (boolean) {
  if (boolean) {
    $(".sideTool > div.btn_replay").click();
    $(".sideTool > div.btn_answer").addClass("active");
    $(".contents > div.selected")
      .find(".guess")
      .each(function () {
        $(this).addClass("visited").addClass($(this).attr("ans"));
      });
    //
    var extraAnt = $(".contents > div.selected").find(".who").find(".ant");
    if (extraAnt.length > 0) {
      extraAnt
        .removeClass()
        .addClass("ant")
        .addClass(extraAnt.attr("int"))
        .addClass(extraAnt.attr("ans"));
      $(".contents > div.selected").find(".alert").hide();
    }
    //
    rootSoundEffect($help);

    $(".sideTool > div.btn_check").removeClass("active").show();
    $(".sideTool > div.btn_replay").removeClass("active").show();
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};

var antTimeout;
var antDuration = 1100;

var checkAnswer = function (boolean) {
  if (boolean) {
  } else {
    clearTimeout(antTimeout);
    resetAudio();
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
  resetAudio();
  clearTimeout(antTimeout);
  //
  elem.find(".disabled").removeClass("disabled");
  elem.find(".walk").removeClass("walk");
  elem.find(".right").removeClass("right");
  elem.find(".wrong").removeClass("wrong");
  elem.find(".pending").removeClass("pending");
  elem.find(".visited").removeClass("visited");
  elem.find(".donut").removeClass("donut");
  elem.find(".milk").removeClass("milk");
  elem.find(".rice").removeClass("rice");
  elem.find(".alert").fadeIn();
  //
  elem.find(".path > span").each(function () {
    $(this).removeClass("wow bounce animated");
  });
  //
  elem.find(".subject").each(function () {
    var ant = $(this).find(".ant");
    var path = $(this).find(".path > span");
    for (var i = 0; i < path.length; i++) {
      if (path.eq(i).attr("int")) {
        var startPoint = path.eq(i);
        startPoint.addClass("visited");
        var intX = startPoint.get(0).style.left;
        var intY = startPoint.get(0).style.top;
        ant.css("top", intY).css("left", intX);
        ant.addClass(startPoint.attr("int"));
      }
    }
    //
    ant
      .siblings(".path")
      .find(".guess")
      .unbind()
      .bind("click", function () {
        rootSoundEffect($key);
        $(".sideTool > div.btn_replay").removeClass("active").show();
        $(".sideTool > div.btn_answer").removeClass("active");
        if ($(this).hasClass("donut")) {
          $(this).removeClass("donut").addClass("visited rice");
        } else if ($(this).hasClass("rice")) {
          $(this).removeClass("rice").addClass("visited milk");
        } else {
          $(this).removeClass("milk").addClass("visited donut");
        }
      });
    ant
      .addClass("swing")
      .unbind()
      .bind("click", function () {
        var guesses = $(this).siblings(".path").find(".guess:not(.visited)");
        if (guesses.length == 0) {
          if (!$(this).hasClass("pending")) {
            $(this).removeClass("swing");
            moveAnt($(this));
            $(".sideTool > div.btn_replay").removeClass("active").show();
          } else {
            //重設單一螞蟻
            resetElem($(this).parent());
            var path = $(this).parent().find(".path > span");
            for (var i = 0; i < path.length; i++) {
              if (path.eq(i).attr("int")) {
                var startPoint = path.eq(i);
                startPoint.addClass("visited");
                var intX = startPoint.get(0).style.left;
                var intY = startPoint.get(0).style.top;
                $(this).css("top", intY).css("left", intX);
                $(this).addClass(startPoint.attr("int"));
              }
            }
            $(this).addClass("swing");
            $(".contents > div.selected").find(".map").removeClass("disabled");
          }
        } else {
          guesses
            .parent()
            .addClass("wow bounce")
            .delay(800)
            .queue(function () {
              $(this).dequeue().removeClass("wow bounce animated");
            });
          rootSoundEffect($surprise);
        }
      });
    //
    var extraAnt = elem.find(".who").find(".ant");
    if (extraAnt.length > 0) {
      extraAnt
        .removeClass()
        .addClass("ant")
        .addClass(extraAnt.attr("int"))
        .unbind()
        .bind("click", function () {
          extraAnt.siblings(".alert").hide();
          rootSoundEffect($key);
          $(".sideTool > div.btn_replay").removeClass("active").show();
          $(".sideTool > div.btn_answer").removeClass("active");
          var colour = $(this).attr("seq").split(",");
          var seq = -1;
          for (var j = 0; j < colour.length; j++) {
            if ($(this).hasClass(colour[j])) {
              $(this).removeClass(colour[j]);
              seq = j;
            }
          }
          seq += 1;
          if (seq >= colour.length) {
            seq = 0;
          }
          $(this).addClass(colour[seq]);
        });
    }
  });
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".sideTool > div.btn_check").removeClass("active").hide();
  $(".smoke").remove();
  $(".resultIcon").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
