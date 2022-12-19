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
        });
    });
    //reset cards
    $(".contents > div.selected .ifcard").find(">span").removeClass("active");
    $(".contents > div.selected .mycard").find(">span").removeClass("active");
  }

  //reset sensorArea
  if (elem.find(".sensorArea").length > 0) {
    elem.find(".sensorArea .sensor").each(function () {
      $(this)
        .unbind()
        .bind("click", function () {
          console.log("click");
          var piece = elem.find(".piece.selected");
          //
          if (piece.length > 0) {
            var neighbor = elem
              .find(
                ".sensorArea .sensor[name='" + piece.attr("location") + "']"
              )
              .attr("neighbor");
            var neighbors = neighbor ? neighbor.split(",") : new Array();
            var myname = $(this).attr("name");

            //是否是鄰近格子
            if (neighbors.indexOf(myname) >= 0 || $(this).hasClass("start")) {
              //是否點在crossroads上
              if (
                elem
                  .find(
                    ".sensorArea .sensor[name='" + piece.attr("location") + "']"
                  )
                  .hasClass("crossroads") &&
                $(this).attr("allow")
              ) {
                var allowArr = $(this).attr("allow").split(",");
                var currentDice = elem.find(".diceresult").text();
                console.log(allowArr, currentDice);
                if (allowArr.indexOf(currentDice) < 0) {
                  rootSoundEffect($stupid);
                  //不能走這邊
                  return false;
                }
              }
              var pX = parseInt(elem.find(".sensorArea").css("left"));
              var pY = parseInt(elem.find(".sensorArea").css("top"));
              var oX = parseInt($(this).css("left"));
              var oY = parseInt($(this).css("top"));
              var ww = parseInt($(this).css("width")) / stageRatioReal;
              var hh = parseInt($(this).css("height")) / stageRatioReal;
              console.log(oX, oY, ww, hh);
              piece.css("left", pX + oX + ww / 2).css("top", pY + oY + hh / 2);
              rootSoundEffect($show);
              piece.attr("location", $(this).attr("name"));
              //換軌道
              var switcher = $(this).attr("switcher");
              if (switcher) {
                var switcher_arr = switcher.split("^");
                for (var i = 0; i < switcher_arr.length; i++) {
                  var arr = switcher_arr[i].split(":");
                  $(
                    ".contents > div.selected .sensorArea .sensor[name='" +
                      arr[0] +
                      "']"
                  ).attr("allow", arr[1]);
                }
              }
            } else {
              //非鄰近格子
              rootSoundEffect($wrong);
            }
          } else {
            rootSoundEffect($stupid);
          }

          //
          $(".sideTool > div.btn_replay").show();
        });
    });
  }

  //移動旗子到起點
  if (elem.find(".piece").length > 0) {
    elem.find(".piece").addClass("selected");
    elem.find(".sensorArea .sensor.start").click();
    elem.find(".piece").removeClass("selected");
    elem.find(".piece").eq(0).addClass("selected");
  }

  $(".smoke").remove();
  $(".resultIcon").remove();
  //
  $(".sideTool > div.btn_answer").removeClass("active").show();
  $(".sideTool > div.btn_check").hide();
  $(".diceresult").hide();
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};

var afterDice = function (points) {
  $(".diceresult").html(points).show();
};
