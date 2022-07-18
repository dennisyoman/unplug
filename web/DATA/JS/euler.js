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
      //joints
      $("#module_wrapper .joints").each(function () {
        var w = $(this).attr("w");
        var h = $(this).attr("h");
        $(this)
          .find(">span")
          .css("width", w + "px")
          .css("height", h + "px");
        $(this)
          .find(">span")
          .unbind()
          .bind("click", function () {
            makeMove($(this));
          });
      });

      //items
      $("#module_wrapper .items").each(function () {
        var scale = $(this).attr("scale");
        $(this)
          .find(">span > img")
          .css("transform", "scale(" + scale + ")");
      });

      //init

      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          $(".tabs > span").eq(0).click();
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

var makeMove = function (tar) {
  var gotItem = false;
  var selectedElem = $(".contents > div.selected");
  var routes = selectedElem.find(".routes > span");
  var joints = selectedElem.find(".joints > span");
  var items = selectedElem.find(".items > span");
  joints.removeClass("active");
  var start;
  var end;
  if (currentJoint != null) {
    //做路
    start = currentJoint.attr("jid");
    end = tar.attr("jid");
    routes.each(function () {
      var total = routes.length;
      if (start == $(this).attr("start") && end == $(this).attr("end")) {
        //順向
        $(this).addClass("done");
        $(this).css(
          "opacity",
          0.2 +
            0.8 *
              (selectedElem.find(".routes").find(">span[class*=done]").length /
                total)
        );
      } else if (end == $(this).attr("start") && start == $(this).attr("end")) {
        //逆向
        $(this).addClass("done reverse");
        $(this).css(
          "opacity",
          0.2 +
            0.8 *
              (selectedElem.find(".routes").find(">span[class*=done]").length /
                total)
        );
      }
    });

    //紀錄交接點
    var tempJoins = currentJoint.attr("join").split(",");
    if (tempJoins[0] != "") {
      tempJoins.push(end);
    } else {
      tempJoins = [end];
    }
    currentJoint.attr("join", tempJoins.join(","));
    //
    tempJoins = tar.attr("join").split(",");
    if (tempJoins[0] != "") {
      tempJoins.push(start);
    } else {
      tempJoins = [start];
    }
    tar.attr("join", tempJoins.join(","));

    //獲取物品
    items.each(function () {
      var dots = $(this).attr("joints").split(",");
      if (
        (dots[0] == start || dots[0] == end) &&
        (dots[1] == start || dots[1] == end)
      ) {
        $(this).addClass("done");
        gotItem = true;
      }
    });
  }
  //指定目前點位
  currentJoint = tar;
  //是否是原點
  if (
    selectedElem.find(".setstart").length < 1 &&
    selectedElem.find(".start").length < 1
  ) {
    currentJoint.addClass("setstart");
  }

  //開啟下個點位

  var neighbor = currentJoint.attr("neighbor").split(",");
  var join = currentJoint.attr("join");
  if (join != "") {
    join = join.split(",");
    for (var i = 0; i < join.length; i++) {
      neighbor.splice($.inArray(join[i], neighbor), 1);
    }
  }
  for (var i = 0; i < neighbor.length; i++) {
    for (var k = 0; k < joints.length; k++) {
      if (joints.eq(k).hasClass(neighbor[i])) {
        var nn = joints.eq(k).attr("neighbor").split(",");
        var jj = joints.eq(k).attr("join");
        if (jj != "") {
          jj = jj.split(",");
          for (var m = 0; m < jj.length; m++) {
            nn.splice($.inArray(jj[m], nn), 1);
          }
        }
        if (nn[0] != "") {
          joints.eq(k).addClass("active");
        }
      }
    }
  }

  ////check result
  if (
    selectedElem.find(".routes > span").length ==
    selectedElem.find(".routes > span.done").length
  ) {
    if (
      selectedElem.find(".joints > span.end").length > 0 &&
      !currentJoint.hasClass("end")
    ) {
      //沒完成
      rootSoundEffect($fail);
      var uniq = new Date().getTime();
      selectedElem
        .find(".map")
        .append(
          `<span class="resultIcon wow bounceInUp"><img src="./DATA/IMAGES/common/icon_stupid.png"/></span></span>`
        );
      $(".resultIcon")
        .delay(1800)
        .queue(function () {
          $(this).dequeue().remove();
        });
    } else {
      //完成
      rootSoundEffect($chimes);
      var uniq = new Date().getTime();
      selectedElem
        .find(".map")
        .append(
          `<span class="resultIcon wow bounceInUp"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes.gif?uniq=${uniq}"/></span>`
        );
      $(".resultIcon")
        .delay(1800)
        .queue(function () {
          $(".smoke").remove();
          $(this).dequeue().remove();
        });
    }
  } else {
    if (selectedElem.find(".joints > span.active").length > 0) {
      //可以繼續
      if (gotItem) {
        rootSoundEffect($good);
      } else {
        rootSoundEffect($key);
      }
    } else {
      //死路沒完成
      rootSoundEffect($tryagain);
      var uniq = new Date().getTime();
      selectedElem
        .find(".map")
        .append(
          `<span class="resultIcon wow bounceInUp"><img src="./DATA/IMAGES/common/icon_wrong.png"/></span></span>`
        );
      $(".resultIcon")
        .delay(1800)
        .queue(function () {
          $(this).dequeue().remove();
        });
    }
  }

  //秀出重來按鈕
  $(".sideTool > div.btn_replay").show();
};

var showAnswer = function (boolean) {
  if (boolean) {
    //秀出答案圖片
    var selectedElem = $(".contents > div.selected");
    var routes = selectedElem.find(".routes > span");
    var joints = selectedElem.find(".joints > span");
    var items = selectedElem.find(".items > span");
    joints.addClass("done");
    routes.each(function () {
      $(this).removeClass("active reverse").addClass("done");
      $(this).addClass($(this).attr("ref"));
    });
    items.addClass("done");

    rootSoundEffect($help);
  } else {
    $(".sideTool > div.btn_replay").click();
  }
};
var lowlaged = false;
var currentJoint = null;

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
  elem.find(".done").removeClass("done");
  elem.find(".reverse").removeClass("reverse");
  elem.find(".active").removeClass("active");
  elem.find(".setstart").removeClass("setstart");
  elem.find(".joints >span").attr("join", "");
  currentJoint = null;
  //無指定起始點
  if (elem.find(".joints >span.start").length < 1) {
    elem.find(".joints >span").addClass("active");
  } else {
    elem.find(".joints >span.start").addClass("active");
  }
  //
  $(".sideTool > div.btn_answer").show();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
