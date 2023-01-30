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

var lowlaged = false;

var bingo = function (tar) {
  rootSoundEffect($chimes);
  var uniq = new Date().getTime();
  tar.append(
    `<span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`
  );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(this).dequeue().remove();
    });
};

var sum = 0;
var countdown = 0;
var timeDiff = 400;
var timeDiff2 = 300;
var timeoutAvatar;

var getFingerCount = function (me, tar) {
  $(".contents > div.selected .counters > span").addClass("disable");
  $(".contents > div.selected .sensors > span").removeClass();
  //
  sum = 0;
  countdown = 0;
  var fingers = [];
  for (var i = 0; i < 4; i++) {
    fingers.push(1 + Math.floor(Math.random() * 5));
  }
  $(".contents > div.selected .fingers")
    .find(">span")
    .each(function (index) {
      $(this).find("> span").remove();
      $(this)
        .removeClass()
        .addClass("f" + fingers[index]);
      for (var i = 0; i < fingers[index]; i++) {
        sum += 1;
        $(this).append(
          `<span class="wow fadeIn" data-wow-delay="${
            (timeDiff * (sum + 1)) / 1000
          }s">${sum}</span>`
        );
      }
    });
  $(".contents > div.selected .fingers").show();
  me.text("?");
  rootSoundEffect($pop);
  tar.delay(timeDiff * sum + 1200).queue(function () {
    me.text(sum);
    $(".contents > div.selected .fingers").hide();
    //
    $(this).dequeue();
    //開始數數
    timeoutAvatar = setTimeout(() => {
      countItem(tar);
    }, timeDiff2);
  });
};

var countItem = function (tar) {
  var amount = tar.find(">span").length;
  if (countdown < sum) {
    rootSoundEffect($key);
    tar
      .find(">span")
      .eq(countdown % amount)
      .removeClass()
      .addClass("selected seq" + (countdown + 1))
      .siblings(".selected")
      .removeClass();
    countdown += 1;
    timeoutAvatar = setTimeout(() => {
      countItem(tar);
    }, timeDiff2);
  } else {
    //
    bingo(tar.find(">span.selected"));
    $(".contents > div.selected .counters > span").removeClass("disable");
    //有無貼紙
    if (tar.attr("sticker_area")) {
      var areaArr = tar.attr("sticker_area").split(",");
      for (var k = 0; k < areaArr.length; k++) {
        $("#" + areaArr[k])
          .empty()
          .append(
            `<img class="wow bounceIn" src="${tar
              .find(">span.selected")
              .attr("sticker")}"/>`
          );
      }
    }
  }
};

var openContent = function (id) {
  $(".contents > div")
    .eq(id)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  resetElem($(".contents > div.selected"));
};

var resetElem = function (elem) {
  resetAudio();
  resetTool();
  sum = 0;
  countdown = 0;
  elem.find(".selected").removeClass("selected");
  elem.find(".counters > span").removeClass("disable").text("?");
  elem.find(".sensors").clearQueue().dequeue();
  elem.find(".sensors > span").removeClass();
  elem.find(".stickers > span").empty();
  elem.find(".fingers").hide();
  clearTimeout(timeoutAvatar);

  $(".smoke").remove();
  $(".resultIcon").remove();
  //
  $(".sideTool > div.btn_replay").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
