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

      //init
      //放上card-title欄位
      $("#module_wrapper .gridSlider").append(`<span class="card-title"/>`);

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

var showSlider = function (boolean) {
  var selectedElem = $(".contents > div.selected");
  if (boolean) {
    //create slider
    playSeq = 0;
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
    selectedElem
      .find(".gridSlider")
      .removeClass("active")
      .find(".storyline")
      .css("left", 0);
  }
};

var playSeq = 0;
var slideDistance = 220;
var slideDistanceLarge = 400;

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
    .css(
      "left",
      playSeq *
        (storyline.hasClass("lg") ? slideDistanceLarge : slideDistance) *
        -1 +
        "px"
    )
    .find(">div")
    .removeClass("selected prevSlider nextSlider")
    .eq(playSeq)
    .addClass("selected");

  selectedElem
    .find(".card-title")
    .text(storyline.find(">div.selected").attr("title"));

  selectedElem
    .find(".frames > div")
    .eq(playSeq)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
  selectedElem
    .find(".framesMulti > div")
    .eq(playSeq)
    .addClass("selected")
    .siblings(".selected")
    .removeClass("selected");
};

var trigBtn = function () {
  $(".sideTool > div.btn_playorder").click();
};
var showSlider = function (boolean) {
  var selectedElem = $(".contents > div.selected");
  if (boolean) {
    //create slider
    playSeq = 0;

    //
    selectedElem.find(".des").hide();
    selectedElem
      .find(".gridSlider")
      .addClass("active")
      .find(".storyline >div")
      .removeClass("cards selected prevSlider nextSlider")
      .eq(playSeq)
      .addClass("selected")
      .next()
      .addClass("nextSlider");

    selectedElem
      .find(".card-title")
      .text(
        selectedElem.find(".storyline").find(">div.selected").attr("title")
      );

    selectedElem.find(".gridSlider > .prev").addClass("disable");
    selectedElem.find(".gridSlider > .next").removeClass("disable");

    //
    if (selectedElem.find(".gridSlider > .storyline > div").length <= 1) {
      selectedElem.find(".gridSlider > .prev").hide();
      selectedElem.find(".gridSlider > .next").hide();
    } else {
      selectedElem.find(".gridSlider > .prev").show();
      selectedElem.find(".gridSlider > .next").show();
    }
  } else {
    selectedElem.find(".des").show();
    selectedElem
      .find(".gridSlider")
      .removeClass("active")
      .find(".storyline")
      .css("left", 0);
  }
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
  $(".sideTool > div.btn_playorder").show();
};

var resetElem = function (elem) {
  elem.find(".des").show();
  elem
    .find(".gridSlider")
    .removeClass("active")
    .find(".storyline")
    .css("left", 0);
};

var resetTool = function () {
  $(".sideTool > div").removeClass("active");
};
