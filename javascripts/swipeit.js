isDevice = navigator.userAgent.match(/iPhone|iPad|Android/);

$.fn.swipeIt = function() {
    var el = this,
    swipeElement = $(el);
    var s = {
        currentSlideIndex: 0,
        currentSlideOffset: 0,
        direction: null,
        dx: null,
        eventTypeStart: null,
        eventTypeMove: null,
        eventTypeEnd: null,
        i: null,
        lastSlideIndex: null,
        moveX: null,
        positionX: null,
        slideWidth: null,
        touchStartX: null,
        transition: null,
        startSwipeTime: null,
        endSwipeTime: null,
        swipeDuration: null,
        swipeSpeed: null,
        minimalMoveThreshold: 1,
        indicator: false
    };

    s.eventTypeStart = (isDevice) ? 'touchstart': 'mousedown';
    s.eventTypeMove = (isDevice) ? 'touchmove': 'mousemove';
    s.eventTypeEnd = (isDevice) ? 'touchend': 'mouseup';

    //STARTING EVENT
    swipeElement.live(s.eventTypeStart,
    function() {
        var sd = new Date();
        s.startSwipeTime = sd.getTime();
        swipeEvent(this);
    });

    var animationInterval = null;

    var swipeEvent = function(el) {
        s.currentSlideOffset = s.currentSlideIndex * -(s.slideWidth);
        s.slideWidth = swipeElement.children().outerWidth(true);
        s.lastSlideIndex = swipeElement.children().size() - 1;
        s.touchStartX = (isDevice) ? event.touches[0].clientX: event.pageX;

        var stopAnimation = function() {
            if (animationInterval) {
                clearInterval(animationInterval);
            }
        }
        stopAnimation();

        var cancelTouch = function() {
            swipeElement.unbind(s.eventTypeMove, touchMoveListener).unbind(s.eventTypeEnd, touchEndListener);
        };

        var moveSliderToPosition = function(xPosition) {
            el.style.webkitTransform = 'translate3d(' + xPosition + 'px, 0, 0)';
        }

        var currentXPositionOf = function(element) {
            match = /\w+\(([\+\-]?\d+)px,/g.exec(el.style.webkitTransform)
            if (match) {
                return parseInt(match[1]);
            } else {
                return 0;
            }
        }

        function easeOut(step_index, originalPosition, positionDelta, steps) {
            var easeOutFactor = step_index === steps ? 1: 1 - Math.pow(2, -10 * step_index / steps);
            // logarithmic curve
            return originalPosition + positionDelta * easeOutFactor;
        }

        var moveSliderToPositionWithAnimation = function(xPosition, steps) {
            var animationStepToPixelRatio = 1;
            stopAnimation();
            var initPosition = currentXPositionOf(el);
            steps = steps ? steps: 60;
            var step_index = 0;
            var moveDelta = xPosition - initPosition;
            if (Math.abs(moveDelta) * animationStepToPixelRatio < steps) {
                steps = Math.floor(Math.abs(moveDelta) * animationStepToPixelRatio);
            }
            var animationSlide = function() {
                if (step_index !== steps) {
                    step_index += 1;
                    var positionX = easeOut(step_index, initPosition, moveDelta, steps);
                    if (Math.abs(xPosition - positionX) < 1) {
                        stopAnimation();
                        moveSliderToPosition(xPosition);
                    } else {
                        moveSliderToPosition(positionX);
                    }
                } else {
                    stopAnimation();
                    moveSliderToPosition(xPosition);
                }
            };
            animationInterval = setInterval(animationSlide, 0);
        }

        //MOVING EVENT
        var touchMoveListener = function() {
            //mousemove or touchmove
            event.preventDefault();
            event.stopPropagation();
            s.moveX = (isDevice) ? event.touches[0].clientX: event.pageX;
            s.dx = s.moveX - s.touchStartX;
            s.positionX = (s.currentSlideOffset + s.dx);
            moveSliderToPosition(s.positionX)
        }

        //ENDING EVENT
        var touchEndListener = function() {
            s.endSwipeTime = (new Date()).getTime();
            s.swipeDuration = s.endSwipeTime - s.startSwipeTime;
            // milliseconds
            s.swipeSpeed = (s.swipeDuration > 250) ?
            '0.25': (s.swipeDuration * 0.002).toFixed(2);
            // seconds in string
            var movedDistance = Math.abs(s.dx);
            var flipDistanceThreshold = Math.abs(s.slideWidth * .2);

            event.preventDefault();

            if (movedDistance > s.minimalMoveThreshold) {
                s.direction = s.dx > 0 ? 'right': 'left';
            }

            var isLastSlide = (s.currentSlideIndex == s.lastSlideIndex),
            isFirstSlide = (s.currentSlideIndex == 0),
            moveLeft = (s.direction == 'left'),
            moveRight = (s.direction == 'right'),
            hasDirection = moveLeft || moveRight,
            indexOverflow = (moveLeft && isLastSlide) || (moveRight && isFirstSlide),
            shouldFlip = movedDistance > flipDistanceThreshold;

            var stayInCurrentPosition = function() {
                s.positionX = s.currentSlideIndex * s.slideWidth;
                s.dx = null;
            }

            if (!indexOverflow && hasDirection && shouldFlip) {
                if (moveLeft) {
                    s.currentSlideIndex += 1;
                } else if (moveRight) {
                    s.currentSlideIndex -= 1;
                }
                s.positionX = s.currentSlideIndex * s.slideWidth;
            } else {
                stayInCurrentPosition();
            }

            moveSliderToPositionWithAnimation( - s.positionX);
            //s.swipeSpeed
            cancelTouch();
        }

        // Bind the touch move/event listener
        swipeElement.bind(s.eventTypeMove, touchMoveListener).bind(s.eventTypeEnd, touchEndListener);
    }
};