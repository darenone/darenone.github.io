(function () {
    'use strict';

    // load dependencies
    var animationControl = require('./animation-control.js');


    $(document).ready(function () {
        var bgMusic = $('audio').get(0);
        var $btnMusic = $('.btn-music');
        var $upArrow = $('.up-arrow');

        // background music control
        $btnMusic.click(function () {
            if (bgMusic.paused) {
                bgMusic.play();
                $(this).removeClass('paused');
            } else {
                bgMusic.pause();
                $(this).addClass('paused');
            }
        });

        // init Swiper
        new Swiper('.swiper-father', {
            mousewheelControl: true,
            effect: 'coverflow',    // slide, fade, coverflow or flip
            speed: 500,
            direction: 'vertical',
            fade: {
                crossFade: false
            },
            coverflow: {
                rotate: 100,
                stretch: 0,
                depth: 300,
                modifier: 1,
                slideShadows: false     // do disable shadows for better performance
            },
            flip: {
                limitRotation: true,
                slideShadows: false     // do disable shadows for better performance
            },
            onInit: function (swiper) {
                animationControl.initAnimationItems();  // get items ready for animations
                animationControl.playAnimation(swiper); // play animations of the first slide
            },
            onTransitionStart: function (swiper) {     // on the last slide, hide .btn-swipe
                if (swiper.activeIndex === swiper.slides.length - 1) {
                    $upArrow.hide();
                } else {
                    $upArrow.show();
                }
            },
            onTransitionEnd: function (swiper) {       // play animations of the current slide
                animationControl.playAnimation(swiper);
            },
            onTouchStart: function (swiper, event) {    // mobile devices don't allow audios to play automatically, it has to be triggered by a user event(click / touch).
                if (!$btnMusic.hasClass('paused') && bgMusic.paused) {
                    bgMusic.play();
                }
            }
        });
        new Swiper(".swiper-image",{
            autoplay:1500,
            loop:true,
            speed: 1000,
            autoplayDisableOnInteraction:false,
            pagination:".swiper-pagination",
            paginationClickable:true,
            prevButton:".swiper-button-prev",
            nextButton:".swiper-button-next",
　　　　　　　effect:"cube"
        })
        new Swiper(".swiper-image4",{
            autoplay:1500,
            loop:true,
            speed: 1000,
            autoplayDisableOnInteraction:false,
            pagination:".swiper-pagination",
            paginationClickable:true,
            prevButton:".swiper-button-prev",
            nextButton:".swiper-button-next",
　　　　　　　effect:"cube"
        })
        new Swiper(".swiper-image5",{
            autoplay:1500,
            loop:false,
            speed: 1000,
            autoplayDisableOnInteraction:false,
            pagination:".swiper-pagination",
            paginationClickable:true,
            prevButton:".swiper-button-prev",
            nextButton:".swiper-button-next",
　　　　　　　effect:"cube"
        })
        new Swiper(".swiper-image6",{
            autoplay:1500,
            loop:true,
            speed: 1000,
            autoplayDisableOnInteraction:false,
            pagination:".swiper-pagination",
            paginationClickable:true,
            prevButton:".swiper-button-prev",
            nextButton:".swiper-button-next",
　　　　　　　effect:"cube"
        })
        new Swiper(".swiper-image7",{
            autoplay:1500,
            loop:true,
            speed: 1000,
            autoplayDisableOnInteraction:false,
            pagination:".swiper-pagination",
            paginationClickable:true,
            prevButton:".swiper-button-prev",
            nextButton:".swiper-button-next",
　　　　　　　effect:"cube"
        })
        // hide loading animation since everything is ready
        $('.loading-overlay').slideUp();
    });
})();
