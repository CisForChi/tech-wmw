/**
 * Section: Featured collection
 * ------------------------------------------------------------------------------
 * Featured collection configuration for complete theme support
 * - https://github.com/Shopify/theme-scripts/tree/master/packages/theme-sections
 *
 * @namespace featuredCollection
 */
import {register} from '@shopify/theme-sections';

var Flickity = require('flickity');
require('flickity-imagesloaded');
require('flickity-fullscreen');

// now use imagesLoaded and fullscreen
var flkty = new Flickity( '.carousel', {
  draggable: false,
  groupCells: true,
  prevNextButtons: true,
  wrapparound:true,
  
pageDots: true

});
// external js: flickity.pkgd.js

// duck-punch startAnimation

/**
 * Module to ajaxify all add to cart forms on the page.
 *
 * Copyright (c) 2015 Caroline Schnapp (11heavens.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */window.onload = function() {

Shopify.AjaxifyCart = (function($) {

  // Some configuration options.
  // I have separated what you will never need to change from what
  // you might change.

  var _config = {

    // What you might want to change
    addToCartBtnLabel:             'Add to cart',
    addedToCartBtnLabel:           'Thank you!',
    addingToCartBtnLabel:          'Adding...',
    soldOutBtnLabel:               'Sold Out',
    howLongTillBtnReturnsToNormal: 1000, // in milliseconds.
    cartCountSelector:             '.cart-count, #cart-count a:first, #gocart p a, #cart .checkout em, .item-count',
    cartTotalSelector:             '#cart-price',
    // 'aboveForm' for top of add to cart form, 
    // 'belowForm' for below the add to cart form, and 
    // 'nextButton' for next to add to cart button.
    feedbackPosition:              'nextButton',

    // What you will never need to change
    addToCartBtnSelector:          '[type="submit"]',
    addToCartFormSelector:         'form[action="/cart/add"]',
    shopifyAjaxAddURL:             '/cart/add.js',
    shopifyAjaxCartURL:            '/cart.js'
  };

  // We need some feedback when adding an item to the cart.
  // Here it is.  
  var _showFeedback = function(success, html, $addToCartForm) {
    $('.ajaxified-cart-feedback').remove();
    var feedback = '<p class="ajaxified-cart-feedback ' + success + '">' + html + '</p>';
    switch (_config.feedbackPosition) {
      case 'aboveForm':
        $addToCartForm.before(feedback);
        break;
      case 'belowForm':
        $addToCartForm.after(feedback);
        break;
      case 'nextButton':
      default:
        $addToCartForm.find(_config.addToCartBtnSelector).after(feedback);
        break;   
    }
    // If you use animate.css
    // $('.ajaxified-cart-feedback').addClass('animated bounceInDown');
    $('.ajaxified-cart-feedback').slideDown();
  };
  var _setText = function($button, label) {
    if ($button.children().length) {
      $button.children().each(function() {
        if ($.trim($(this).text()) !== '') {
          $(this).text(label);
        }
      });
    }
    else {
      $button.val(label).text(label);
    }
  };
  var _init = function() {   
    $(document).ready(function() { 
      $(_config.addToCartFormSelector).submit(function(e) {
        e.preventDefault();
        var $addToCartForm = $(this);
        var $addToCartBtn = $addToCartForm.find(_config.addToCartBtnSelector);
        _setText($addToCartBtn, _config.addingToCartBtnLabel);
        $addToCartBtn.addClass('disabled').prop('disabled', true);
        // Add to cart.
        $.ajax({
          url: _config.shopifyAjaxAddURL,
          dataType: 'json',
          type: 'post',
          data: $addToCartForm.serialize(),
          success: function(itemData) {
            // Re-enable add to cart button.
            $addToCartBtn.addClass('inverted');
            _setText($addToCartBtn, _config.addedToCartBtnLabel);
            _showFeedback('success','<i class="fa fa-check"></i> Added to cart! <a href="/cart">View cart</a> or <a href="/collections/all">continue shopping</a>.',$addToCartForm);
            window.setTimeout(function(){
              $addToCartBtn.prop('disabled', false).removeClass('disabled').removeClass('inverted');
              _setText($addToCartBtn,_config.addToCartBtnLabel);
            }, _config.howLongTillBtnReturnsToNormal);
            // Update cart count and show cart link.
            $.getJSON(_config.shopifyAjaxCartURL, function(cart) {
              if (_config.cartCountSelector && $(_config.cartCountSelector).size()) {
                var value = $(_config.cartCountSelector).html() || '0';
                $(_config.cartCountSelector).html(value.replace(/[0-9]+/,cart.item_count)).removeClass('hidden-count');
              }
              if (_config.cartTotalSelector && $(_config.cartTotalSelector).size()) {
                if (typeof Currency !== 'undefined' && typeof Currency.moneyFormats !== 'undefined') {
                  var newCurrency = '';
                  if ($('[name="currencies"]').size()) {
                    newCurrency = $('[name="currencies"]').val();
                  }
                  else if ($('#currencies span.selected').size()) {
                    newCurrency = $('#currencies span.selected').attr('data-currency');
                  }
                  if (newCurrency) {
                    $(_config.cartTotalSelector).html('<span class=money>' + Shopify.formatMoney(Currency.convert(cart.total_price, "CAD", newCurrency), Currency.money_format[newCurrency]) + '</span>');
                  }
                  else {
                    $(_config.cartTotalSelector).html(Shopify.formatMoney(cart.total_price));
                  }
                }
                else {
                  $(_config.cartTotalSelector).html(Shopify.formatMoney(cart.total_price));
                }
              };
            });        
          }, 
          error: function(XMLHttpRequest) {
            var response = eval('(' + XMLHttpRequest.responseText + ')');
            response = response.description;
            if (response.slice(0,4) === 'All ') {
              _showFeedback('error', response.replace('All 1 ', 'All '), $addToCartForm);
              $addToCartBtn.prop('disabled', false);
              _setText($addToCartBtn, _config.soldOutBtnLabel);
              $addToCartBtn.prop('disabled',true);
            }
            else {
              _showFeedback('error', '<i class="fa fa-warning"></i> ' + response, $addToCartForm);
              $addToCartBtn.prop('disabled', false).removeClass('disabled');
              _setText($addToCartBtn, _config.addToCartBtnLabel);
            }
          }
        });   
        return false;    
      });
    });
  };
  return {
    init: function(params) {
        // Configuration
        params = params || {};
        // Merging with defaults.
        $.extend(_config, params);
        // Action
        $(function() {
          _init();
        });
    },    
    getConfig: function() {
      return _config;
    }
  }  
})(jQuery);

Shopify.AjaxifyCart.init();
/**
 * Featured collection constructor
 * Executes on page load as well as Theme Editor `section:load` events.
 *
 * @param {string} container - selector for the section container DOM element
 */
register('featured-collection', {

  init() {
    window.console.log('Initialising featured collection section');
  },

  publicMethod() {
    // Custom public section method
  },

  _privateMethod() {
    // Custom private section method
  },

  // Shortcut function called when a section is loaded via 'sections.load()' or by the Theme Editor 'shopify:section:load' event.
  onLoad() {
    // Do something when a section instance is loaded
    this.init();
  },

  // Shortcut function called when a section unloaded by the Theme Editor 'shopify:section:unload' event.
  onUnload() {
    // Do something when a section instance is unloaded
  },

  // Shortcut function called when a section is selected by the Theme Editor 'shopify:section:select' event.
  onSelect() {
    // Do something when a section instance is selected
  },

  // Shortcut function called when a section is deselected by the Theme Editor 'shopify:section:deselect' event.
  onDeselect() {
    // Do something when a section instance is selected
  },

  // Shortcut function called when a section block is selected by the Theme Editor 'shopify:block:select' event.
  onBlockSelect() {
    // Do something when a section block is selected
  },

  // Shortcut function called when a section block is deselected by the Theme Editor 'shopify:block:deselect' event.
  onBlockDeselect() {
    // Do something when a section block is deselected
  },
});
 }