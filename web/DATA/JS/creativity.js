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
      $(".sideTool > div.btn_correctslider")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showAnswer(true);
          } else {
            showAnswer(false);
          }
        });

      $(".sideTool > div.btn_playorder")
        .unbind()
        .bind("click", function () {
          $(this).toggleClass("active");
          if ($(this).hasClass("active")) {
            showSlider(true);
          } else {
            showSlider(false);
          }
        });

      //grid4
      $(".grid4 > div")
        .unbind()
        .bind("click", function () {
          setSequence($(this));
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

var setSequence = function (tar) {
  rootSoundEffect($click);
  var gridElem = $(".contents > div.selected .grid4");
  var doneAmount = gridElem.find(">div.selected").length;
  if (tar.hasClass("selected")) {
    var targetSeq = parseInt(tar.attr("seq"));
    tar.removeClass().attr("seq", "");
    //
    gridElem.find(">div.selected").each(function () {
      var tempSeq = parseInt($(this).attr("seq"));
      if (tempSeq > targetSeq) {
        $(this).removeClass().addClass("selected");
        $(this).addClass("s" + (tempSeq - 1));
        $(this).attr("seq", tempSeq - 1);
      }
    });
  } else {
    tar.addClass("selected");
    tar.addClass("s" + (doneAmount + 1));
    tar.attr("seq", doneAmount + 1);
  }
  $(".sideTool > div.btn_correctslider").removeClass("active");
  checkOrderStatus();
};

var checkOrderStatus = function () {
  var gridElem = $(".contents > div.selected .grid4");

  //check status
  if (gridElem.find("> div").length == gridElem.find("> div.selected").length) {
    $(".sideTool > div.btn_playorder").show();
  } else {
    $(".sideTool > div.btn_playorder").hide();
  }
};

var showSlider = function (boolean) {
  var selectedElem = $(".contents > div.selected");
  if (boolean) {
    //create slider
    playSeq = 0;
    var sliderArr = [];
    selectedElem.find(".grid4 > div").each(function () {
      sliderArr[parseInt($(this).attr("seq"))] = $(this).clone();
    });
    for (var i = 1; i <= sliderArr.length; i++) {
      selectedElem.find(".gridSlider > .storyline").append(sliderArr[i]);
    }
    //
    selectedElem.find(".grid4").hide();
    selectedElem
      .find(".gridSlider")
      .addClass("active")
      .find(".storyline >div")
      .removeClass("selected prevSlider nextSlider")
      .eq(playSeq)
      .addClass("selected")
      .next()
      .addClass("nextSlider");
    selectedElem.find(".gridSlider > .prev").addClass("disable");
    selectedElem.find(".gridSlider > .next").removeClass("disable");
    $(".sideTool > div.btn_correctslider").hide();
    //
    if (selectedElem.find(".gridSlider > .storyline > div").length <= 1) {
      selectedElem.find(".gridSlider > .prev").hide();
      selectedElem.find(".gridSlider > .next").hide();
    } else {
      selectedElem.find(".gridSlider > .prev").show();
      selectedElem.find(".gridSlider > .next").show();
    }
  } else {
    selectedElem.find(".grid4").show();
    selectedElem
      .find(".gridSlider")
      .removeClass("active")
      .find(".storyline")
      .css("left", 0)
      .empty();
    $(".sideTool > div.btn_correctslider").show();
  }
};

var playSeq = 0;
var slideDistance = 350;

var switchSlider = function (direction) {
  var selectedElem = $(".contents > div.selected");
  var storyline = selectedElem.find(".storyline");
  playSeq = playSeq + direction;
  selectedElem.find(".btn").removeClass("disable");
  rootSoundEffect($show);
  //first
  if (playSeq <= 0) {
    playSeq = 0;
    selectedElem.find(".btn.prev").addClass("disable");
  }
  //last
  if (playSeq >= storyline.find(">div").length - 1) {
    playSeq = storyline.find(">div").length - 1;
    selectedElem.find(".btn.next").addClass("disable");
  }

  storyline
    .css("left", playSeq * slideDistance * -1 + "px")
    .find(">div")
    .removeClass("selected prevSlider nextSlider")
    .eq(playSeq)
    .addClass("selected");
  storyline
    .find(">div")
    .eq(playSeq - 1)
    .addClass("prevSlider");
  storyline
    .find(">div")
    .eq(playSeq + 1)
    .addClass("nextSlider");
};

var showAnswer = function (boolean) {
  var selectedElem = $(".contents > div.selected");
  resetElem(selectedElem);
  if (boolean) {
    selectedElem.find(".grid4 > div").each(function () {
      var tempAns = parseInt($(this).attr("ans"));
      $(this)
        .addClass("selected")
        .addClass("s" + tempAns);
      $(this).attr("seq", tempAns);
    });
    rootSoundEffect($help);
  }
  checkOrderStatus();
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
  //show side tool btn
  $(".sideTool > div.btn_correctslider").show();
};

var resetElem = function (elem) {
  elem
    .find(".gridSlider")
    .removeClass("active")
    .find(".storyline")
    .css("left", 0)
    .empty();
  elem.find(".grid4").show().find(">div").removeClass().attr("seq", "");
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active").hide();
};
