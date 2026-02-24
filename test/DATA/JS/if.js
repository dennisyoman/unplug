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
var isMoving = false;

var bingo = function () {
  rootSoundEffect($correct);
  var uniq = new Date().getTime();
  $(".contents > div.selected")
    .find(".subject")
    .append(
      `<span class="resultIcon wow bounceIn"><img src="./DATA/IMAGES/common/icon_right.png"/></span><span class="smoke"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></span>`,
    );
  $(".smoke")
    .delay(1500)
    .queue(function () {
      $(".resultIcon").remove();
      $(this).dequeue().remove();
    });
};

var randomIfCard = function () {
  var card = $(".contents > div.selected .ifcard").find(">span");
  card.removeClass();
  var pair = card.attr("pair").split(",");
  var type = card.attr("type").split(",");
  var direction = card.attr("direction").split(",");
  var step = card.attr("step").split(",");
  var classname = "wow bounceIn ";
  classname += pair[Math.floor(Math.random() * pair.length)] + " ";
  classname += direction[Math.floor(Math.random() * direction.length)] + " ";
  classname += step[Math.floor(Math.random() * step.length)] + " ";
  classname += type[Math.floor(Math.random() * type.length)] + " ";

  card
    .addClass(classname)
    .delay(10)
    .queue(function () {
      rootSoundEffect($show);
      $(this).addClass("active").dequeue();
    });
};

var randomMyCard = function (type) {
  var card = $(".contents > div.selected .mycard").find(">span");
  card.removeClass();
  var color = card.attr("color").split(",");
  var shape = card.attr("shape").split(",");
  var number = card.attr("number").split(",");
  var rnd_color = card.attr("rnd_color") ? card.attr("rnd_color") : 0;
  var rnd_shape = card.attr("rnd_shape") ? card.attr("rnd_shape") : 0;
  var rnd_number = card.attr("rnd_number") ? card.attr("rnd_number") : 0;

  if (type == "color") {
    rnd_color =
      parseInt(rnd_color) == color.length - 1 ? 0 : parseInt(rnd_color) + 1;
  } else if (type == "shape") {
    rnd_shape =
      parseInt(rnd_shape) == shape.length - 1 ? 0 : parseInt(rnd_shape) + 1;
  } else if (type == "number") {
    rnd_number =
      parseInt(rnd_number) == number.length - 1 ? 0 : parseInt(rnd_number) + 1;
  } else {
    rnd_color = Math.floor(Math.random() * color.length);
    rnd_shape = Math.floor(Math.random() * shape.length);
    rnd_number = Math.floor(Math.random() * number.length);
  }
  card.attr("rnd_color", rnd_color);
  card.attr("rnd_shape", rnd_shape);
  card.attr("rnd_number", rnd_number);
  //
  var classname = "wow bounceIn ";
  classname += color[rnd_color] + " ";
  classname += shape[rnd_shape] + " ";
  classname += number[rnd_number] + " ";

  card
    .addClass(classname)
    .delay(10)
    .queue(function () {
      rootSoundEffect($show);
      $(this).addClass("active").dequeue();
    });
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
  elem.find(".selected").removeClass("selected");
  //reset piece
  if (elem.find(".piece").length > 0) {
    elem.find(".piece").each(function () {
      $(this)
        .attr("location", "")
        .unbind()
        .bind("click", function () {
          $(this)
            .addClass("selected")
            .siblings(".piece.selected")
            .removeClass("selected");
          rootSoundEffect($pop);
          //切換所屬感應區
          if ($(this).attr("sa")) {
            elem.find(".sensorArea").hide();
            elem.find("#" + $(this).attr("sa")).show();
          }
          if ($(this).attr("ha")) {
            elem.find(".hintArea").hide();
            elem.find("#" + $(this).attr("ha")).show();
          }
        });
    });
    //reset cards
    $(".contents > div.selected .ifcard").find(">span").removeClass("active");
    $(".contents > div.selected .mycard").find(">span").removeClass("active");
  }

  //reset sensorArea
  if (elem.find(".sensorArea").length > 0) {
    elem.find(".sensorArea .sensor").each(function () {
      if ($(this).hasClass("withPath") || $(this).hasClass("withArrow")) {
        $(this).empty();
      }
      $(this)
        .unbind()
        .bind("click", function () {
          if (isMoving) {
            return false;
          }

          var piece = elem.find(".piece.selected");
          var SA = piece.attr("sa")
            ? elem.find("#" + piece.attr("sa"))
            : elem.find(".sensorArea");
          var HA = piece.attr("ha")
            ? elem.find("#" + piece.attr("ha"))
            : elem.find(".hintArea");
          //來源物件
          var fromElem = SA.find(
            ".sensor[name='" + piece.attr("location") + "']",
          );
          //
          if (piece.length > 0) {
            var neighbor = SA.find(
              ".sensor[name='" + piece.attr("location") + "']",
            ).attr("neighbor");
            var neighbors = neighbor ? neighbor.split(",") : new Array();
            var myname = $(this).attr("name");

            //先判斷是否要自動移動到下一個點
            var automove = $(this).attr("automove");
            if (automove) {
              isMoving = true;
              if (myname != piece.attr("location")) {
                piece.removeClass("end");

                //
                SA.find(".sensor[name='" + automove + "']")
                  .delay(600)
                  .queue(function () {
                    //是否要加上箭頭
                    if ($(this).hasClass("withArrow")) {
                      addArrow(
                        SA.find(
                          ".sensor[name='" + piece.attr("location") + "']",
                        ),
                        $(this),
                      );
                    }
                    //是否要加上箭頭
                    if ($(this).hasClass("withArrow")) {
                      addArrow(
                        SA.find(
                          ".sensor[name='" + piece.attr("location") + "']",
                        ),
                        $(this),
                      );
                    }
                    //是否要加上路徑
                    if ($(this).hasClass("withPath")) {
                      addPath(
                        SA.find(
                          ".sensor[name='" + piece.attr("location") + "']",
                        ),
                        $(this),
                      );
                    }
                    //
                    var pX = parseInt(SA.css("left"));
                    var pY = parseInt(SA.css("top"));
                    var oX = parseInt($(this).css("left"));
                    var oY = parseInt($(this).css("top"));
                    var ww = parseInt($(this).css("width")) / stageRatioReal;
                    var hh = parseInt($(this).css("height")) / stageRatioReal;
                    piece
                      .css("left", pX + oX + ww / 2)
                      .css("top", pY + oY + hh / 2);
                    rootSoundEffect($show);

                    piece.attr("location", $(this).attr("name"));
                    //自動爬到終點

                    if ($(this).hasClass("end")) {
                      piece.delay(500).queue(function () {
                        $(this).addClass("end").dequeue();
                      });
                      //
                      var uniq = new Date().getTime();
                      $(".contents > div.selected .piece.selected")
                        .append(
                          `<div class="resultIcon"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></div>`,
                        )
                        .delay(1500)
                        .queue(function () {
                          isMoving = false;
                          $(".resultIcon").remove();
                          $(this).dequeue();
                        });
                      rootSoundEffect($chimes);
                    } else {
                      isMoving = false;
                    }

                    $(this).dequeue();
                  });
              } else {
                //點自己走到鄰居
                var nei = $(this).attr("neighbor");
                if (nei && nei != "") {
                  piece.removeClass("end");
                  //
                  SA.find(".sensor[name='" + nei + "']")
                    .delay(10)
                    .queue(function () {
                      isMoving = false;
                      $(this).click().dequeue();
                    });
                }
              }
            }

            //是否是鄰近格子
            if (neighbors.indexOf(myname) >= 0 || $(this).hasClass("start")) {
              piece.removeClass("end");

              //
              //是否點在crossroads上
              if (
                SA.find(
                  ".sensor[name='" + piece.attr("location") + "']",
                ).hasClass("crossroads") &&
                $(this).attr("allow")
              ) {
                var allowArr = $(this).attr("allow").split(",");
                var currentDice = elem.find(".diceresult").text();
                console.log(allowArr, currentDice);
                if (allowArr.indexOf(currentDice) < 0) {
                  rootSoundEffect($stupid);
                  isMoving = false;

                  //不能走這邊
                  return false;
                }
              }
              var pX = parseInt(SA.css("left"));
              var pY = parseInt(SA.css("top"));
              var oX = parseInt($(this).css("left"));
              var oY = parseInt($(this).css("top"));
              var ww = parseInt($(this).css("width")) / stageRatioReal;
              var hh = parseInt($(this).css("height")) / stageRatioReal;
              //console.log(oX, oY, ww, hh);
              piece.css("left", pX + oX + ww / 2).css("top", pY + oY + hh / 2);
              rootSoundEffect($show);

              piece.attr("location", $(this).attr("name"));

              //是否要加上箭頭
              if ($(this).hasClass("withArrow")) {
                addArrow(fromElem, $(this));
              }
              //是否要加上路徑
              if ($(this).hasClass("withPath")) {
                addPath(fromElem, $(this));
              }

              //是否需要換軌道
              var switcher = $(this).attr("switcher");
              if (switcher) {
                var switcher_arr = switcher.split("^");
                for (var i = 0; i < switcher_arr.length; i++) {
                  var arr = switcher_arr[i].split(":");
                  SA.find(".sensor[name='" + arr[0] + "']").attr(
                    "allow",
                    arr[1],
                  );
                }
              }

              //elem是否有hintArea
              if (HA.length > 0) {
                HA.find(".hinter").removeClass("selected");
                if (!$(this).hasClass("start")) {
                  $(this).addClass("selected");
                }
                var hinterSeq = SA.find(".sensor.selected").length;
                if (hinterSeq > 0) {
                  HA.find(".hinter")
                    .eq(hinterSeq - 1)
                    .addClass("selected");
                }
              }
              if ($(this).hasClass("end")) {
                //手動到終點
                piece.delay(500).queue(function () {
                  $(this).addClass("end").dequeue();
                });
                var uniq = new Date().getTime();
                $(".contents > div.selected .piece.selected")
                  .append(
                    `<div class="resultIcon"><img src="./DATA/IMAGES/common/chimes2.gif?uniq=${uniq}"/></div>`,
                  )
                  .delay(1500)
                  .queue(function () {
                    isMoving = false;
                    $(".resultIcon").remove();

                    $(this).dequeue();
                  });
                rootSoundEffect($chimes);
              }
            } else {
              //非鄰近格子
              rootSoundEffect($wrong);
              if (automove) {
                SA.find(".sensor[name='" + automove + "']").clearQueue();
              }
              isMoving = false;
            }
          } else {
            isMoving = false;
            rootSoundEffect($stupid);
          }

          //
          $(".sideTool > div.btn_replay").show();
        });
    });
  }

  //移動旗子到起點
  if (elem.find(".piece").length > 0) {
    elem.find(".piece").each(function () {
      $(this).removeClass("end").addClass("selected");
      var SA = $(this).attr("sa")
        ? elem.find("#" + $(this).attr("sa"))
        : elem.find(".sensorArea");
      isMoving = false;
      SA.find(".sensor.start").click();
      $(this).removeClass("selected");
    });
    elem.find(".piece").eq(0).addClass("selected").click();
  }

  $(".smoke").remove();
  $(".resultIcon").remove();
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".sideTool > div.btn_check").hide();

  //show dice
  if (
    $("#widget .dice").length < 1 &&
    $(".contents > div.selected .diceresult").length > 0
  ) {
    appendDice("", 1);
  }
  $(".diceresult").html("?").show();
};

var addArrow = function (from, to) {
  //加上箭頭
  to.empty();
  var tempRotateAngle = from.css("rotate");
  from.css("rotate", "0deg");
  to.css("rotate", "0deg");
  var fy = parseInt(from.css("top"));
  var fx = parseInt(from.css("left"));
  var fw = parseInt(from.css("width")) / stageRatioReal;
  var fh = parseInt(from.css("height")) / stageRatioReal;
  var ty = parseInt(to.css("top"));
  var tx = parseInt(to.css("left"));
  var tw = parseInt(to.css("width")) / stageRatioReal;
  var th = parseInt(to.css("height")) / stageRatioReal;

  var len = Math.sqrt(
    (fy + fh / 2 - ty - th / 2) * (fy + fh / 2 - ty - th / 2) +
      (fx + fw / 2 - tx - tw / 2) * (fx + fw / 2 - tx - tw / 2),
  );

  var myPath = `<span style="height:${len}px;"></span>`;
  //
  var rotateAngle =
    Math.atan2(fy + fh / 2 - ty - th / 2, fx + fw / 2 - tx - tw / 2) *
      (180 / Math.PI) +
    90;
  from.css("rotate", tempRotateAngle);
  to.css("rotate", rotateAngle + "deg").append(myPath);
};

var addPath = function (from, to) {
  //加上箭頭
  to.empty();
  var tempRotateAngle = from.css("rotate");
  from.css("rotate", "0deg");
  to.css("rotate", "0deg");
  var fy = parseInt(from.css("top"));
  var fx = parseInt(from.css("left"));
  var fw = parseInt(from.css("width")) / stageRatioReal;
  var fh = parseInt(from.css("height")) / stageRatioReal;
  var ty = parseInt(to.css("top"));
  var tx = parseInt(to.css("left"));
  var tw = parseInt(to.css("width")) / stageRatioReal;
  var th = parseInt(to.css("height")) / stageRatioReal;

  var len = Math.sqrt(
    (fy + fh / 2 - ty - th / 2) * (fy + fh / 2 - ty - th / 2) +
      (fx + fw / 2 - tx - tw / 2) * (fx + fw / 2 - tx - tw / 2),
  );

  var myPath = `<span class="c2c" style="height:${len}px;"></span>`;
  //
  var rotateAngle =
    Math.atan2(fy + fh / 2 - ty - th / 2, fx + fw / 2 - tx - tw / 2) *
      (180 / Math.PI) +
    90;
  from.css("rotate", tempRotateAngle);
  to.css("rotate", rotateAngle + "deg").append(myPath);
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var afterDice = function (points) {
  $(".contents > div.selected .diceresult").html(points);
};
