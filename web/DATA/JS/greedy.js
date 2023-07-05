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

      $(".sideTool > div.btn_check")
        .unbind()
        .bind("click", function () {
          checkAnswer();
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
  var total = parseInt(
    $(".contents > div.selected").find(".des .prices > span").text()
  );
  var sumup = 0;
  $(".contents > div.selected")
    .find(".moneyArea .money")
    .each(function () {
      var pp = parseInt($(this).attr("price"));
      sumup += pp * $(this).find("img").length;
    });
  //
  if (total == sumup) {
    rootSoundEffect($chimes);
    var uniq = new Date().getTime();
    $(".contents > div.selected .moneyArea").append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
    );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(".resultIcon").remove();
        $(this).dequeue().remove();
      });
  } else {
    rootSoundEffect($stupid);
    $(".contents > div.selected .moneyArea").append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
    );
  }
  $(".resultIcon")
    .delay(1500)
    .queue(function () {
      $(this).dequeue().remove();
    });
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
  elem.find(".visited").removeClass("visited");
  elem.find(".resultIcon").remove();
  elem.find(".smoke").remove();
  elem.find(".des .price span").text("");
  elem.find(".des .prices span").text("0");
  //func1
  elem.find(".senseArea > .sensor").each(function () {
    $(this)
      .unbind()
      .bind("click", function () {
        $(".sideTool > div.btn_replay").show();
        //
        var targetDes = elem.find(".des");
        var price = parseInt($(this).attr("price"));
        if (targetDes.find(".price > span:not(.selected)").length > 0) {
          //還可以選購買物
          $(this).addClass("selected");
          targetDes
            .find(".price > span:not(.selected)")
            .eq(0)
            .addClass("selected")
            .text(price);
          targetDes
            .find(".prices > span")
            .text(price + parseInt(targetDes.find(".prices > span").text()));
          rootSoundEffect($pop);
        } else {
          rootSoundEffect($wrong);
        }
        //show money area?
        if (targetDes.find(".price > span:not(.selected)").length == 0) {
          elem.find(".moneyArea").addClass("selected");
        }
      });
  });
  elem.find(".moneyArea > .money").each(function () {
    $(this)
      .empty()
      .unbind()
      .bind("click", function () {
        $(".sideTool > div.btn_check").show();
        //
        var max = parseInt($(this).attr("max"));
        var money = $(this).attr("money");
        if ($(this).children().length < max) {
          $(this).append(`<img src="${money}" />`);
          rootSoundEffect($key);
        } else {
          $(this).empty();
          rootSoundEffect($show);
        }
      });
  });
  //func2
  var backpacks = elem.find(".backpack");
  backpacks.removeClass("full").eq(0).addClass("selected");

  elem.find(".itemArea > .item").each(function () {
    $(this)
      .unbind()
      .bind("click", function () {
        $(".sideTool > div.btn_replay").show();

        //
        var targetBackpack = elem.find(".backpack.selected");
        var diamond = parseInt($(this).attr("diamond"));
        var long = parseInt($(this).attr("long"));
        if (
          targetBackpack.length > 0 &&
          targetBackpack.find(".grids > span:not(.selected)").length >= long
        ) {
          //有足夠欄位放鑽石
          $(this).addClass("selected");
          targetBackpack
            .find(".grids > span:not(.selected)")
            .eq(0)
            .append($(this).find("img").clone());
          var startIndex = targetBackpack
            .find(".grids > span:not(.selected)")
            .index();
          for (var i = 0; i < long; i++) {
            targetBackpack
              .find(".grids > span")
              .eq(startIndex + i)
              .addClass("selected");
            //確認是否滿了
            if (
              startIndex + i ==
              targetBackpack.find(".grids > span").length - 1
            ) {
              targetBackpack.addClass("full");
            }
          }
          targetBackpack
            .find(".sum")
            .text(diamond + parseInt(targetBackpack.find(".sum").text()));
          rootSoundEffect($pop);
          targetBackpack.removeClass("selected");
          //下一個背包
          if (elem.find(".backpack:not(.full)").length > 0) {
            for (var i = 0; i < elem.find(".backpack").length; i++) {
              targetBackpack =
                targetBackpack.next().length > 0
                  ? targetBackpack.next()
                  : elem.find(".backpack").eq(0);

              if (
                targetBackpack.find(".grids > span:not(.selected)").length > 0
              ) {
                //找到就跳出迴圈
                targetBackpack.addClass("selected");
                return false;
              }
            }
          } else {
            //全滿
          }
        } else {
          rootSoundEffect($wrong);
        }
      });
  });

  backpacks.each(function () {
    $(this).find(".grids > span").removeClass("done").empty();
    $(this).find(".sum").text("0");
  });
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
