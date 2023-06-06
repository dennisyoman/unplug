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

var getUpperFish = function (startFish) {
  var otherFishes = $(".contents > div.selected").find(
    ".fishArea > .fish:not(.selected)"
  );
  var upperFish = null;
  otherFishes.each(function () {
    var pY = $(this).css("top");
    //找到第二下方的魚
    if (parseInt(pY) < parseInt(startFish.css("top"))) {
      if (upperFish == null) {
        upperFish = $(this);
      } else {
        if (parseInt($(this).css("top")) > parseInt(upperFish.css("top"))) {
          upperFish = $(this);
        }
      }
    }
  });
  if (
    upperFish == null ||
    parseInt(upperFish.find("span").text()) >
      parseInt(startFish.find("span").text())
  ) {
    //上方的魚比較小，停在這裡或是換一隻魚
    var uniq = new Date().getTime();
    rootSoundEffect($chimes);
    startFish.append(
      `<div class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></div>`
    );
    $(".smoke")
      .delay(1500)
      .queue(function () {
        $(this).dequeue().remove();
      });
  } else {
    upperFish.addClass("selected");
  }
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
  elem.find(".resultIcon").remove();
  elem.find(".smoke").remove();

  //fish

  if (elem.find(".fishArea").attr("random")) {
    var randomID = elem.find(".fishArea").attr("random").split(",");
    var groupSize = elem.find(".fishArea").attr("size");

    if (randomID.length > 0) {
      shuffle(randomID);
    }
  }

  var fishes = elem.find(".fishArea > .fish");
  var startFish = null;
  fishes.each(function () {
    //建立隨機的魚
    if ($(this).hasClass("random")) {
      var fishID = randomID[0];
      randomID.shift();
      var size = groupSize;
      $(this).attr(
        "style",
        "width: " + fishID * size + "px; height: " + fishID * size + "px"
      );
      $(this)
        .find("img")
        .attr("src", "./DATA/PT/BOOK11/IMAGES/fish" + fishID + ".png");
      $(this).find("span").text(fishID);
    }

    //移動到預設位子
    var intY = $(this).attr("intY");
    var intX = $(this).attr("intX");
    $(this)
      .removeClass("selected start")
      .css("top", intY + "px")
      .css("left", intX + "px");

    //找到最下方的魚
    if (startFish == null) {
      startFish = $(this);
    } else {
      if (parseInt($(this).attr("intY")) > parseInt(startFish.attr("intY"))) {
        startFish = $(this);
      }
    }
    //點魚
    $(this)
      .unbind()
      .bind("click", function () {
        var fish1 = $(this);
        var fish2 = $(this).siblings(".selected");
        if (fish2.length > 0) {
          //上面有魚
          var XY1 = [fish1.css("top"), fish1.css("left")];
          var XY2 = [fish2.css("top"), fish2.css("left")];
          fish1.css("top", XY2[0]).css("left", XY2[1]);
          fish2.css("top", XY1[0]).css("left", XY1[1]);
          //
          if (fish1.hasClass("start")) {
            fish1.removeClass("selected");
            fish2.removeClass("selected");
            fish1.delay(800).queue(function () {
              getUpperFish(fish1);
              fish1.addClass("selected").dequeue();
            });
          }
          if (fish2.hasClass("start")) {
            fish1.removeClass("selected");
            fish2.removeClass("selected");
            fish2.delay(800).queue(function () {
              getUpperFish(fish2);
              fish2.addClass("selected").dequeue();
            });
          }
          rootSoundEffect($show);
        } else {
          //上面沒有魚
          rootSoundEffect($wrong);
        }
      });
  });
  //
  startFish.addClass("start");
  startFish.delay(800).queue(function () {
    getUpperFish(startFish);
    startFish.addClass("selected").dequeue();
  });

  //sort
  var nums = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24,
  ];
  shuffle(nums);

  var sorters = elem.find(".sortArea > .sorter");
  sorters
    .removeClass("reverse")
    .unbind()
    .bind("click", function () {
      $(this).toggleClass("reverse");
      elem.find(".pieceArea > .piece").removeClass("wrong");
      rootSoundEffect($key);
    });
  //piece
  elem.find(".pieceArea").removeAttr("anchor");
  var pieces = elem.find(".pieceArea > .piece");
  pieces.each(function () {
    $(this)
      .text(nums[$(this).index()])
      .css("top", 0)
      .css("left", 0)
      .removeClass("wrong");
    $(this)
      .unbind()
      .bind("click", function () {
        var seqID = $(this).attr("seq");
        var anchorID = $(this).parent().attr("anchor");

        var targetSorter = elem.find(
          ".sortArea > .sorter[anchor=" + anchorID + "]"
        );
        for (var k = 0; k < targetSorter.length; k++) {
          var compareSeq = targetSorter.eq(k).attr("compareSeq");
          if (compareSeq.indexOf(seqID) != -1) {
            var seqArr = compareSeq.split(",");

            var XY1 = [
              elem
                .find(".pieceArea > .piece[seq=" + seqArr[0] + "]")
                .css("top"),
              elem
                .find(".pieceArea > .piece[seq=" + seqArr[0] + "]")
                .css("left"),
            ];
            var XY2 = [
              elem
                .find(".pieceArea > .piece[seq=" + seqArr[1] + "]")
                .css("top"),
              elem
                .find(".pieceArea > .piece[seq=" + seqArr[1] + "]")
                .css("left"),
            ];

            elem
              .find(".pieceArea > .piece[seq=" + seqArr[0] + "]")
              .attr("seq", "temp")
              .css("top", XY2[0])
              .css("left", XY2[1])
              .removeClass("wrong");
            elem
              .find(".pieceArea > .piece[seq=" + seqArr[1] + "]")
              .attr("seq", seqArr[0])
              .css("top", XY1[0])
              .css("left", XY1[1])
              .removeClass("wrong");
            elem.find(".pieceArea > .piece[seq=temp]").attr("seq", seqArr[1]);
            rootSoundEffect($show);
          }
        }
      });
  });
  //anchors
  var anchors = elem.find(".anchorArea > .anchor");
  anchors
    .unbind()
    .bind("click", function () {
      var anchor = $(this).find(">span");
      var anchorID = elem.find(".pieceArea").attr("anchor");
      if (
        $(this).attr("anchor") != anchorID &&
        $(this).prev().attr("anchor") == anchorID
      ) {
        //檢查排序是否正確
        var noError = true;
        var targetSorter = elem.find(
          ".sortArea > .sorter[anchor=" + anchorID + "]"
        );
        for (var k = 0; k < targetSorter.length; k++) {
          var compareSeq = targetSorter.eq(k).attr("compareSeq");
          var seqArr = compareSeq.split(",");
          var P1 = elem.find(".pieceArea > .piece[seq=" + seqArr[0] + "]");
          var P2 = elem.find(".pieceArea > .piece[seq=" + seqArr[1] + "]");
          if (!targetSorter.eq(k).hasClass("reverse")) {
            //小 --> 大
            if (parseInt(P1.text()) > parseInt(P2.text())) {
              noError = false;
              P1.addClass("wrong");
              P2.addClass("wrong");
            }
          } else {
            //大 --> 小
            if (parseInt(P1.text()) < parseInt(P2.text())) {
              noError = false;
              P1.addClass("wrong");
              P2.addClass("wrong");
            }
          }
        }

        if (noError) {
          //正確後移動
          for (var i = 0; i < anchor.length; i++) {
            var target = anchor.eq(i);
            var seq = target.attr("seq");
            var px =
              parseInt(target.css("left")) +
              parseInt(target.parent().css("left"));
            var py =
              parseInt(target.css("top")) +
              parseInt(target.parent().css("top"));

            elem
              .find(".pieceArea > .piece[seq=" + seq + "]")
              .css("left", px + "px")
              .css("top", py + "px");
          }
          elem.find(".pieceArea").attr("anchor", $(this).attr("anchor"));
          rootSoundEffect($show);
        } else {
          //排序有錯誤
          rootSoundEffect($wrong);
        }
      }
    })
    .eq(0)
    .click();
  //
  $(".sideTool > div.btn_replay").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
