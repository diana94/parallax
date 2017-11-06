$(document).ready(function() {
    var controller = $.superscrollorama({
		triggerAtCenter: false,
		playoutAnimations: true
	});

    controller.addTween('.js-parallax-greeting',
        (new TimelineLite())
        .append([
            TweenMax.fromTo($('.js-parallax-greeting-image'), .4,
                {css:{top: 400}, immediateRender:true},
                {css:{top: 120}}),
            TweenMax.fromTo($('.js-parallax-greeting-frame'), 1,
                {css:{top: 500}, immediateRender:true},
                {css:{top: 260}})
        ]),
      350
    );
})
