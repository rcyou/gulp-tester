/* ==========================================================================
 GLOBAL.JS
 Global JavaScript functions, events, and actions used throughout the website.
 ========================================================================== */

// Load REM polyfill if necessary
Modernizr.load({
	test: Modernizr.cssremunit,
	nope: '/js/modernizr.rem.min.js'
});

var mobile_view = false;

var menu_index = 0;
var active_menu_l2 = false;
var active_menu_l3 = false;

var init_drop_menu = function(menu_el) {
	// Initial setup, apply menu ID
	menu_index++;
	menu_el.attr('menuid', menu_index);

	// Hide items and apply menuindex
	$('ul.sub, ul.sub ul.menu-l3', menu_el).hide();
	var menuindex = 0;
	$('ul', menu_el).each(function() {
		menuindex++;
		$(this).attr('menuindex', menuindex);
	});
	
	// Apply menulevel to each menu item
	menu_el.children('li').data('menulevel', '1');
	menu_el.children('ul.sub > li').data('menulevel', '2');
	menu_el.children('ul.sub ul.menu-l3 > li').data('menulevel', '3');
	
	// Mouseover events
	drop_menu_hover_event(menu_el);

	// Keyboard/touch events
	drop_menu_focus_event(menu_el);
}

var drop_menu_hover_event = function(menu_el) {
	$('li:has(ul.sub)', menu_el).hover(function() {
		if (mobile_view === false) {
			$('ul.sub', this).show();
		}
	}, function() {
		if (mobile_view === false) {
			$('ul.sub', this).hide();
		}
	}).focusin(function() {
		$l2_menu = $('ul.sub', this);
		$l2_menu.show();
		if (active_menu_l2 != $l2_menu.attr('menuindex')) {
			hide_drop_menu($('ul.sub[menuindex="' + active_menu_l2 + '"]'), 2);
			active_menu_l2 = $l2_menu.attr('menuindex');
		}
	});
}

var drop_menu_focus_event = function(menu_el) {
	$('body *').focus(function (ev) {
		if (active_menu_l2 != false) {
			var target = $(ev.target);

			if (target.parents('[menuid="' + menu_el.attr('menuid') + '"]').length === 0) {
				// Non-menu elements (hide all drop-down menus)
				if (active_menu_l3 !== false) { //hide 3rd level if shown
					hide_drop_menu($('ul.menu-l3[menuindex="' + active_menu_l3 + '"]'), 3);
				}
				hide_drop_menu($('ul.sub[menuindex="' + active_menu_l2 + '"]'), 2);

			} else if (target.is('a') && target.parent('li').parent('ul').is('[menuid="' + menu_el.attr('menuid') + '"]')) {
				// Top level menu elements (hide other submenus)
				var ul_child2 = target.parent('li').has('ul.sub[menuindex="' + active_menu_l2 + '"]').children('ul.sub');
				if (ul_child2.is('.sub') === false) {
					if (active_menu_l3 !== false) { //hide 3rd level if shown
						hide_drop_menu($('ul.menu-l3[menuindex="' + active_menu_l3 + '"]'), 3);
					}
					hide_drop_menu($('ul.sub[menuindex="' + active_menu_l2 + '"]'), 2);
				}

			} else if (active_menu_l2 !== false && target.is('a') && target.parent('li').parent('ul').is('.sub')) {
				// Second level menu elements
				var ul_child3 = target.parent('li').has('ul.menu-l3[menuindex="' + active_menu_l3 + '"]').children('ul.menu-l3');
				if (ul_child3.is('.menu-l3') === false) {
					hide_drop_menu($('ul.menu-l3[menuindex="' + active_menu_l3 + '"]'), 3);
				}
			}
		}
	});
}

var hide_drop_menu = function(submenu_el, level) {
	submenu_el.css('left', '-9000px').hide();
	if (level == 2) {
		active_menu_l2 = false;
	} else if (level == 3) {
		active_menu_l3 = false;
	}
}

/**
 * Apply drop menu defaults for different view statuses.
 *
 * @return   null
 */
function default_menu() {
	if (mobile_view === false) {
		$('nav').removeClass('show_menu');
		$('nav .top_menu:hidden').show();
		$('nav .show_submenu').removeClass('show_submenu');
		$('nav .sub:visible').hide();
	} else {
		$('nav .top_menu:visible').hide();
	}
}

var resize_window_addl = null;

function resize_window() {
	var width = find_screen_width();
	var current_mobile_view = mobile_view;;

	if (width <= 800) {
		mobile_view = true;
	} else {
		mobile_view = false;
	}

	// If view has changed
	if (current_mobile_view != mobile_view) {
		current_mobile_view = mobile_view;
		default_menu();
	}

	if (typeof(resize_window_addl) == 'function') {
		resize_window_addl(width);
	}
}

function find_screen_width() {
	var width = $(window).width();

	// <= IE8 (backward-compatibility mode)
	if (document.body && document.body.offsetWidth) {
		width = document.body.offsetWidth;
	}

	// <= IE8 (standards mode)
	if (document.compatMode == 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {
		width = document.documentElement.offsetWidth;
	}

	// Other browsers
	if (window.innerWidth) {
		width = window.innerWidth;
	}

	return width;
}

function toggle_menu() {
	var nav = $('nav');

	if (nav.is('.show_menu')) {
		nav.removeClass('show_menu');
		$('.top_menu', nav).slideUp(200);
	} else {
		nav.addClass('show_menu');
		$('.top_menu', nav).slideDown(200);
	}
}

function toggle_submenu(el) {
	var parent = el.parents('li');
	var submenu = $('.sub', parent);

	if (parent.is('.show_submenu')) {
		parent.removeClass('show_submenu');
		submenu.slideUp(200);
	} else {
		parent.addClass('show_submenu');
		submenu.slideDown('200');
	}
}

/**
 * Generic colorbox functionality. Checks to see if colorbox has been loaded - if not, uses jQuery's
 * AJAX method to dynamically load the CSS and JavaScript.
 *
 * @param    object    settings            Object containg colorbox settings (overwrites defaults)
 *
 * @return   null
 */
function open_colorbox(settings) {
	if (typeof(jQuery().colorbox) != 'function') {
		$.ajax({
			url: '/css/jquery.colorbox.css', 
			cache: true,
			success: function(data) {
				$('body').append('<style type="text/css">' + data + '</style>');
				$.ajax({
					url: '/js/jquery.colorbox.min.js',
					cache: true,
					dataType: 'script',
					success: function(data, status) {
						open_colorbox(settings);
					}
				});
			}
		});
	} else {
		var colorbox_settings = {
			close: 'Close',
			opacity: 0.7
		};
		
		$.extend(colorbox_settings, settings);
		$.colorbox(colorbox_settings);
	}
}

var custom_list_filter_settings;

/**
 * Filter a list of items by category or another identifying attribute. Function can
 * accept custom settings as an argument, or will utilize the global object
 * custom_list_filter_settings (can be set for individual pages as needed).
 *
 * @param    object    custom_settings     Settings object to merge with base settings
 *
 * @return   null
 */
var list_filter = function(custom_settings) {
	var settings = {
		viewSelector: '.viewer',	//filter element to click on
		viewDataAttr: 'category',	//filter element data- attribute
		containSelector: '.viewer_items',	//list container element
		containDataAttr: 'category',	//list container data- attribute
		itemSelector: '.item',	//individual item element in list container
		allValue: 'all',	//value of the typical "View All" filter
		activeClass: 'active',	//CSS class for highlighting active filter element
		useHash: false	//enable use of URL hash
	};

	// Merge in global custom_list_filter_settings object
	if (typeof(custom_list_filter_settings) == 'object') {
		$.extend(settings, custom_list_filter_settings);
	}

	// Merge in function-specific custom_settings object
	if (typeof(custom_settings) == 'object') {
		$.extend(settings, custom_settings);
	}

	// Check for container element
	var contain_el = $(settings.containSelector);
	if (contain_el.length === 0) {
		return;
	}

	// Load active category, if available
	if (settings.useHash === true) {
		var hash_pos = document.location.hash.length;
		var hash_active = false;

		if (hash_pos > 0) {
			var active_category = window.location.hash.substring(1);
			var active_el = $(settings.viewSelector).filter('[data-' + settings.viewDataAttr + '="' + active_category + '"], #' + active_category);
			if (active_el.length > 0) {
				hash_active = true;
				list_filter_show(active_el, contain_el, settings);
			}
		}

		if (hash_active === false) {
			var first_el = $(settings.viewSelector).filter(':first');
			list_filter_show(first_el, contain_el, settings);
		}
	}

	// Click event on filter elements
	$(settings.viewSelector).click(function(event) {
		event.preventDefault();
		list_filter_show($(this), contain_el, settings);
	});
}

/**
 * Show a specified category based on the element clicked. Event binded by the above
 * list_filter() function.
 *
 * @param    object    el                      jQuery element of clicked object
 * @param    object    contain_el              jQuery element of container
 * @param    object    settings                Settings object
 *
 * @return   null
 */
var list_filter_show = function(el, contain_el, settings) {
	var category = el.data(settings.viewDataAttr);

	if (typeof(category) == 'undefined' || category === null || category.length === 0) {
		category = el.prop('id');
	}

	if (typeof(category) == 'string' || typeof(category) == 'number') {
		if (category == settings.allValue) {
			$(settings.itemSelector, contain_el).show();
		} else {
			$(settings.itemSelector, contain_el).hide();
			$(settings.itemSelector, contain_el).filter('[data-' + settings.containDataAttr + '="' + category + '"], .' + category).show();
		}

		$(settings.viewSelector + '.' + settings.activeClass).removeClass(settings.activeClass);
		el.addClass(settings.activeClass);

		if (settings.useHash === true) {
			list_filter_hash(category);
		}
	}
}

/**
 * Update the current page's URL with a hash matching the specified category.
 *
 * @param    string    category                Category to apply to URL hash
 *
 * @return   null
 */
var list_filter_hash = function(category) {
	document.location.hash = '#' + category;
}

var load_jquery_cycle_attempts = 0;

/**
 * Load and include jQuery Cycle plugin.
 *
 * @param    function  callback                Callback function (optional)
 * @param    object    callback_el             jQuery Object to include with callback function
 *
 * @return   null
 */
var load_jquery_cycle = function(callback, callback_el) {
	if (jQuery().cycle) {
		if (typeof(callback) == 'function') {
			callback(callback_el);
		}
		return true;
	}

	if (load_jquery_cycle_attempts < 10) {
		load_jquery_cycle_attempts++;

		$.ajax({
			url: '/js/jquery.cycle2.min.js',
			cache: true,
			dataType: 'script',
			error: function() {
				load_jquery_cycle_attempts = 10;
			},
			success: function(data, status) {
				load_jquery_cycle_attempts = 0;
				if (typeof(callback) == 'function') {
					callback(callback_el);
				}
			}
		});
	}

	return;
}


// AJAX load attempt count (news_widget)
var news_widget_count = 0;

/**
 * News Widget with scroll up effect as needed.
 *
 * @return   null
 */
function news_widget() {
	news_widget_count++;

	var news_items_length = $('.news_widget.news_slide .news_item').length;
	if (news_items_length === 1) {
		$('.news_widget.news_slide .news_item:first').show();
	} else if (news_items_length > 1) {
		if (jQuery().cycle) {
			$('.news_widget.news_slide .articles').cycle({
				fx: 'scrollUp',
				pause: true,
				timeout: 6000
			});
		} else if (news_widget_count < 10) {
			$.ajax({
				url: '/js/jquery.cycle.min.js',
				cache: true,
				dataType: 'script',
				success: function(data, status, jqxhr) {
					news_widget();
				}
			})
		} else if (typeof(console) == 'object') {
			console.log('[Site OnCall] Cannot load jQuery Cycle plugin.');
		}
	}
}

//Change words on click in the header text
function change_words() {
	var default_word = $('.descriptive_noun').text();
	var is_default = true;

	var myArray = [default_word, "foo", "bar", "baz", "chuck"];
	var myIndex = 1;

	$('.descriptive_noun').on('click', function(event) {
		$(this).fadeOut(250, function() {
			$(this).text(myArray[myIndex++ % myArray.length]).fadeIn(250);
		});
	});
}

$(document).ready(function() {

	//Change words on click in the header text
	change_words();

	// Resize window events
	resize_window();
	$(window).resize(function() {
		resize_window();
	});

	// Initialize top drop-down menu
	init_drop_menu($('#top_menu'));

	// Toggle menu capability - Hide/show main menu
	$('nav .menu').click(function() {
		toggle_menu();
	});

	// Hide/show submenu
	$('nav .submenu').click(function() {
		toggle_submenu($(this));
	});

	// Start list filter
	list_filter();

	$('.more').click(function() {
		var id = $(this).prop('id').substring(5);
		$('#short-' + id).hide();
		$('#long-' + id).show();
	});

	$('.less').click(function() {
		var id = $(this).prop('id').substring(5);
		$('#short-' + id).show();
		$('#long-' + id).hide();
	});

	// Default Colorbox
	$('.cbox').click(function(event) {
		event.preventDefault();
		open_colorbox({
			href: $(this).prop('href'),
			title: $(this).prop('title')
		});
	});

	$('#close_preview').on( 'click', function( event ) {

		event.preventDefault();

		window.close();

	});

	
	// Initialize News Widget
		news_widget();

	// Countable - counts words in article and figures out how long it will take to read
	Countable.once($('.full_blog_article')[0], function (counter) {
	    var wpm = 200,
	        estimatedRaw = counter.words / wpm,
	        minutes = Math.round(estimatedRaw);

	    if ( minutes < 1 )  {
	    	 var effectiveTime = "just a few seconds";
	    }
	    else if (minutes === 1 ) {
	    	var effectiveTime = minutes + " minute";
	    }
	    else {
	    	var effectiveTime = minutes + " minutes";
	    }

	    $('.reading_time').text(effectiveTime);

	    // var effectiveTime = (minutes < 1) ? "just a few seconds" : minutes + " minutes" || (minutes === 1) ? minutes + " minute" : minutes + " minutes";

	    //display it
	    console.log(effectiveTime);
	});

});