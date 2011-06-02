$.fn.gSwipe = function(options) {
    var element = this;
    var isTouch = 'ontouchstart' in window;
    var start = isTouch ? 'touchstart': 'mousedown';
    var move = isTouch ? 'touchmove': 'mousemove';
    var minimalMovePixels, marginInSlides, changeOpacity, useCssTransition, animationSteps;
    options = options || {}
    // pixels
    marginInSlides = options.marginInSlides || 8;
    minimalMovePixels = options.minimalMovePixels || 50;
    animationSteps = options.animationSteps || 50;
    if (options.changeOpacity === undefined) {
        changeOpacity = true;
    } else {
        changeOpacity = options.changeOpacity;
    }
    if (options.useCssTransition === undefined) {
        useCssTransition = false;
    } else {
        useCssTransition = options.useCssTransition;
    }

    var Slides = function() {
        var currentSlideIndex = 0;
        var slides = element.children('.slide');
        var slidesCount = slides.length;
        this.next = function() {
            if (currentSlideIndex < (slidesCount - 1)) {
                currentSlideIndex += 1;
            }
        };
        this.prev = function() {
            if (currentSlideIndex > 0) {
                currentSlideIndex -= 1;
            }
        };
        var fixAndroidWhiteSpaceBug = function() {
            e.removeEventListener('webkitTransitionEnd', fixAndroidWhiteSpaceBug, false);
            e.setAttribute('style', changeOpacity ?
            '-webkit-transition:opacity 0.2s linear;-webkit-transform:translate3d(' + position + 'px, 0, 0);opacity: 1;':
            '-webkit-transform:translate3d(' + position + 'px, 0, 0);'
            );
        };
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
            if (useCssTransition) {
                e.setAttribute('style', changeOpacity ?
                    '-webkit-transition:-webkit-transform .2s ease,opacity 0.2s linear;-webkit-transform:translate3d(' + position + 'px, 0, 0);opacity: 0.8;' :
                    '-webkit-transition:-webkit-transform .2s ease;-webkit-transform:translate3d(' + position + 'px, 0, 0);'
                );
                v
                e.addEventListener('webkitTransitionEnd', fixAndroidWhiteSpaceBug, false);
            } else {
                if (changeOpacity) {
                    e.style.webkitTransition = 'opacity 0.2s linear';
                    e.style.opacity = 0.8;
                }
                var callback = changeOpacity ? function(){ e.style.opacity = 1; } : null;
                animator.moveTo(position, callback);
            }
        };
    }
    
    var Animator = function(element, steps) {
        var inAnimation = false, defaultSteps = 50, self = this;

        var requestAnimationFrame = (function() {
            var poormansRAF = function(animate) {
                window.setTimeout(animate, 1000 / 60);
            }
            return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || poormansRAF;
        })();

        function easeOut(step_index, originalPosition, positionDelta, steps) {
            var easeOutFactor = step_index === steps ? 1: 1 - Math.pow(2, -10 * step_index / steps); // logarithmic curve
            return originalPosition + positionDelta * easeOutFactor;
        }
        
        function currentXPositionOf(element) {
            match = /\w+\(([\+\-]?\d+)px,/g.exec(element.style.webkitTransform);
            if (match) {
                return parseInt(match[1]);
            } else {
                return 0;
            }
        }
        
        function moveToPosition(targetPosition) {
            element.style.webkitTransform = 'translate3d(' + targetPosition + 'px, 0, 0)';
        }
        
        this.callback = null;

        this.moveTo = function(targetPosition, callback) {
            this.stop();
            this.callback = callback;

            var step_index = 0;
            var initPosition = currentXPositionOf(element);
            var moveDelta = targetPosition - initPosition;

            steps = steps ? steps: defaultSteps;
            if (Math.abs(moveDelta) < steps) {
                steps = Math.floor(Math.abs(moveDelta));
            }

            var animate = function() {
                console.log('animate', step_index, steps)
                if (step_index < steps) {
                    step_index += 1;
                    var positionX = easeOut(step_index, initPosition, moveDelta, steps);
                    if (Math.abs(targetPosition - positionX) < 1) {
                        self.stop();
                        moveToPosition(targetPosition);
                    } else {
                        moveToPosition(positionX);
                    }
                } else {
                    self.stop();
                    moveToPosition(targetPosition);
                }
                if (inAnimation) {
                    requestAnimationFrame(animate);
                }
            };
            inAnimation = true;
            requestAnimationFrame(animate);
        }
        
        this.stop = function() {
            if (inAnimation) {
                if ($.isFunction(this.callback)) {
                    this.callback.call(this);
                    this.callback = null;
                }
                inAnimation = false;
            }
        };
    }

    var slides = new Slides();
    var animator = new Animator(element[0], animationSteps);

    var startListener = function() {
        if (isTouch && event.targetTouches.length !== 1) {
            this.started = false;
            return;
            // will not trigger swipe in multi-touch
        }
        animator.stop();
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