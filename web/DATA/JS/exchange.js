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

      //residents
      $("#module_wrapper .residents > div").each(function () {
        $(this)
          .unbind()
          .bind("click", function () {
            walkOnRoute($(this));
          });
      });
      //carry
      $("#module_wrapper .carry .items > span").each(function () {
        $(this)
          .unbind()
          .bind("click", function () {
            pickIntItem($(this));
          });
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
    //秀出答案圖片
    var selectedElem = $(".contents > div.selected");
    var ansArray = selectedElem.find(".residents").attr("ans").split(",");
    var routes = selectedElem.find(".routes");
    var residents = selectedElem.find(".residents");
    resetElem(selectedElem);
    selectedElem.find(".sequence > span").empty();
    $(".sideTool > div.btn_answer").addClass("active");
    currentJoint = selectedElem.find(".residents >.start").attr("sid");
    ////開始產生答案
    selectedElem
      .find(".carry")
      .addClass("done")
      .find(".selected")
      .removeClass("selected");
    for (var i = 0; i < ansArray.length; i++) {
      residents.find("> div[sid='" + ansArray[i] + "']").addClass("done");
      //交換順序
      updateSequence(
        residents.find("> div[sid='" + ansArray[i] + "']").find(".need > img")
      );
      //路線
      var startID = currentJoint;
      var endID = ansArray[i];
      routes.find("> div").each(function () {
        var start = $(this).attr("start");
        var end = $(this).attr("end");
        if (
          (start == startID && end == endID) ||
          (start == endID && end == startID)
        ) {
          //找到路
          if (start == endID && end == startID) {
            $(this).addClass("reverse").find(">span").addClass("active");
          } else {
            $(this).removeClass("reverse").find(">span").addClass("active");
          }
          currentJoint = endID;
        }
      });
    }

    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};
var lowlaged = false;
var currentJoint = null;
var animationID;

var pickIntItem = function (item) {
  item.addClass("selected").siblings(".selected").removeClass("selected");
  $(".contents > div.selected").find(".carry").addClass("done");
  //update sequence
  updateSequence(item.find("img"));
  //effect
  rootSoundEffect($pop);
  var uniq = new Date().getTime();
  item.append(
    `<span class="smoke"><img src="./DATA/IMAGES/common/smoke2.gif?uniq=${uniq}"/>`
  );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(this).dequeue().remove();
    });
  //start walking
  $(".contents > div.selected").find(".shipper").addClass("walking");
  //
  $(".sideTool > div.btn_replay").show();
};

var updateSequence = function (item) {
  $(".contents > div.selected")
    .find(".sequence")
    .find(">span")
    .each(function () {
      if ($(this).find("img").length == 0) {
        $(this).append(item.clone());
        return false;
      }
    });
};

var walkOnRoute = function (joint) {
  if (
    $(".contents > div.selected .carry > .items > span.selected").length > 0
  ) {
    var startID = currentJoint;
    var endID = joint.attr("sid");
    $(".contents > div.selected .routes")
      .find("> div")
      .each(function () {
        var start = $(this).attr("start");
        var end = $(this).attr("end");
        if (
          (start == startID && end == endID) ||
          (start == endID && end == startID)
        ) {
          //找到路
          if (start == endID && end == startID) {
            $(this).addClass("reverse");
            moviShipper($(this), true);
          } else {
            $(this).removeClass("reverse");
            moviShipper($(this), false);
          }
          currentJoint = endID;
        }
      });
  } else {
    console.log("先選要攜帶的物品");
    rootSoundEffect($stupid);
    $(".contents > div.selected .carry")
      .addClass("wow bounceIn")
      .delay(1000)
      .queue(function () {
        $(this).removeClass("wow bounceIn").dequeue();
      });
  }
};

var moveLag = 400;
var moviShipper = function (route, reverse) {
  if (route.find(">span").length != route.find(">span.active").length) {
    //有得走

    var shipper = $(".contents > div.selected .shipper");
    var arrows = route.find(">span");
    if (reverse) {
      arrows = $(arrows.get().reverse());
    }
    for (var i = 0; i < arrows.length; i++) {
      if (!arrows.eq(i).hasClass("active")) {
        var arrow = arrows.eq(i);
        arrow.addClass("active");
        shipper.get(0).style.top = arrow.get(0).style.top;
        shipper.get(0).style.left = arrow.get(0).style.left;

        if (!route.hasClass("reverse")) {
          if (arrow.attr("reverse") == "") {
            shipper.addClass("reverse");
          } else {
            shipper.removeClass("reverse");
          }
        } else {
          if (arrow.attr("reverse") == "") {
            shipper.removeClass("reverse");
          } else {
            shipper.addClass("reverse");
          }
        }
        break;
      }
    }
    rootSoundEffect($show);
    //下一步
    animationID = setTimeout(function () {
      moviShipper(route, reverse);
    }, moveLag);
  } else {
    //完成步數
    var currentCarryItem = $(
      ".contents > div.selected .carry > .items > span.selected"
    )
      .find("img")
      .attr("src");
    var joint = $(
      ".contents > div.selected .residents > div[sid='" + currentJoint + "']"
    );
    var need = joint.find(".need").find("img").attr("src");
    var own = joint.find(".own").find("img").attr("src");

    if (currentCarryItem == need) {
      //達成所需
      $(".contents > div.selected .carry > .items > span.selected").removeClass(
        "selected"
      );
      $(".addup").remove();

      //紀錄交換到的物品
      joint.find(".man").addClass("wow rubberBand");
      if (own) {
        $(".contents > div.selected .carry > .items").append(
          `<span class="selected addup"><img class="wow bounceInDown" src="${own}"/></span>`
        );
        updateSequence($(".addup").find("img"));
        joint.addClass("done happy");
        rootSoundEffect($right);
        //effect
        var uniq = new Date().getTime();
        $(".contents > div.selected .carry > .items > span.addup").append(
          `<span class="smoke"><img src="./DATA/IMAGES/common/smoke2.gif?uniq=${uniq}"/>`
        );
        $(".smoke")
          .delay(1500)
          .queue(function () {
            $(this).dequeue().remove();
          });
      } else {
        //沒東西了只好停止, 並判斷結果
        joint.addClass("done love");
        $(".contents > div.selected .shipper").removeClass("walking");
        //
        $(".contents > div.selected .residents > div:not('.done')").addClass(
          "done angry"
        );

        //effect
        if ($(".contents > div.selected .residents > .angry").length == 0) {
          rootSoundEffect($chimes);
          var uniq = new Date().getTime();
          $(".contents > div.selected .carry > .items").append(
            `<span class="selected addup"></span>`
          );
          $(".contents > div.selected .carry > .items > span.addup").append(
            `<span class="smoke"><img src="./DATA/IMAGES/common/smoke2.gif?uniq=${uniq}"/>`
          );
          $(".contents > div.selected .map").append(
            `<span class="resultIcon wow bounceInUp"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
          );
          $(".resultIcon")
            .delay(1800)
            .queue(function () {
              $(".smoke").remove();
              $(this).dequeue().remove();
            });
          $(".contents > div.selected .shipper").addClass("win");
        } else {
          rootSoundEffect($tryagain);
          $(".contents > div.selected .map").append(
            `<span class="resultIcon wow bounceInUp"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
          );
          $(".resultIcon")
            .delay(1800)
            .queue(function () {
              $(this).dequeue().remove();
            });
          $(".contents > div.selected .shipper").addClass("lose");
        }
      }
      //
    } else {
      //交換失敗
      joint.addClass("done angry");
      joint.find(".man").addClass("wow swing");
      console.log("-");
      console.log(joint);

      //判斷結束沒
      if (!joint.find(".own").find("img").attr("src")) {
        rootSoundEffect($tryagain);
        $(".contents > div.selected .map").append(
          `<span class="resultIcon wow bounceInUp"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span>`
        );
        $(".resultIcon")
          .delay(1800)
          .queue(function () {
            $(this).dequeue().remove();
          });
        $(".contents > div.selected .shipper").addClass("lose");
        //還沒做到的臭臉
        $(".contents > div.selected .residents > div:not('.done')")
          .addClass("done angry")
          .find(".man")
          .addClass("wow swing");
        $(".contents > div.selected .shipper").removeClass("walking");
      } else {
        rootSoundEffect($fail);
      }
    }
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
  clearTimeout(animationID);
  //
  elem
    .find("*")
    .removeClass("done selected active happy angry love swing rubberBand");

  elem.find(".wow.animated").removeAttr("style").removeClass("wow animated");

  //移動送貨員到起始點
  currentJoint = elem.find(".residents >.start").attr("sid");
  elem.find(".residents >.start").addClass("done");
  elem
    .find(".shipper")
    .removeClass("walking reverse win lose")
    .addClass(elem.find(".shipper").attr("intX"))
    .attr("style", elem.find(".residents >.start").attr("style"));

  //
  $(".addup").remove();
  $(".smoke").remove();
  $(".resultIcon").remove();
  //清除交換順序
  elem.find(".sequence > span").empty();

  //判斷是否需要選擇預設攜帶物品
  if (elem.find(".carry .items > span").length <= 1) {
    elem.find(".carry .items > span").click();
  }
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
