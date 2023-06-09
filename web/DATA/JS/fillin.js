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

var showAnswer = function (boolean) {
  if (boolean) {
    $(".sideTool > div.btn_replay").click().show();
    $(".sideTool > div.btn_answer").addClass("active");
    //
    var sensors = $(".contents > div.selected .sensorArea");
    var options = $(".contents > div.selected .options");
    sensors.find(".sensor").each(function () {
      if (
        $(this).attr("opt") &&
        $(".contents > div.selected").find(".options." + $(this).attr("opt"))
          .length > 0
      ) {
        options = $(".contents > div.selected").find(
          ".options." + $(this).attr("opt")
        );
      }
      var fillin = options
        .find(".option[fillin='" + $(this).attr("ans") + "'] .fillin")
        .html();
      $(this)
        .removeClass("wrong")
        .empty()
        .attr("fillin", $(this).attr("ans"))
        .append(fillin);
    });
    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
    rootSoundEffect($show);
  }
};

var checkAnswer = function () {
  var sensors = $(".contents > div.selected .sensorArea");
  sensors.find(".sensor").each(function () {
    if ($(this).attr("ans") != $(this).attr("fillin")) {
      $(this).addClass("wrong");
    }
  });
  if (sensors.find(".sensor.wrong").length > 0) {
    rootSoundEffect($stupid);
  } else {
    bingo();
  }
};

var lowlaged = false;

var bingo = function () {
  rootSoundEffect($correct);
  var uniq = new Date().getTime();
  $(".contents > div.selected")
    .find(".subject")
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
  //options
  if (elem.find(".options").length > 0) {
    elem.find(".options .option").each(function () {
      $(this)
        .removeClass("selected")
        .unbind()
        .bind("click", function () {
          if ($(this).hasClass("selected")) {
            rootSoundEffect($show);
            $(this)
              .removeClass("selected")
              .siblings(".selected")
              .removeClass("selected");
          } else {
            rootSoundEffect($key);
            $(this)
              .addClass("selected")
              .siblings(".selected")
              .removeClass("selected");
          }
        });
    });
    elem.find(".options").each(function () {
      $(this).find(".option").eq(0).addClass("selected");
    });
  }

  //sensorArea
  if (elem.find(".sensorArea").length > 0) {
    elem.find(".sensorArea .sensor").each(function () {
      $(this)
        .empty()
        .removeClass("wrong")
        .attr("fillin", "")
        .unbind()
        .bind("click", function () {
          var options = elem.find(".options");
          if (
            $(this).attr("opt") &&
            elem.find(".options." + $(this).attr("opt")).length > 0
          ) {
            console.log(".options." + $(this).attr("opt"));
            options = elem.find(".options." + $(this).attr("opt"));
          }
          var option = options.find(".option.selected");
          //判斷是否要自動輪替選項
          if (options.hasClass("loop")) {
            ////自動輪替
            if (option.attr("fillin") == $(this).attr("fillin")) {
              //////與選項相同
              option.removeClass("selected");
              if (option.next().length > 0) {
                option = option.next();
              } else {
                option = options.find(".option").eq(0);
              }
              option.addClass("selected");
              var fillin = option.attr("fillin");
              $(this)
                .removeClass("wrong")
                .attr("fillin", fillin)
                .empty()
                .append(option.find(".fillin").html());
              rootSoundEffect($pop);
            } else {
              //////與選項不同
              var fillin = option.attr("fillin");
              $(this)
                .removeClass("wrong")
                .attr("fillin", fillin)
                .empty()
                .append(option.find(".fillin").html());
              rootSoundEffect($pop);
            }
          } else {
            ////人工選擇
            if (
              option.length > 0 &&
              option.attr("fillin") != $(this).attr("fillin")
            ) {
              var fillin = option.attr("fillin");
              $(this)
                .removeClass("wrong")
                .attr("fillin", fillin)
                .empty()
                .append(option.find(".fillin").html());
              rootSoundEffect($pop);
            } else {
              $(this).removeClass("wrong").empty().attr("fillin", "");
              rootSoundEffect($show);
            }
          }
          //
          $(".sideTool > div.btn_answer").removeClass("active");
          $(".sideTool > div.btn_replay").show();
          $(".sideTool > div.btn_check").show();
        });
    });
  }

  $(".smoke").remove();
  $(".resultIcon").remove();
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".sideTool > div.btn_check").hide();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
