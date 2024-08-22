
var Captcha = (function () {
    var getCaptDataApi = window.GetCaptchaDataApi ? window.GetCaptchaDataApi : "/api/go-captcha-data/rotate-basic"
    var checkCaptDataApi = window.CheckCaptchaDataApi ? window.CheckCaptchaDataApi : "/api/go-captcha-check-data/rotate-basic"

    var captchaKey = ""

    var hiddenClassName = "wg-cap-wrap__hidden"
    var dialogActiveClassName = "wg-cap-dialog__active"
    var activeDefaultClassName = "wg-cap-active__default"
    var activeOverClassName = "wg-cap-active__over"
    var activeErrorClassName = "wg-cap-active__error"
    var activeSuccessClassName = "wg-cap-active__success"

    var captchaDragWrapDom        = document.querySelector("#wg-cap-wrap-drag")
    var captchaThumbWrapDom        = document.querySelector("#wg-cap-thumb")
    var captchaDragSlideBarDom    = document.querySelector("#wg-cap-drag-slidebar")
    var captchaDragBlockDom       = document.querySelector("#wg-cap-drag-block")
    var captchaThumbImageDom       = document.querySelector("#wg-cap-thumb-picture")
    var captchaImageDom           = document.querySelector("#wg-cap-image")
    var captchaBtnControlDom      = document.querySelector("#wg-cap-btn-control")
    var captchaCloseBtnDom        = document.querySelector("#wg-cap-close-btn")
    var captchaDialogBtnDom       = document.querySelector("#wg-cap-dialog")
    var captchaRefreshBtnDom      = document.querySelector("#wg-cap-refresh-btn")
    var captchaDefaultBtnDom      = document.querySelector("#wg-cap-btn-default")
    var captchaErrorBtnDom        = document.querySelector("#wg-cap-btn-error")
    var captchaOverBtnDom         = document.querySelector("#wg-cap-btn-over")
    var dialogDom                 = document.querySelector("#wg-cap-container")

    function __initialize() {
        // requestCaptchaData()
        handleEvent()

        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 1) {
                event.preventDefault()
            }
        })
        document.addEventListener('gesturestart', (event) => {
            event.preventDefault()
        })
        document.body.addEventListener('touchend', () => { })
    }

    function handleEvent() {
        Helper.addEventListener(captchaDragSlideBarDom, "mousedown", handleDragEvent, false)
        Helper.addEventListener(captchaDragBlockDom, "touchstart", handleDragEvent, false)
        Helper.addEventListener(captchaCloseBtnDom, "click", handleClickClose, false)
        Helper.addEventListener(captchaDialogBtnDom, "click", handleClickClose, false)
        Helper.addEventListener(captchaRefreshBtnDom, "click", handleClickRefresh, false)
        Helper.addEventListener(captchaDefaultBtnDom, "click", handleClickDefault, false)
        Helper.addEventListener(captchaErrorBtnDom, "click", handleClickDefault, false)
        Helper.addEventListener(captchaOverBtnDom, "click", handleClickDefault, false)
    }

    function resetCaptcha() {
        captchaKey = ""
        captchaThumbImageDom.setAttribute("src", "")
        captchaDragBlockDom.style.left = 0
        captchaThumbWrapDom.style.transform = 'rotate(' + 0 + 'deg)';
        captchaThumbWrapDom.style.visibility = "hidden"
    }

    function clearImage() {
        captchaImageDom.setAttribute("src", "")
    }

    function handleDragEvent(ev){
        var touch = ev.touches && ev.touches[0];
        var ee = ev || window.event;
        var offsetLeft = captchaDragBlockDom.offsetLeft
        var width = captchaDragSlideBarDom.offsetWidth
        var blockWidth = captchaDragBlockDom.offsetWidth
        var maxWidth = width - blockWidth
        var p = 360 / maxWidth

        var angle = 0
        var isMoving = false
        var startX = 0;
        if (touch) {
            startX = touch.pageX - offsetLeft
        } else {
            startX = ee.clientX - offsetLeft
        }

        var handleMove = function(e) {
            isMoving = true

            var mTouche = e.touches && e.touches[0];
            var me = e || window.event;

            var left = 0;
            if (mTouche) {
                left = mTouche.pageX - startX
            } else {
                left = me.clientX - startX
            }

            if (left >= maxWidth) {
                captchaDragBlockDom.style.left = maxWidth + "px";
                return
            }

            if (left <= 0) {
                captchaDragBlockDom.style.left = 0 + "px";
                return
            }

            captchaDragBlockDom.style.left = left + "px";
            angle = (left * p)
            captchaThumbWrapDom.style.transform = 'rotate(' + angle + 'deg)';
            me.cancelBubble = true
            me.preventDefault()
        }

        var handleUp = function(e) {
            if (!Helper.checkTargetFather(captchaDragSlideBarDom, e)) {
                return
            }

            if (!isMoving) {
                return
            }

            isMoving = false
            Helper.removeEventListener(captchaDragSlideBarDom, "mousemove", handleMove, false)
            Helper.removeEventListener(captchaDragSlideBarDom, "mouseup", handleUp, false)
            Helper.removeEventListener(captchaDragSlideBarDom, "mouseout", handleUp, false)

            Helper.removeEventListener(captchaDragSlideBarDom, "touchmove", handleMove, false)
            Helper.removeEventListener(captchaDragSlideBarDom, "touchend", handleUp, false)

            handleClickCheck(angle)
        }

        Helper.addEventListener(captchaDragSlideBarDom, "mousemove", handleMove, false);
        Helper.addEventListener(captchaDragSlideBarDom, "mouseout", handleUp, false);
        Helper.addEventListener(captchaDragSlideBarDom, "mouseup", handleUp, false);

        Helper.addEventListener(captchaDragSlideBarDom, "touchmove", handleMove, false);
        Helper.addEventListener(captchaDragSlideBarDom, "touchend", handleUp, false);

        ee.cancelBubble = true
        ee.preventDefault()
        return false
    }

    function handleClickRefresh() {
        requestCaptchaData()
    }

    function handleClickClose() {
        dialogDom.classList.remove(dialogActiveClassName)
    }

    function handleClickCheck(angle) {
        requestCheckCaptchaData({'angle': angle, 'key': captchaKey})
    }

    function handleClickDefault() {
        requestCaptchaData()
        dialogDom.classList.add(dialogActiveClassName)
    }

    function requestCaptchaData() {
        resetCaptcha()
        clearImage()
        captchaImageDom.classList.add(hiddenClassName)
        Ajax.get(getCaptDataApi, {}, function(data){
            if (data['code'] === 0) {
                captchaImageDom.classList.remove(hiddenClassName)
                captchaImageDom.setAttribute("src", data['image_base64'])
                captchaThumbImageDom.setAttribute("src", data['thumb_base64'])

                captchaThumbWrapDom.style.visibility = "visible"

                captchaKey = data['captcha_key']
            } else {
                alert("请求验证码数据失败：" + data['message'])
            }
        }, function(e){
            console.log("请求验证码数据失败：" + e['message']);
        })
    }

    function requestCheckCaptchaData(angle) {
        Ajax.post(checkCaptDataApi, angle, function(data){
            captchaBtnControlDom.classList.remove(activeDefaultClassName)
            captchaBtnControlDom.classList.remove(activeOverClassName)
            if (data['code'] === 0) {
                alert("验证成功")
                captchaBtnControlDom.classList.remove(activeErrorClassName)
                captchaBtnControlDom.classList.add(activeSuccessClassName)
                setTimeout(function () {
                    handleClickClose()
                }, 200)
            } else {
                alert("验证失败")
                captchaBtnControlDom.classList.remove(activeSuccessClassName)
                captchaBtnControlDom.classList.add(activeErrorClassName)
                requestCaptchaData()
            }
        }, function(e){
            captchaBtnControlDom.classList.remove(activeDefaultClassName)
            captchaBtnControlDom.classList.remove(activeOverClassName)
            captchaBtnControlDom.classList.remove(activeSuccessClassName)
            captchaBtnControlDom.classList.add(activeErrorClassName)
            requestCaptchaData()
        }, function () {
            captchaKey = ""
        })
    }

    __initialize()
    return {}
})();