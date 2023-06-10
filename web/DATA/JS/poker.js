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
          } else {
            showAnswer(false);
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
          resetElem($(".contents > div.selected"));
          $(".sideTool > div.btn_answer").removeClass("active");
          rootSoundEffect($show);
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

var checkAnswer = function () {
  var getWrong = false;
  $(".contents > div.selected .subject")
    .find(".question > div")
    .each(function () {
      var num = $(this).find(">p > span");
      if (num.text() != num.attr("ans")) {
        getWrong = true;
      }
    });
  if (getWrong) {
    rootSoundEffect($wrong);
    $(".contents > div.selected .subject").append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_stupid.png"/></span>`
    );
    $(".resultIcon")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  } else {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    $(".contents > div.selected .subject").append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
    );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
      });
  }
};

var addupMe = function (tar, max) {
  var amount = tar.text();
  if (amount == "") {
    amount = 1;
  } else {
    amount = parseInt(amount) + 1;
  }
  amount = amount > max ? 0 : amount;
  tar.text(amount);
};

var showAnswer = function (boolean) {
  if (boolean) {
    $(".contents > div.selected")
      .find(".sensorArea > .sensorGroup >.sensor")
      .removeClass("selected")
      .click();
    //answer question input
    $(".contents > div.selected")
      .find(".question > div")
      .each(function () {
        $(this).find("> p > span").text($(this).find("> p > span").attr("ans"));
      });
    //
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
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
  elem.find(".selected").removeClass("selected");
  elem.find(".question > div > p > span").text("");
  elem.find(".question > div > div").empty();
  resetTool();

  elem.find(".sensorArea > .sensorGroup > .sensor").each(function () {
    $(this)
      .unbind()
      .bind("click", function () {
        if (
          !$(this).parent().hasClass("selected") &&
          !$(this).hasClass("selected")
        ) {
          $(this).addClass("selected");
          if ($(this).parent().hasClass("chained")) {
            $(this).parent().addClass("selected");
          }

          var quesID = $(this).parent().attr("ques");
          var quesTarget = elem.find("#" + quesID);
          var quesTargetP =
            quesTarget.find(">p > span").text() != ""
              ? quesTarget.find(">p > span").text()
              : 0;
          quesTargetP = parseInt(quesTargetP) + 1;
          quesTarget.find(">p > span").text(quesTargetP);
          //有沒有icon
          if ($(this).parent().attr("icon")) {
            var quesTargetD = quesTarget.find(">div");
            quesTargetD.append($(this).parent().attr("icon"));
          }
          //
          rootSoundEffect($key);
          $(".sideTool > div.btn_check").show();
          $(".sideTool > div.btn_replay").show();
        }
      });
  });

  $(".smoke").remove();
  $(".resultIcon").remove();
  $(".sideTool > div.btn_answer").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
