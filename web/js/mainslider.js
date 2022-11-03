$(document).ready(function () {
  //載入完成要執行init
  $("#ms_wrapper")
    .unbind()
    .bind("compLoaded", function () {
      //init
      $(this)
        .addClass("loaded")
        .delay(500)
        .queue(function () {
          deactiveLoading();
          initSwiper();
        });
    });

  //assetsPreload img
  $("#ms_wrapper")
    .find("img")
    .each(function () {
      var src = $(this).attr("src");
      $("#ms_wrapper > .assetsPreload").append(`<img src="${src}" />`);
    });

  //check loading
  checkCompLoading("#ms_wrapper");
});

var coverSwiper;
var initSwiper = function () {
  coverSwiper = new Swiper(".swiper-cover", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    autoHeight: true,
    spaceBetween: 20,
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    navigation: {
      nextEl: ".slider .swiper-button-next",
      prevEl: ".slider .swiper-button-prev",
    },
  });
  if (bid != null) {
    createBooks();
  } else {
    createSeries();
  }
  coverSwiper.on("slideChange", function () {
    closeBook();
  });
};

var createSeries = function () {
  $(".swiper-cover .swiper-wrapper").empty();
  var sidSeq = 0;
  var slideArray = [];

  $(seriesXML)
    .find("series")
    .each(function (i) {
      var ssid = $(this).attr("sid");
      var thumb = $(this).attr("img");
      var tempElem = `<div class="swiper-slide" sid="${ssid}">
            <img onclick="openSeries('${ssid}')" src="./DATA/${ssid}/${thumb}"/>
        </div>`;

      slideArray.push(tempElem);
    });
  if ($(seriesXML).find("series").length <= 1) {
    sid = $(seriesXML).find("series").eq(0).attr("sid");
    createBooks();
  } else {
    coverSwiper.appendSlide(slideArray);
    //
    $(".swiper-cover .swiper-slide").each(function (index) {
      if ($(this).attr("sid") == sid) {
        sidSeq = index;
      }
    });
    coverSwiper.slideTo(sidSeq, 0);
  }
};

var createBooks = function () {
  $(".swiper-cover .swiper-wrapper").empty();
  var bookSeq = 0;
  var slideArray = [];
  $(seriesXML)
    .find("series")
    .each(function (i) {
      var ssid = $(this).attr("sid");
      if (ssid == sid) {
        $(this)
          .find("book")
          .each(function (k) {
            var bbid = $(this).attr("bid");
            var thumb = $(this).attr("img");
            var tempElem = `<div class="swiper-slide" bid="${bbid}">
                <img onclick="openBook('${bbid}')" src="./DATA/${ssid}/${thumb}"/>
            </div>`;

            slideArray.push(tempElem);
          });
      }
    });
  coverSwiper.appendSlide(slideArray);
  //
  $(".swiper-cover .swiper-slide").each(function (index) {
    if ($(this).attr("bid") == bid) {
      bookSeq = index;
    }
  });
  coverSwiper.slideTo(bookSeq, 0);
  //
  if (lid != null) {
    openBook(bid);
  } else {
    bid = null;
  }
  if ($(seriesXML).find("series").length > 1) {
    $("#return").show();
  }
};

var createLessons = function () {
  var LessonHTML = "";
  $(seriesXML)
    .find("series")
    .each(function (l) {
      var ssid = $(this).attr("sid");

      if (ssid == sid) {
        var seriesName = $(this).attr("name");
        LessonHTML += `<h1 class="wow fadeInRight">${seriesName}</h1>`;
        $(this)
          .find("book")
          .each(function (j) {
            var bbid = $(this).attr("bid");
            if (bbid == bid) {
              var bookName = $(this).attr("name");
              LessonHTML += `<h3 class="wow fadeInLeft">${bookName}</h3>
                                    <div class="swiper-container swiper-lesson">
                                    <div class="swiper-wrapper">`;
              var amount = $(this).find("lesson").length;
              var counter = 0;
              for (var k = 0; k < Math.ceil(amount / 8); k++) {
                LessonHTML += '<div class="swiper-slide">';
                for (var i = k * 8; i < k * 8 + 8; i++) {
                  if (i < amount) {
                    var llid = $(this)
                      .find("lesson:eq(" + i + ")")
                      .attr("lid");
                    var lessonName = $(this)
                      .find("lesson:eq(" + i + ")")
                      .text();

                    LessonHTML += `<div lid="${llid}" onclick="getAllXML('${llid}')">`;

                    switch (llid) {
                      case "1C":
                        LessonHTML += `<span class="front multiC">UNIT 1<br/>Conversation</span>`;
                        break;
                      default:
                        LessonHTML += `<span class="front">L${i + 1}</span>`;
                    }
                    LessonHTML += `<span class="main">${lessonName}</span>
                    </div>`;
                  }
                }
                LessonHTML += "</div>";
              }

              LessonHTML += "</div>";
              LessonHTML += "</div>";
              if (amount > 8) {
                LessonHTML += '<div class="swiper-button-next"></div>';
                LessonHTML += '<div class="swiper-button-prev"></div>';
              }
            }
          });
      }
    });

  $("#lessons").append(LessonHTML).addClass("active");

  $("#lessons")
    .delay(100)
    .queue(function () {
      var lessonSwiper = new Swiper(".swiper-lesson", {
        threshold: 10,
        slidesPerView: 1,
        navigation: {
          nextEl: ".lessons .swiper-button-next",
          prevEl: ".lessons .swiper-button-prev",
        },
      });

      if (lid != undefined && lid != null) {
        lessonSwiper.slideTo(Math.floor(lid / 8));
      }
      lid = null;

      $(this).dequeue();
    });
};

var openSeries = function (ssid) {
  if (
    $(".swiper-cover .swiper-slide").eq(coverSwiper.activeIndex).attr("sid") ==
    ssid
  ) {
    sid = ssid;
    createBooks();
    $("#return").show();
  } else {
    var seriesSeq = 0;
    $(".swiper-cover .swiper-slide").each(function (index) {
      if ($(this).attr("sid") == ssid) {
        seriesSeq = index;
      }
    });
    coverSwiper.slideTo(seriesSeq);
  }
};

var openBook = function (bbid) {
  if (
    $(".swiper-cover .swiper-slide").eq(coverSwiper.activeIndex).attr("bid") ==
    bbid
  ) {
    $(".swiper-cover .swiper-slide").addClass("expand");
    bid = bbid;
    /*coverSwiper.off("setTranslate").on("setTranslate", function () {
      closeBook();
    });*/
    if (!$("#lessons").hasClass("active")) {
      createLessons();
    } else {
      closeBook();
    }
  } else {
    $(".swiper-cover .swiper-slide").removeClass("expand");
    closeBook();
    var bookSeq = 0;
    $(".swiper-cover .swiper-slide").each(function (index) {
      if ($(this).attr("bid") == bbid) {
        bookSeq = index;
      }
    });
    coverSwiper.slideTo(bookSeq);
  }
  if (uid != null) {
    uid = null;
  } else {
    lid = null;
  }
};

var closeBook = function () {
  $(".swiper-cover .swiper-slide").removeClass("expand");
  bid = null;
  $("#lessons").removeClass("active").html("");
};
