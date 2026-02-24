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

//
var lowlaged = false;

var gridModes = [];
var currentMode = 0;
var winwin = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

var checkResult = function () {
  $(".alert").remove();
  $(".sideTool > div.btn_replay").show();
  //
  var grids = $(".contents > div.selected .plate .grid > span");
  var win = true;
  for (var i = 0; i < winwin.length; i++) {
    var groupArr = winwin[i];
    win = true;
    for (var j = 0; j < groupArr.length; j++) {
      if (grids.eq(groupArr[j]).hasClass(`${gridModes[currentMode]}`)) {
      } else {
        win = false;
      }
    }
    if (win) {
      for (var j = 0; j < groupArr.length; j++) {
        grids.eq(groupArr[j]).addClass("win");
      }
      break;
    }
  }

  if (win) {
    //贏了
    grids.addClass("done");
    rootSoundEffect($chimes);
    var alertmsg = "一方獲勝";
    $(".contents > div.selected").append(
      `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`,
    );
  } else {
    //沒有結果的話就繼續下一個順序
    if (
      $(".contents > div.selected .plate .grid > span:not('.done')").length == 0
    ) {
      console.log("gameover");
      rootSoundEffect($surprise);
      var alertmsg = "雙方平手";
      $(".contents > div.selected").append(
        `<div class="alert wow bounceInUp" onclick="$(this).remove()">${alertmsg}</div>`,
      );
    }
    //繼續下一個
    currentMode += 1;
    if (currentMode >= gridModes.length) {
      currentMode = 0;
    }
  }
};
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
  $(".alert").remove();
  currentMode = 0;
  gridModes = elem.find(".plate .grid").attr("mode").split(",");
  elem.find(".done").removeClass("done");
  elem.find(".plate .grid > span").removeClass("win");
  for (var i = 0; i < gridModes.length; i++) {
    elem.find(".plate .grid > span").removeClass(gridModes[i]);
  }
  //
  elem
    .find(".plate .grid > span")
    .unbind()
    .bind("click", function () {
      $(this).addClass("done").addClass(gridModes[currentMode]);
      rootSoundEffect($pop);
      checkResult();
    });
  //
  resetTool();
  $(".alert").remove();
  $(".smoke").remove();
  $(".resultIcon").remove();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
