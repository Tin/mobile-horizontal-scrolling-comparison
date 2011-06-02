$.fn.gSwipe = function(options) {
    var element = this;
    var isTouch = 'ontouchstart' in window;
    var start = isTouch ? 'touchstart': 'mousedown';
    var move = isTouch ? 'touchmove': 'mousemove';
    var minimalMovePixels,
    marginInSlides,
    changeOpacity;
    options = options || {}
    // pixels
    marginInSlides = options.marginInSlides || 8;
    minimalMovePixels = options.minimalMovePixels || 50;
    if (options.changeOpacity === undefined) {
        changeOpacity = true;
    } else {
        changeOpacity = options.changeOpacity;
    }

    var Slides = function() {
        var currentSlideIndex = 0;
        var slides = element.children('.slide');
        var slidesCount = slides.length;
        this.next = function() {
            if (currentSlideIndex < (slidesCount - 1)) {
                currentSlideIndex += 1;
            }
        }
        this.prev = function() {
            if (currentSlideIndex > 0) {
                currentSlideIndex -= 1;
            }
        }
        this.move = function(direction) {
            direction > 0 ? this.next() : this.prev();
            var hiddenSlides = slides.slice(0, currentSlideIndex);
            var position = 0;
            for (var index = 0; index < hiddenSlides.length; index++) {
                var slide = slides[index];
                position -= slide.clientWidth;
                position -= marginInSlides;
            }
            var e = element[0];
            e.setAttribute('style', changeOpacity ?
            '-webkit-transition:-webkit-transform .2s ease,opacity 0.2s ease;-webkit-transform:translate3d(' + position + 'px, 0, 0);opacity: 0.8;':
            '-webkit-transition:-webkit-transform .2s ease;-webkit-transform:translate3d(' + position + 'px, 0, 0);'
            );
            var fixAndroidWhiteSpaceBug = function() {
                e.removeEventListener('webkitTransitionEnd', fixAndroidWhiteSpaceBug, false);
                e.setAttribute('style', changeOpacity ?
                '-webkit-transition:opacity 0.2s ease;-webkit-transform:translate3d(' + position + 'px, 0, 0);opacity: 1;':
                '-webkit-transform:translate3d(' + position + 'px, 0, 0);'
                );
            };
            e.addEventListener('webkitTransitionEnd', fixAndroidWhiteSpaceBug, false);
        }
    }

    var slides = new Slides();

    var startListener = function() {
        if (isTouch && event.targetTouches.length !== 1) {
            this.started = false;
            return;
            // will not trigger swipe in multi-touch
        }
        var touch = isTouch ? event.targetTouches[0] : event;
        this.originalX = touch.pageX;
        this.deltaX = 0;
        this.started = true;
        element.bind(move, moveListener);
    }

    var moveListener = function() {
        if (!this.started) {
            return;
        }
        var touch = isTouch ? event.targetTouches[0] : event;
        deltaX = touch.pageX - this.originalX;
        if (Math.abs(deltaX) > minimalMovePixels) {
            slides.move(deltaX < 0 ? 1: -1);
            this.started = false;
            element.unbind(move, moveListener);
        }
    }

    element.bind(start, startListener);
}