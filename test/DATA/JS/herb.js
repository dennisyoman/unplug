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

    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
    rootSoundEffect($show);
  }
};

var checkAnswer = function () {};

var lowlaged = false;

var bingo = function (tar) {
  rootSoundEffect($correct);
  var uniq = new Date().getTime();

  tar.append(
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

var nextTask = function () {
  $(".contents > div.selected .tasks .task.selected")
    .next()
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  $(".contents > div.selected .tasks .cta").hide();
  rootSoundEffect($show);
};

var inCloset = function (tar) {
  tar.addClass("selected");
  var nimg = tar.find("img").attr("src");
  var nname = tar.attr("nname");
  var box = $(".contents > div.selected").find(".closet >div[pimg='']").eq(0);
  box.attr("pimg", nimg);
  box.attr("pname", nname);
  box.append(`
  <span class="pid">${box.index() + 1}</span>
  <span class="pname">${nname}</span>
  <img src="${nimg}" />
  `);
  chosetHerb(box);
};

var chosetHerb = function (tar) {
  //check if right
  var me = tar;
  var gotit = false;
  $(".contents > div.selected")
    .find(".task.selected .demand >div")
    .each(function () {
      var iimg = $(this).find(".iimg > img").attr("src");
      if (iimg == me.find("> img").attr("src")) {
        $(this).addClass("done").find(".iid").text(me.find(".pid").text());
        gotit = true;
        rootSoundEffect($right);
        //check if done
        if (
          $(".contents > div.selected").find(".task.selected .demand >div")
            .length ==
          $(".contents > div.selected").find(".task.selected .demand >div.done")
            .length
        ) {
          if (
            $(".contents > div.selected .tasks .task.selected").next().length >
            0
          ) {
            if (
              $(".contents > div.selected .tasks .task.selected")
                .next()
                .hasClass("task")
            ) {
              $(".contents > div.selected").find(".tasks .cta").show();
              bingo($(".contents > div.selected").find(".tasks"));
            } else {
              //finished
              bingo($(".contents > div.selected").find(".tasks"));
            }
          }
        }
      }
    });

  if (!gotit) {
    rootSoundEffect($wrong);
  }
};

var resetElem = function (elem) {
  elem.find(".selected").removeClass("selected");
  elem.find(".wrong").removeClass("wrong");
  elem.find(".tasks .cta").hide();

  //reset closet
  if (elem.find(".closet").length > 0) {
    elem.find(".closet >div").each(function () {
      if ($(this).attr("new")) {
        $(this).attr("pimg", "");
        $(this).attr("pname", "");
      }

      var pimg = $(this).attr("pimg");
      var pname = $(this).attr("pname");
      var pid = $(this).index() + 1;

      if (pimg != "") {
        $(this).empty().append(`
          <span class="pid">${pid}</span>
          <span class="pname">${pname}</span>
          <img src="${pimg}" />
        `);
      } else {
        $(this).empty();
      }

      $(this)
        .unbind()
        .bind("click", function () {
          chosetHerb($(this));
        });
    });
  }
  //reset tasks
  if (elem.find(".tasks").length > 0) {
    elem.find(".demand > div").each(function () {
      var iimg = $(this).attr("iimg");
      $(this).removeClass("done").empty().append(`
      <span class="iimg"><img src="${iimg}" /></span>在<span class="iid"></span>號
      `);
    });
    //
    elem.find(".tasks > .task").eq(0).addClass("selected");
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
