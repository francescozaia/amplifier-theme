// theme functions
window.theme = window.theme || {};

theme.init = function () {
    FastClick.attach(document.body);
    theme.cacheSelectors();
    theme.accessibleNav();
    theme.drawersInit();
    theme.mobileNavToggle();
    theme.productImageSwitch();
    theme.responsiveVideos();
    theme.collectionViews();
    theme.loginForms();
};

theme.cacheSelectors = function () {
    theme.cache = {
        // General
        $html: $('html'),
        $body: $(document.body),

        // Navigation
        $navigation: $('#AccessibleNav'),
        $mobileSubNavToggle: $('.mobile-nav__toggle'),

        // Collection Pages
        $changeView: $('.change-view'),

        // Product Page
        $productImage: $('#ProductPhotoImg'),
        $thumbImages: $('#ProductThumbs').find('a.product-single__thumbnail'),

        // Customer Pages
        $recoverPasswordLink: $('#RecoverPassword'),
        $hideRecoverPasswordLink: $('#HideRecoverPasswordLink'),
        $recoverPasswordForm: $('#RecoverPasswordForm'),
        $customerLoginForm: $('#CustomerLoginForm'),
        $passwordResetSuccess: $('#ResetSuccess')
    };
};

theme.accessibleNav = function () {
    var $nav = theme.cache.$navigation,
        $allLinks = $nav.find('a'),
        $topLevel = $nav.children('li').find('a'),
        $parents = $nav.find('.site-nav--has-dropdown'),
        $subMenuLinks = $nav.find('.site-nav__dropdown').find('a'),
        activeClass = 'nav-hover',
        focusClass = 'nav-focus';

    // Mouseenter
    $parents.on('mouseenter touchstart', function (evt) {
        var $el = $(this);

        if (!$el.hasClass(activeClass)) {
            evt.preventDefault();
        }

        showDropdown($el);
    });

    // Mouseout
    $parents.on('mouseleave', function () {
        hideDropdown($(this));
    });

    $subMenuLinks.on('touchstart', function (evt) {
        // Prevent touchstart on body from firing instead of link
        evt.stopImmediatePropagation();
    });

    $allLinks.focus(function () {
        handleFocus($(this));
    });

    $allLinks.blur(function () {
        removeFocus($topLevel);
    });

    // accessibleNav private methods
    function handleFocus($el) {
        var $subMenu = $el.next('ul'),
            hasSubMenu = $subMenu.hasClass('sub-nav') ? true : false,
            isSubItem = $('.site-nav__dropdown').has($el).length,
            $newFocus = null;

        // Add focus class for top level items, or keep menu shown
        if (!isSubItem) {
            removeFocus($topLevel);
            addFocus($el);
        } else {
            $newFocus = $el.closest('.site-nav--has-dropdown').find('a');
            addFocus($newFocus);
        }
    }

    function showDropdown($el) {
        $el.addClass(activeClass);

        setTimeout(function () {
            theme.cache.$body.on('touchstart', function () {
                hideDropdown($el);
            });
        }, 250);
    }

    function hideDropdown($el) {
        $el.removeClass(activeClass);
        theme.cache.$body.off('touchstart');
    }

    function addFocus($el) {
        $el.addClass(focusClass);
    }

    function removeFocus($el) {
        $el.removeClass(focusClass);
    }
};

theme.drawersInit = function () {
    theme.LeftDrawer = new theme.Drawers('NavDrawer', 'left');
    if (theme.liquid.ajaxCartMethod === "drawer") {
        theme.RightDrawer = new theme.Drawers('CartDrawer', 'right', {
            'onDrawerOpen': ajaxCart.load
        });
    }
};

theme.mobileNavToggle = function () {
    theme.cache.$mobileSubNavToggle.on('click', function () {
        $(this).parent().toggleClass('mobile-nav--expanded');
    });
};

theme.getHash = function () {
    return window.location.hash;
};

theme.productPage = function (options) {
    var moneyFormat = options.money_format,
        variant = options.variant,
        selector = options.selector;

    // Selectors
    var $productImage = $('#ProductPhotoImg'),
        $addToCart = $('#AddToCart'),
        $productPrice = $('#ProductPrice'),
        $comparePrice = $('#ComparePrice'),
        $quantityElements = $('.quantity-selector, label + .js-qty'),
        $addToCartText = $('#AddToCartText');

    if (variant) {

        // Update variant image, if one is set
        if (variant.featured_image) {
            var newImg = variant.featured_image,
                el = $productImage[0];
            Shopify.Image.switchImage(newImg, el, theme.switchImage);
        }

        // Select a valid variant if available
        if (variant.available) {
            // Available, enable the submit button, change text, show quantity elements
            $addToCart.removeClass('disabled').prop('disabled', false);
            $addToCartText.html(theme.liquid.addToCart);
            $quantityElements.show();
        } else {
            // Sold out, disable the submit button, change text, hide quantity elements
            $addToCart.addClass('disabled').prop('disabled', true);
            $addToCartText.html(theme.liquid.soldOut);
            $quantityElements.hide();
        }

        // Regardless of stock, update the product price
        $productPrice.html(Shopify.formatMoney(variant.price, moneyFormat));

        // Also update and show the product's compare price if necessary
        if (variant.compare_at_price > variant.price) {
            $comparePrice
                .html(theme.liquid.compareAt + ' ' + Shopify.formatMoney(variant.compare_at_price, moneyFormat))
                .show();
        } else {
            $comparePrice.hide();
        }

    } else {
        // The variant doesn't exist, disable submit button.
        // This may be an error or notice that a specific variant is not available.
        // To only show available variants, implement linked product options:
        //   - http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
        $addToCart.addClass('disabled').prop('disabled', true);
        $addToCartText.html(theme.liquid.unavailable);
        $quantityElements.hide();
    }
};

theme.productImageSwitch = function () {
    if (theme.cache.$thumbImages.length) {
        // Switch the main image with one of the thumbnails
        // Note: this does not change the variant selected, just the image
        theme.cache.$thumbImages.on('click', function (evt) {
            evt.preventDefault();
            var newImage = $(this).attr('href');
            theme.switchImage(newImage, null, theme.cache.$productImage);
        });
    }
};

theme.switchImage = function (src, imgObject, el) {
    // Make sure element is a jquery object
    var $el = $(el);
    $el.attr('src', src);
};

theme.responsiveVideos = function () {
    var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]');
    var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

    $iframeVideo.each(function () {
        // Add wrapper to make video responsive
        $(this).wrap('<div class="video-wrapper"></div>');
    });

    $iframeReset.each(function () {
        // Re-set the src attribute on each iframe after page load
        // for Chrome's "incorrect iFrame content on 'back'" bug.
        // https://code.google.com/p/chromium/issues/detail?id=395791
        // Need to specifically target video and admin bar
        this.src = this.src;
    });
};

theme.collectionViews = function () {
    if (theme.cache.$changeView.length) {
        theme.cache.$changeView.on('click', function () {
            var view = $(this).data('view'),
                url = document.URL,
                hasParams = url.indexOf('?') > -1;

            if (hasParams) {
                window.location = replaceUrlParam(url, 'view', view);
            } else {
                window.location = url + '?view=' + view;
            }
        });
    }
};

theme.loginForms = function () {
    function showRecoverPasswordForm() {
        theme.cache.$recoverPasswordForm.show();
        theme.cache.$customerLoginForm.hide();
    }

    function hideRecoverPasswordForm() {
        theme.cache.$recoverPasswordForm.hide();
        theme.cache.$customerLoginForm.show();
    }

    theme.cache.$recoverPasswordLink.on('click', function (evt) {
        evt.preventDefault();
        showRecoverPasswordForm();
    });

    theme.cache.$hideRecoverPasswordLink.on('click', function (evt) {
        evt.preventDefault();
        hideRecoverPasswordForm();
    });

    // Allow deep linking to recover password form
    if (theme.getHash() == '#recover') {
        showRecoverPasswordForm();
    }
};

theme.resetPasswordSuccess = function () {
    theme.cache.$passwordResetSuccess.show();
};


// Initialize theme's JS on docready
$(theme.init);
