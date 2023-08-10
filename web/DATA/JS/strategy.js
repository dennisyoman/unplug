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
          $(".sideTool > div.btn_check").hide();
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

var checkAnswer = function () {
  //best selection
  if ($(".contents > div.selected").find(".selectionArea").length > 0) {
    var option = $(".contents > div.selected").find(".selection > p > span");
    if (option.attr("ans") == option.text()) {
      //right
      rootSoundEffect($chimes);
      var uniq = new Date().getTime();
      $(".contents > div.selected").append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
      );
      $(".smoke")
        .delay(1500)
        .queue(function () {
          $(".resultIcon").remove();
          $(this).dequeue().remove();
        });
    } else {
      //wrong
      rootSoundEffect($wrong);
      $(".contents > div.selected").append(
        `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_stupid.png"/></span>`
      );
      $(".resultIcon")
        .delay(1000)
        .queue(function () {
          rootSoundEffect($tryagain);
          $(this).dequeue().remove();
        });
    }
  }
};

var foodsArr = [
  ["c1", ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8", "w9", "w10", "w11"]],
  ["c2", ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9"]],
  ["c3", ["q1", "q2", "q3", "q4", "q5", "q6"]],
  ["c4", ["m1", "m2", "m3"]],
  ["c5", ["f1", "f2", "f3", "f4", "f5", "f6", "f7"]],
  ["c6", ["o1", "o2", "o3", "o4"]],
];

var setSelection = function (options) {
  var tar = $(".contents > div.selected").find(".selection > p > span");
  var currAns = tar.text();
  var aid = options.indexOf(currAns);
  if (aid < 0) {
    aid = 0;
  } else {
    aid += 1;
    if (aid >= options.length) {
      aid = 0;
    }
  }
  tar.text(options[aid]);
  rootSoundEffect($key);
  //
  $(".sideTool > div.btn_check").show();
};

var resetElem = function (elem) {
  elem.find(".selected").removeClass("selected");
  elem.find(".done").removeClass("done");
  $(".alert").remove();

  //category
  if (elem.find(".categoryArea").length > 0) {
    var cat = elem.find(".category");
    cat.empty();

    for (var i = 0; i < foodsArr.length; i++) {
      cat.append(
        `<div class="wow fadeInDown ${foodsArr[i][0]}" data-wow-delay="${
          i * 0.1
        }s" data-wow-duration=".6s" counter="0"></div>`
      );
    }

    cat
      .find(">div")
      .unbind()
      .bind("click", function () {
        rootSoundEffect($click);
        $(this)
          .addClass("selected")
          .siblings(".selected")
          .removeClass("selected");
      });

    elem
      .find(".food-cards > div")
      .unbind()
      .bind("click", function () {
        var currCat = $(".contents > div.selected").find(
          ".category > div.selected"
        );
        if (!$(this).hasClass("done") && currCat.length > 0) {
          for (var i = 0; i < foodsArr.length; i++) {
            if (currCat.hasClass(foodsArr[i][0])) {
              var counter = parseInt(currCat.attr("counter"));
              counter += 1;
              if (counter >= foodsArr[i][1].length) {
                counter = 0;
              }
              currCat.attr("counter", counter);
              $(this)
                .empty()
                .addClass("done")
                .append(
                  `<img src="./DATA/PT/BOOK12/IMAGES/${foodsArr[i][1][counter]}.png" />`
                );
              rootSoundEffect($pop);
              //
              $(".sideTool > div.btn_replay").show();
            }
          }
        } else {
          rootSoundEffect($surprise);
        }
      });
  }

  //best selection
  if (elem.find(".selectionArea").length > 0) {
    elem
      .find(".selectionArea")
      .removeClass("step2")
      .find(".sensorArea")
      .find(">span")
      .unbind()
      .bind("click", function () {
        rootSoundEffect($key);
        $(this).addClass("selected");
        if ($(this).hasClass("shape1")) {
          $(this).removeClass("shape1").addClass("shape2");
        } else if ($(this).hasClass("shape2")) {
          $(this).removeClass("shape2").addClass("shape3");
        } else if ($(this).hasClass("shape3")) {
          $(this).removeClass("shape3").addClass("shape1");
        }

        //
        if ($(this).attr("cat")) {
          var catArr = $(this).attr("cat").split(",");

          for (var m = 0; m < catArr.length; m++) {
            elem
              .find(
                ".selectionArea .syncArea > span[class='" +
                  catArr[m] +
                  "']:not(.selected)"
              )
              .eq(0)
              .addClass("selected");
          }
        }

        //是否完成點擊

        if (
          elem.find(".selectionArea .sensorArea > span:not(.selected)")
            .length == 0
        ) {
          elem.find(".selectionArea").addClass("step2");
          rootSoundEffect($show);
        }
        //
        $(".sideTool > div.btn_replay").show();
      });
    //reset option
    $(".contents > div.selected").find(".selection > p > span").text("");
  }
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
