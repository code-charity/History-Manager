/*--------------------------------------------------------------
>>> CORE
----------------------------------------------------------------
# Global variable
# Append
# Attr
# Camelize
# Class
# Create element
# CSS
# Empty
# Events
# Get property
# Is
# On
# Render
# Storage
	# Clear
	# Get
	# Import
	# Set
	# Remove
# Localization
# Log
# Text
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var satus = {
	components: {},
	events: {
		data: {}
	},
	locale: {
		data: {}
	},
	storage: {
		data: {},
		type: 'extension'
	}
};


/*--------------------------------------------------------------
# APPEND
--------------------------------------------------------------*/

satus.append = function (child, parent) {
	(parent || document.body).appendChild(child);
};


/*--------------------------------------------------------------
# ATTR
--------------------------------------------------------------*/

satus.attr = function (element, attributes) {
	if (attributes) {
		for (var name in attributes) {
			var value = attributes[name];

			if (typeof value === 'function') {
				value = value();
			}

			if (element.namespaceURI) {
				if (value === false) {
					element.removeAttributeNS(null, name);
				} else {
					element.setAttributeNS(null, name, value);
				}
			} else {
				if (value === false) {
					element.removeAttribute(name);
				} else {
					element.setAttribute(name, value);
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# CAMELIZE
--------------------------------------------------------------*/

satus.camelize = function (string) {
	var result = '';

	for (var i = 0, l = string.length; i < l; i++) {
		var character = string[i];

		if (character === '-') {
			i++;

			result += string[i].toUpperCase();
		} else {
			result += character;
		}
	}

	return result;
};


/*--------------------------------------------------------------
# CLASS
--------------------------------------------------------------*/

satus.class = function (element, className) {
	if (className) {
		element.classList.add(className);
	}
};


/*--------------------------------------------------------------
# CREATE ELEMENT
--------------------------------------------------------------*/

satus.createElement = function (tagName, componentName, namespaceURI) {
	var camelizedTagName = this.camelize(tagName),
		className = 'satus-' + (componentName || tagName),
		element,
		match = className.match(/__[^__]+/g);

	if (!namespaceURI) {
		if (tagName === 'svg') {
			namespaceURI = 'http://www.w3.org/2000/svg';
		}
	}

	if (namespaceURI) {
		element = document.createElementNS(namespaceURI, tagName);
	} else if (this.components[camelizedTagName]) {
		element = document.createElement('div');
	} else {
		element = document.createElement(tagName);
	}

	if (match && match.length > 1) {
		className = className.slice(0, className.indexOf('__')) + match[match.length - 1];
	}

	element.componentName = componentName;
	element.className = className;

	element.createChildElement = function (tagName, componentName, namespaceURI) {
		var element = satus.createElement(tagName, this.componentName + '__' + (componentName || tagName), namespaceURI);

		this.appendChild(element);

		return element;
	};

	return element;
};


/*--------------------------------------------------------------
# CSS
--------------------------------------------------------------*/

satus.css = function (element, property) {
	return window.getComputedStyle(element).getPropertyValue(property);
};


/*--------------------------------------------------------------
# DATA
--------------------------------------------------------------*/

satus.data = function (element, data) {
    if (data) {
        for (var key in data) {
            element.dataset[key] = data[key];
        }
    }
};


/*--------------------------------------------------------------
# EMPTY
--------------------------------------------------------------*/

satus.empty = function (element, exclude = []) {
    for (var i = element.childNodes.length - 1; i > -1; i--) {
        var child = element.childNodes[i];

        if (exclude.indexOf(child) === -1) {
            child.remove();
        }
    }
};


/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ON
--------------------------------------------------------------*/

satus.events.on = function (type, handler) {
	if (!this.data[type]) {
		this.data[type] = [];
	}

	this.data[type].push(handler);
};


/*--------------------------------------------------------------
# TRIGGER
--------------------------------------------------------------*/

satus.events.trigger = function (type) {
	var handlers = this.data[type];

	if (handlers) {
		for (var i = 0, l = handlers.length; i < l; i++) {
			handlers[i]();
		}
	}
};


/*--------------------------------------------------------------
# FETCH
--------------------------------------------------------------*/

satus.fetch = function (url, success, error) {
    fetch(url).then(function (response) {
        if (response.ok) {
            response.json().then(success);
        } else {
            error();
        }
    }).catch(function () {
        error(success);
    });
};


/*--------------------------------------------------------------
# GET PROPERTY
--------------------------------------------------------------*/

satus.getProperty = function (object, string) {
	var properties = string.split('.');

	for (var i = 0, l = properties.length; i < l; i++) {
		var property = properties[i];

		console.log(object);

		if (object = object[property]) {
			if (i === l - 1) {
				return object;
			}
		} else {
			return false;
		}
	}
};


/*--------------------------------------------------------------
# ISSET
--------------------------------------------------------------*/

satus.isset = function (variable) {
    if (variable === null || variable === undefined) {
        return false;
    }

    return true;
};


/*--------------------------------------------------------------
# IS
--------------------------------------------------------------*/

satus.isArray = function (array) {
    if (Array.isArray(array)) {
        return true;
    } else {
        return false;
    }
};

satus.isNumber = function (number) {
    if (typeof number === 'number' && isNaN(number) === false) {
        return true;
    } else {
        return false;
    }
};


/*--------------------------------------------------------------
# ON
--------------------------------------------------------------*/

satus.on = function (element, listeners) {
	if (listeners) {
		for (var type in listeners) {
			var listener = listeners[type],
				listener_type = typeof listener;

			if (type === 'selectionchange') {
				element = document;
			}

			if (listener_type === 'function') {
				element.addEventListener(type, listener);
			} else if (listener_type === 'object') {
				element.addEventListener(type, function (event) {
					var target = this.skeleton.on[event.type],
						parent = this.parentNode;

					target.parentSkeleton = this.skeleton;
					target.parentElement = this;

					while (parent.componentName !== 'layers' && parent.componentName !== 'base' && parent !== document.body && parent.parentNode) {
						parent = parent.parentNode;
					}

					if (parent.componentName === 'layers' && target.component !== 'modal') {
                        parent.open(target);
                    } else if (this.baseProvider && this.baseProvider.layers.length === 1) {
                        satus.render(target, this.baseProvider.layers[0]);
                    } else {
                        satus.render(target, this.baseProvider);
                    }
				});
			} else if (listener_type === 'string') {
                element.addEventListener(type, function () {
                    var match = this.skeleton.on[event.type].match(/(["'`].+["'`]|[^.()]+)/g),
                        target = this.baseProvider;

                    for (var i = 0, l = match.length; i < l; i++) {
                        var key = match[i];

                        if (target.skeleton[key]) {
                            target = target.skeleton[key];
                        } else {
                            if (typeof target[key] === 'function') {
                                target[key]();
                            } else {
                                target = target[key];
                            }
                        }

                        if (target.rendered) {
                            target = target.rendered;
                        }
                    }
                });
            }
		}
	}
};


/*--------------------------------------------------------------
# PARENTIFY
--------------------------------------------------------------*/

satus.parentify = function (parentObject, exclude) {
    for (var key in parentObject) {
        if (exclude.indexOf(key) === -1) {
            var child = parentObject[key];

            child.parentObject = parentObject;

            if (typeof child === 'object' && child.component !== 'shortcut') {
                this.parentify(child, exclude);
            }
        }
    }
};


/*--------------------------------------------------------------
# PROPERTIES
--------------------------------------------------------------*/

satus.properties = function (element, properties) {
    if (properties) {
        for (var key in properties) {
        	var property = properties[key];

            if (['placeholder', 'title'].indexOf(key) !== -1) {
            	property = satus.locale.get(property);
            }

            element[key] = property;
        }
    }
};


/*--------------------------------------------------------------
# RENDER
--------------------------------------------------------------*/

satus.render = function (skeleton, container, property, childrenOnly) {
	var element;

	if (skeleton.component && childrenOnly !== true) {
		var tagName = skeleton.component,
			camelizedTagName = this.camelize(tagName),
			namespaceURI = skeleton.namespaceURI;

		if (!namespaceURI) {
			if (tagName === 'svg') {
				namespaceURI = 'http://www.w3.org/2000/svg';
			} else if (skeleton.parentSkeleton && skeleton.parentSkeleton.namespaceURI) {
				namespaceURI = skeleton.parentSkeleton.namespaceURI;
			}

			skeleton.namespaceURI = namespaceURI;
		}

		element = this.createElement(tagName, tagName, namespaceURI);

		skeleton.rendered = element;
		element.skeleton = skeleton;
		element.childrenContainer = element;
		element.componentName = tagName;

		if (skeleton.variant) {
			element.className += ' satus-' + tagName + '--' + skeleton.variant;
		}

		if (container) {
			element.baseProvider = container.baseProvider;
		}

		this.attr(element, skeleton.attr);
		this.style(element, skeleton.style);
		this.data(element, skeleton.data);
		this.class(element, skeleton.class);
		this.properties(element, skeleton.properties);
		this.text(element, skeleton.text);
		this.on(element, skeleton.on);
		this.append(element, container);

		element.storage = (function () {
        	var parent = element,
        		key = skeleton.storage || property || false,
        		value;

        	if (skeleton.storage !== false) {
	        	if (key) {
	        		value = satus.storage.get(key);
	        	}

	        	if (skeleton.hasOwnProperty('value') && value === undefined) {
	                value = skeleton.value;
	            }
	        }

            return Object.defineProperties({}, {
            	key: {
            		get: function () {
	        			return key;
	        		},
	        		set: function (string) {
	        			key = string;
	        		}
            	},
            	value: {
            		get: function () {
	        			return value;
	        		},
	        		set: function (val) {
	        			value = val;

	        			if (skeleton.storage !== false) {	        				
	        				satus.storage.set(key, val);

	        				parent.dispatchEvent(new CustomEvent('change'));
	        			}
	        		}
            	}
            });
        }());

		if (this.components[camelizedTagName]) {
			this.components[camelizedTagName](element, skeleton);
		}

        element.dispatchEvent(new CustomEvent('render'));

		container = element.childrenContainer || element;
	}

	if (!element || element.renderChildren !== false) {
		for (var key in skeleton) {
			var item = skeleton[key];

			if (key !== 'parentSkeleton' && key !== 'parentElement' && key !== 'parentObject') {
				if (item && item.component) {
					item.parentSkeleton = skeleton;

					if (element) {
						item.parentElement = element;
					}

					this.render(item, container, key);
				}
			}
		}
	}

	return element;
};


/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CLEAR
--------------------------------------------------------------*/

satus.storage.clear = function (callback) {
    this.data = {};

    chrome.storage.local.clear(function () {
    	satus.events.trigger('storage-clear');

    	if (callback) {
    		callback();
    	}
    });
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.storage.get = function (key, callback) {
	var target = this.data;

    if (typeof key !== 'string') {
        return;
    }

    key = key.split('/').filter(function (value) {
        return value != '';
    });

    for (var i = 0, l = key.length; i < l; i++) {
        if (satus.isset(target[key[i]])) {
            target = target[key[i]];
        } else {
            return undefined;
        }
    }

    if (typeof target === 'function') {
    	return target();
    } else {
    	return target;
    }
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

satus.storage.import = function (keys, callback) {
    var self = this;

    if (typeof keys === 'function') {
        callback = keys;

        keys = undefined;
    }

    chrome.storage.local.get(keys, function (items) {
        for (var key in items) {
            self.data[key] = items[key];
        }

        satus.log('STORAGE: data was successfully imported');

        satus.events.trigger('storage-import');

        if (callback) {
            callback(items);
        }
    });
};


/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/

satus.storage.remove = function (key) {
	delete this.data[key];

	chrome.storage.local.remove(key, function () {
		satus.events.trigger('storage-remove');
	});
};


/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/

satus.storage.set = function (key, value, callback) {
    var items = {},
        target = this.data;

    if (typeof key !== 'string') {
        return;
    }

    key = key.split('/').filter(function (value) {
        return value != '';
    });

    for (var i = 0, l = key.length; i < l; i++) {
        var item = key[i];

        if (i < l - 1) {

            if (target[item]) {
                target = target[item];
            } else {
                target[item] = {};

                target = target[item];
            }
        } else {
            target[item] = value;
        }
    }

    for (var key in this.data) {
        if (typeof this.data[key] !== 'function') {
            items[key] = this.data[key];
        }
    }

    chrome.storage.local.set(items, function () {
    	satus.events.trigger('storage-set');

    	if (callback) {
    		callback();
    	}
    });
};


/*--------------------------------------------------------------
# LOCALIZATION
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.locale.get = function (string) {
	return this.data[string] || string;
};


/*--------------------------------------------------------------
# IMPORT
----------------------------------------------------------------
satus.locale.import(url, onload, onsuccess);
--------------------------------------------------------------*/

satus.locale.import = function (code, callback, path) {
    var language = code || window.navigator.language;

    if (language.indexOf('en') === 0) {
        language = 'en';
    }

    if (!path) {
        path = '_locales/';
    }

    satus.fetch(chrome.runtime.getURL(path + language + '/messages.json'), function (response) {
        for (var key in response) {
            satus.locale.data[key] = response[key].message;
        }

        satus.log('LOCALE: data was successfully imported');

        if (callback) {
        	callback();
        }
    }, function (success) {
        satus.fetch(chrome.runtime.getURL(path + 'en/messages.json'), success, function () {
            success();
        });
    });
};


/*--------------------------------------------------------------
# LOG
--------------------------------------------------------------*/

satus.log = function () {
	console.log.apply(null, arguments);
};


/*--------------------------------------------------------------
# STYLE
--------------------------------------------------------------*/

satus.style = function (element, object) {
    if (object) {
    	for (var key in object) {
	        element.style[key] = object[key];
	    }
    }
};


/*--------------------------------------------------------------
# TEXT
--------------------------------------------------------------*/

satus.text = function (element, value) {
	if (value) {
		element.appendChild(document.createTextNode(this.locale.get(value)));
	}
};
/*--------------------------------------------------------------
# SEARCH
--------------------------------------------------------------*/

satus.search = function (query, object, callback) {
    var elements = ['switch', 'select', 'slider', 'shortcut', 'radio', 'color-picker'],
        threads = 0,
        results = {},
        excluded = [
            'baseProvider',
            'childrenContainer',
            'parentElement',
            'parentObject',
            'parentSkeleton',
            'rendered',
            'namespaceURI'
        ];

    query = query.toLowerCase();

    function parse(items, parent) {
        threads++;

        for (var key in items) {
            if (excluded.indexOf(key) === -1) {
                var item = items[key];

                if (item.component) {
                    //console.log(key, item.component);

                    if (elements.indexOf(item.component) !== -1 && key.indexOf(query) !== -1) {
                        results[key] = Object.assign({}, item);
                    }
                }

                if (typeof item === 'object') {
                    parse(item, items);
                }
            }
        }

        threads--;

        if (threads === 0) {
            callback(results);
        }
    }

    parse(object);
};
/*--------------------------------------------------------------
>>> USER
--------------------------------------------------------------*/

satus.user = function () {
    /*--------------------------------------------------------------
    1.0 VARIABLES
    --------------------------------------------------------------*/

    var user_agent = navigator.userAgent,
        random_cookie = 'ta{t`nX6cMXK,Wsc',
        video = document.createElement('video'),
        video_formats = {
            ogg: 'video/ogg; codecs="theora"',
            h264: 'video/mp4; codecs="avc1.42E01E"',
            webm: 'video/webm; codecs="vp8, vorbis"',
            vp9: 'video/webm; codecs="vp9"',
            hls: 'application/x-mpegURL; codecs="avc1.42E01E"'
        },
        audio = document.createElement('audio'),
        audio_formats = {
            mp3: 'audio/mpeg',
            mp4: 'audio/mp4',
            aif: 'audio/x-aiff'
        },
        cvs = document.createElement('canvas'),
        ctx = cvs.getContext('webgl'),
        data = {
            browser: {
                audio: null,
                cookies: null,
                flash: null,
                java: null,
                languages: null,
                name: null,
                platform: null,
                version: null,
                video: null,
                webgl: null
            },
            os: {
                name: null,
                type: null
            },
            device: {
                connection: {
                    type: null,
                    speed: null
                },
                cores: null,
                gpu: null,
                max_touch_points: null,
                ram: null,
                screen: null,
                touch: null
            }
        };


    /*--------------------------------------------------------------
    2.0 SOFTWARE
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    2.1.0 OS
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    2.1.1 NAME
    --------------------------------------------------------------*/

    if (navigator.appVersion.indexOf('Win') !== -1) {
        if (navigator.appVersion.match(/(Windows 10.0|Windows NT 10.0)/)) {
            data.os.name = 'Windows 10';
        } else if (navigator.appVersion.match(/(Windows 8.1|Windows NT 6.3)/)) {
            data.os.name = 'Windows 8.1';
        } else if (navigator.appVersion.match(/(Windows 8|Windows NT 6.2)/)) {
            data.os.name = 'Windows 8';
        } else if (navigator.appVersion.match(/(Windows 7|Windows NT 6.1)/)) {
            data.os.name = 'Windows 7';
        } else if (navigator.appVersion.match(/(Windows NT 6.0)/)) {
            data.os.name = 'Windows Vista';
        } else if (navigator.appVersion.match(/(Windows NT 5.1|Windows XP)/)) {
            data.os.name = 'Windows XP';
        } else {
            data.os.name = 'Windows';
        }
    } else if (navigator.appVersion.indexOf('(iPhone|iPad|iPod)') !== -1) {
        data.os.name = 'iOS';
    } else if (navigator.appVersion.indexOf('Mac') !== -1) {
        data.os.name = 'macOS';
    } else if (navigator.appVersion.indexOf('Android') !== -1) {
        data.os.name = 'Android';
    } else if (navigator.appVersion.indexOf('OpenBSD') !== -1) {
        data.os.name = 'OpenBSD';
    } else if (navigator.appVersion.indexOf('SunOS') !== -1) {
        data.os.name = 'SunOS';
    } else if (navigator.appVersion.indexOf('Linux') !== -1) {
        data.os.name = 'Linux';
    } else if (navigator.appVersion.indexOf('X11') !== -1) {
        data.os.name = 'UNIX';
    }

    /*--------------------------------------------------------------
    2.1.2 TYPE
    --------------------------------------------------------------*/

    if (navigator.appVersion.match(/(Win64|x64|x86_64|WOW64)/)) {
        data.os.type = '64-bit';
    } else {
        data.os.type = '32-bit';
    }


    /*--------------------------------------------------------------
    2.2.0 BROWSER
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    2.2.1 NAME
    --------------------------------------------------------------*/

    if (user_agent.indexOf('Opera') !== -1) {
        data.browser.name = 'Opera';
    } else if (user_agent.indexOf('Vivaldi') !== -1) {
        data.browser.name = 'Vivaldi';
    } else if (user_agent.indexOf('Edge') !== -1) {
        data.browser.name = 'Edge';
    } else if (user_agent.indexOf('Chrome') !== -1) {
        data.browser.name = 'Chrome';
    } else if (user_agent.indexOf('Safari') !== -1) {
        data.browser.name = 'Safari';
    } else if (user_agent.indexOf('Firefox') !== -1) {
        data.browser.name = 'Firefox';
    } else if (user_agent.indexOf('MSIE') !== -1) {
        data.browser.name = 'IE';
    }


    /*--------------------------------------------------------------
    2.2.2 VERSION
    --------------------------------------------------------------*/

    var browser_version = user_agent.match(new RegExp(data.browser.name + '/([0-9.]+)'));

    if (browser_version[1]) {
        data.browser.version = browser_version[1];
    }


    /*--------------------------------------------------------------
    2.2.3 PLATFORM
    --------------------------------------------------------------*/

    data.browser.platform = navigator.platform || null;


    /*--------------------------------------------------------------
    2.2.4 LANGUAGES
    --------------------------------------------------------------*/

    data.browser.languages = navigator.languages || null;


    /*--------------------------------------------------------------
    2.2.5 COOKIES
    --------------------------------------------------------------*/

    if (document.cookie) {
        document.cookie = random_cookie;

        if (document.cookie.indexOf(random_cookie) !== -1) {
            data.browser.cookies = true;
        }
    }


    /*--------------------------------------------------------------
    2.2.6 FLASH
    --------------------------------------------------------------*/

    try {
        if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
            data.browser.flash = true;
        }
    } catch (e) {
        if (navigator.mimeTypes['application/x-shockwave-flash']) {
            data.browser.flash = true;
        }
    }


    /*--------------------------------------------------------------
    2.2.7 JAVA
    --------------------------------------------------------------*/

    if (typeof navigator.javaEnabled === 'function' && navigator.javaEnabled()) {
        data.browser.java = true;
    }


    /*--------------------------------------------------------------
    2.2.8 VIDEO FORMATS
    --------------------------------------------------------------*/

    if (typeof video.canPlayType === 'function') {
        data.browser.video = {};

        for (var i in video_formats) {
            var can_play_type = video.canPlayType(video_formats[i]);

            if (can_play_type === '') {
                data.browser.video[i] = false;
            } else {
                data.browser.video[i] = can_play_type;
            }
        }
    }


    /*--------------------------------------------------------------
    2.2.9 AUDIO FORMATS
    --------------------------------------------------------------*/

    if (typeof audio.canPlayType === 'function') {
        data.browser.audio = {};

        for (var i in audio_formats) {
            var can_play_type = audio.canPlayType(audio_formats[i]);

            if (can_play_type == '') {
                data.browser.audio[i] = false;
            } else {
                data.browser.audio[i] = can_play_type;
            }
        }
    }


    /*--------------------------------------------------------------
    2.2.10 WEBGL
    --------------------------------------------------------------*/

    if (ctx && ctx instanceof WebGLRenderingContext) {
        data.browser.webgl = true;
    }


    /*--------------------------------------------------------------
    3.0 HARDWARE
    --------------------------------------------------------------*/

    /*--------------------------------------------------------------
    3.1 SCREEN
    --------------------------------------------------------------*/

    if (screen) {
        data.device.screen = screen.width + 'x' + screen.height;
    }


    /*--------------------------------------------------------------
    3.2 RAM
    --------------------------------------------------------------*/

    if ('deviceMemory' in navigator) {
        data.device.ram = navigator.deviceMemory + ' GB';
    }


    /*--------------------------------------------------------------
    3.3 GPU
    --------------------------------------------------------------*/

    if (
        ctx &&
        ctx instanceof WebGLRenderingContext &&
        'getParameter' in ctx &&
        'getExtension' in ctx
    ) {
        var info = ctx.getExtension('WEBGL_debug_renderer_info');

        if (info) {
            data.device.gpu = ctx.getParameter(info.UNMASKED_RENDERER_WEBGL);
        }
    }


    /*--------------------------------------------------------------
    3.4 CORES
    --------------------------------------------------------------*/

    if (navigator.hardwareConcurrency) {
        data.device.cores = navigator.hardwareConcurrency;
    }


    /*--------------------------------------------------------------
    3.5 TOUCH
    --------------------------------------------------------------*/

    if (
        window.hasOwnProperty('ontouchstart') ||
        window.DocumentTouch && document instanceof window.DocumentTouch ||
        navigator.maxTouchPoints > 0 ||
        window.navigator.msMaxTouchPoints > 0
    ) {
        data.device.touch = true;
        data.device.max_touch_points = navigator.maxTouchPoints;
    }


    /*--------------------------------------------------------------
    3.6 CONNECTION
    --------------------------------------------------------------*/

    if (typeof navigator.connection === 'object') {
        data.device.connection.type = navigator.connection.effectiveType || null;

        if (navigator.connection.downlink) {
            data.device.connection.speed = navigator.connection.downlink + ' Mbps';
        }
    }


    /*--------------------------------------------------------------
    4.0 CLEARING
    --------------------------------------------------------------*/

    video.remove();
    audio.remove();
    cvs.remove();


    return data;
};
/*--------------------------------------------------------------
>>> COLOR:
----------------------------------------------------------------
# RGB to HSL
# HUE to RGB
# HSL to RGB
--------------------------------------------------------------*/

satus.color = {};


/*--------------------------------------------------------------
# RGB TO HSL
--------------------------------------------------------------*/

satus.color.rgbToHsl = function (array) {
	var r = array[0] / 255,
		g = array[1] / 255,
		b = array[2] / 255,
		min = Math.min(r, g, b),
		max = Math.max(r, g, b),
		h = 0,
		s = 0,
		l = (min + max) / 2;

	if (min === max) {
		h = 0;
		s = 0;
	} else {
		var delta = max - min;

		s = l <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

		if (max === r) {
			h = (g - b) / delta + (g < b ? 6 : 0);
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else if (max === b) {
			h = (r - g) / delta + 4;
		}

		h /= 6;
	}

	h *= 360;
	s *= 100;
	l *= 100;

	if (array.length === 3) {
		return [h, s, l];
	} else {
		return [h, s, l, array[3]];
	}
};


/*--------------------------------------------------------------
# HUE TO RGB
--------------------------------------------------------------*/

satus.color.hueToRgb = function (array) {
	var t1 = array[0],
		t2 = array[1],
		hue = array[2];

	if (hue < 0) {
		hue += 6;
	}

	if (hue >= 6) {
		hue -= 6;
	}

	if (hue < 1) {
		return (t2 - t1) * hue + t1;
	} else if (hue < 3) {
		return t2;
	} else if (hue < 4) {
		return (t2 - t1) * (4 - hue) + t1;
	} else {
		return t1;
	}
};


/*--------------------------------------------------------------
# HSL TO RGB
--------------------------------------------------------------*/

satus.color.hslToRgb = function (array) {
	var h = array[0] / 360,
		s = array[1] / 100,
		l = array[2] / 100,
		r, g, b;

	if (s == 0) {
		r = g = b = l;
	} else {
		var hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
/*--------------------------------------------------------------
>>> BASE
--------------------------------------------------------------*/

satus.components.base = function (component) {
	component.baseProvider = component;
	component.layers = [];
};
/*--------------------------------------------------------------
>>> MODAL
--------------------------------------------------------------*/

satus.components.modal = function (component, skeleton) {
	component.scrim = component.createChildElement('div', 'scrim');
	component.surface = component.createChildElement('div', 'surface');

	component.close = function () {
		var component = this;

		this.classList.add('satus-modal--closing');

		setTimeout(function () {
			component.remove();

			component.dispatchEvent(new CustomEvent('close'));
		}, Number(satus.css(this.surface, 'animation-duration').replace(/[^0-9.]/g, '')) * 1000);
	};

	component.scrim.addEventListener('click', function () {
		this.parentNode.close();
	});

	component.childrenContainer = component.surface;
};
/*--------------------------------------------------------------
>>> SIDEBAR
--------------------------------------------------------------*/

satus.components.sidebar = function (component, skeleton) {};
/*--------------------------------------------------------------
>>> LIST
--------------------------------------------------------------*/

satus.components.list = function (component, skeleton) {
	for (var i = 0, l = skeleton.items.length; i < l; i++) {
		var li = component.createChildElement('div', 'item'),
			item = skeleton.items[i];

		for (var j = 0, k = item.length; j < k; j++) {
			var child = item[j];

			if (typeof child === 'string') {
				var span = li.createChildElement('span');

				span.textContent = satus.locale.get(child);
			} else {
				satus.render(child, li);
			}
		}
	}
};
/*--------------------------------------------------------------
>>> RADIO
--------------------------------------------------------------*/

satus.components.radio = function (component, skeleton) {
	var content = document.createElement('span'),
		radio = document.createElement('input');

	component.inner = content;

	radio.type = 'radio';

	if (skeleton.group) {
		component.storage.key = skeleton.group;
		radio.name = skeleton.group;
	}

	if (skeleton.value) {
		radio.value = skeleton.value;
	}

	component.addEventListener('render', function () {
		this.storage.value = satus.storage.get(this.storage.key);

		if (satus.isset(this.storage.value)) {
			radio.checked = this.storage.value === skeleton.value;
		} else if (skeleton.checked) {
			radio.checked = true;
		}
	});

	radio.addEventListener('change', function () {
		this.parentNode.storage.value = this.value;
	});

	component.appendChild(content);
	component.appendChild(radio);
};
/*--------------------------------------------------------------
>>> CHECKBOX
--------------------------------------------------------------*/

satus.components.checkbox = function (component, skeleton) {
	var content = component.add('span', 'checkbox__content');

	component.inner = content;

	component.addEventListener('click', function () {
		if (this.dataset.value === 'true') {
			this.storage.value = false;
			this.dataset.value = 'false';
		} else {
			this.storage.value = true;
			this.dataset.value = 'true';
		}
	});

	component.addEventListener('render', function () {
		this.dataset.value = this.storage.value;
	});
};
/*--------------------------------------------------------------
>>> GRID
--------------------------------------------------------------*/

satus.components.grid = function (component, skeleton) {
	console.log(component, skeleton);
};
/*--------------------------------------------------------------
>>> SELECT
--------------------------------------------------------------*/

satus.components.select = function (component, skeleton) {
	var component_content = document.createElement('span'),
		component_value = document.createElement('span'),
		component_select = document.createElement('select');

	for (var i = 0, l = skeleton.options.length; i < l; i++) {
		var option = document.createElement('option');

		option.value = skeleton.options[i].value;

		satus.text(option, skeleton.options[i].text);

		component_select.appendChild(option);
	}

	component.inner = component_content;
	component.select = component_select;

	Object.defineProperty(component, 'value', {
		get() {
			return this.select.value;
		},
		set(value) {
			this.select.value = value;
		}
	});

	component.render = function () {
		var value_element = this.children[2];

		satus.empty(value_element);

		satus.text(value_element, this.select.options[this.select.selectedIndex].text);

		this.dataset.value = this.value;
	};

	component.addEventListener('render', function () {
		this.value = this.storage.value || this.skeleton.options[0].value;

		this.render();
	});

	component_select.addEventListener('change', function () {
		var component = this.parentNode;

		component.storage.value = this.value;

		component.render();
	});

	component.appendChild(component_select);
	component.appendChild(component_content);
	component.appendChild(component_value);
};
/*--------------------------------------------------------------
>>> SHORTCUT
--------------------------------------------------------------*/

satus.components.shortcut = function (component, skeleton) {
    var content = document.createElement('span'),
        value = document.createElement('div');

    component.inner = content;

    component.className = 'satus-button';
    value.className = 'satus-shortcut__value';

    component.render = function (parent) {
        var self = this,
            parent = parent || self.primary,
            children = parent.children;

        satus.empty(parent);

        function createElement(name) {
            var element = document.createElement('div');

            element.className = 'satus-shortcut__' + name;

            parent.appendChild(element);

            return element;
        }

        if (this.data.alt) {
            createElement('key').textContent = 'Alt';
        }

        if (this.data.ctrl) {
            if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
                createElement('plus');
            }

            createElement('key').textContent = 'Ctrl';
        }

        if (this.data.shift) {
            if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
                createElement('plus');
            }

            createElement('key').textContent = 'Shift';
        }

        for (var code in this.data.keys) {
            var key = this.data.keys[code].key,
                arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
                index = arrows.indexOf(key);

            if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
                createElement('plus');
            }

            if (index !== -1) {
                createElement('key').textContent = ['↑', '→', '↓', '←'][index];
            } else if (key === ' ') {
                createElement('key').textContent = '␣';
            } else if (key) {
                createElement('key').textContent = key.toUpperCase();
            }
        }

        if (this.data.wheel) {
            if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
                createElement('plus');
            }

            var mouse = createElement('mouse'),
                div = document.createElement('div');

            mouse.appendChild(div);

            mouse.className += ' ' + (this.data.wheel > 0);
        }

        if (this.data.click) {
            if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
                createElement('plus');
            }

            var mouse = createElement('mouse'),
                div = document.createElement('div');

            mouse.appendChild(div);

            mouse.className += ' click';
        }

        if (this.data.middle) {
            if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
                createElement('plus');
            }

            var mouse = createElement('mouse'),
                div = document.createElement('div');

            mouse.appendChild(div);

            mouse.className += ' middle';
        }

        if (this.data.context) {
            if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
                createElement('plus');
            }

            var mouse = createElement('mouse'),
                div = document.createElement('div');

            mouse.appendChild(div);

            mouse.className += ' context';
        }
    };

    component.valueElement = value;

    component.appendChild(content);
    component.appendChild(value);

    component.keydown = function (event) {
        event.preventDefault();
        event.stopPropagation();

        component.data = {
            alt: event.altKey,
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            keys: {}
        };

        if (['control', 'alt', 'altgraph', 'shift'].indexOf(event.key.toLowerCase()) === -1) {
            component.data.keys[event.keyCode] = {
                code: event.code,
                key: event.key
            };
        }

        component.data.wheel = 0;

        component.render();

        return false;
    };

    if (skeleton.wheel !== false) {
        component.mousewheel = function (event) {
            event.stopPropagation();

            if (
                (
                    component.data.wheel === 0 &&
                    (
                        Object.keys(component.data.keys).length === 0 &&
                        component.data.alt === false &&
                        component.data.ctrl === false &&
                        component.data.shift === false
                    )
                ) ||
                component.data.wheel < 0 && event.deltaY > 0 ||
                component.data.wheel > 0 && event.deltaY < 0) {
                component.data = {
                    alt: false,
                    ctrl: false,
                    shift: false,
                    keys: {}
                };
            }

            component.data.wheel = event.deltaY < 0 ? -1 : 1;

            component.render();

            return false;
        };
    }

    component.addEventListener('click', function () {
        satus.render({
            component: 'modal',
            properties: {
                parent: this
            },
            on: {
                close: function () {
                    window.removeEventListener('keydown', component.keydown);
                    window.removeEventListener('wheel', component.mousewheel);
                }
            },

            primary: {
                component: 'div',
                class: 'satus-shortcut__primary',
                on: {
                    render: function () {
                        component.primary = this;

                        if (component.skeleton.mouseButtons === true) {
                            this.addEventListener('mousedown', function (event) {
                                if (
                                    component.data.click && event.button === 0 ||
                                    component.data.middle && event.button === 1
                                ) {
                                    component.data = {
                                        alt: false,
                                        ctrl: false,
                                        shift: false,
                                        keys: {}
                                    };
                                }

                                component.data.click = false;
                                component.data.middle = false;
                                component.data.context = false;

                                if (event.button === 0) {
                                    component.data.click = true;
                                    
                                    component.render();
                                } else if (event.button === 1) {
                                    component.data.middle = true;
                                    
                                    component.render();
                                }
                            });

                            this.addEventListener('contextmenu', function (event) {
                                event.preventDefault();
                                event.stopPropagation();

                                if (component.data.context) {
                                    component.data = {
                                        alt: false,
                                        ctrl: false,
                                        shift: false,
                                        keys: {}
                                    };
                                }

                                component.data.context = true;
                                component.data.middle = false;
                                component.data.click = false;

                                component.render();

                                return false;
                            });
                        }

                        component.render();
                    }
                }
            },
            actions: {
                component: 'section',
                variant: 'actions',

                reset: {
                    component: 'button',
                    text: 'reset',
                    on: {
                        click: function () {
                            var component = this.parentNode.parentNode.parentNode.parent;

                            component.data = component.skeleton.value || {};

                            component.render(component.valueElement);

                            satus.storage.remove(component.storage);

                            this.parentNode.parentNode.parentNode.close();

                            window.removeEventListener('keydown', component.keydown);
                            window.removeEventListener('wheel', component.mousewheel);
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            component.data = satus.storage.get(component.storage) || component.skeleton.value || {};

                            component.render(component.valueElement);

                            this.parentNode.parentNode.parentNode.close();

                            window.removeEventListener('keydown', component.keydown);
                            window.removeEventListener('wheel', component.mousewheel);
                        }
                    }
                },
                save: {
                    component: 'button',
                    text: 'save',
                    on: {
                        click: function () {
                            component.storage.value = component.data;

                            component.render(component.valueElement);

                            this.parentNode.parentNode.parentNode.close();

                            window.removeEventListener('keydown', component.keydown);
                            window.removeEventListener('wheel', component.mousewheel);
                        }
                    }
                }
            }
        }, this.baseProvider);

        window.addEventListener('keydown', this.keydown);
        window.addEventListener('wheel', this.mousewheel);
    });

    component.data = component.storage.value || {
        alt: false,
        ctrl: false,
        shift: false,
        keys: {},
        wheel: 0
    };

    component.render(component.valueElement);
};
/*--------------------------------------------------------------
>>> TEXT FIELD
--------------------------------------------------------------*/

satus.components.textField = function (component, skeleton) {
	var container = component.createChildElement('div', 'container'),
		input = container.createChildElement('input'),
		pre = container.createChildElement('pre'),
		hiddenValue = container.createChildElement('pre', 'hidden-value'),
		selection = container.createChildElement('div', 'selection'),
		cursor = container.createChildElement('div', 'cursor');

	component.placeholder = skeleton.placeholder;
	component.input = input;
	component.pre = pre;
	component.hiddenValue = hiddenValue;
	component.selection = selection;
	component.cursor = cursor;
	component.syntax = {
		current: 'text',
		handlers: {
			regex: function (value, target) {
				var regex_token = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
					char_class_token = /[^\\-]+|-|\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)/g,
					char_class_parts = /^(\[\^?)(]?(?:[^\\\]]+|\\[\S\s]?)*)(]?)$/,
					quantifier = /^(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??$/,
					matches = value.match(regex_token);

				function create(type, string) {
					var span = document.createElement('span');

					span.className = type;
					span.textContent = string;

					target.appendChild(span);
				}

				for (var i = 0, l = matches.length; i < l; i++) {
					var match = matches[i];

					if (match[0] === '[') {
						create('character-class', match);
					} else if (match[0] === '(') {
						create('group', match);
					} else if (match[0] === ')') {
						create('group', match);
					} else if (match[0] === '\\' || match === '^') {
						create('anchor', match);
					} else if (quantifier.test(match)) {
						create('quantifier', match);
					} else if (match === '|' || match === '.') {
						create('metasequence', match);
					} else {
						create('text', match);
					}
				}
			}
		},
		set: function (syntax) {
			if (this.handlers[syntax]) {
				this.current = syntax;
			} else {
				this.current = 'text';
			}

			pre.update();
		}
	};
	component.focus = function () {
		this.input.focus();
	};

	Object.defineProperty(component, 'value', {
		get: function () {
			return this.input.value;
		},
		set: function (value) {
			this.input.value = value;
		}
	});

	if (skeleton.syntax) {
		component.syntax.set(skeleton.syntax);
	}

	input.type = 'text';

	selection.setAttribute('disabled', '');

	pre.update = function () {
		var component = this.parentNode.parentNode,
			handler = component.syntax.handlers[component.syntax.current],
			value = component.storage.value || '';

		for (var i = this.childNodes.length - 1; i > -1; i--) {
			this.childNodes[i].remove();
		}

		if (handler) {
			handler(value, this);
		} else {
			this.textContent = value;
		}

		if (value.length === 0) {
			var placeholder = component.placeholder;

			if (typeof placeholder === 'function') {
				placeholder = component.placeholder();
			}

			this.textContent = placeholder;
		}
	};

	cursor.update = function () {
		var component = this.parentNode.parentNode,
			input = component.input,
			start = input.selectionStart,
			end = input.selectionEnd,
			value = input.value;

		this.style.animation = 'none';

		if (start === end) {
			component.selection.setAttribute('disabled', '');
		} else {
			component.selection.removeAttribute('disabled');

			component.hiddenValue.textContent = value.substring(0, start);

			component.selection.style.left = component.hiddenValue.offsetWidth - input.scrollLeft + 'px';

			component.hiddenValue.textContent = value.substring(start, end);

			component.selection.style.width = component.hiddenValue.offsetWidth + 'px';
		}

		if (input.selectionDirection === 'forward') {
			component.hiddenValue.textContent = value.substring(0, end);
		} else {
			component.hiddenValue.textContent = value.substring(0, start);
		}

		this.style.left = component.hiddenValue.offsetWidth - input.scrollLeft + 'px';

		this.style.animation = '';

		component.hiddenValue.textContent = '';
	};

	document.addEventListener('selectionchange', function (event) {
		component.pre.update();
		component.cursor.update();
	});

	input.addEventListener('input', function () {
		var component = this.parentNode.parentNode;

		component.storage.value = this.value;

		component.pre.update();
		component.cursor.update();
	});

	input.addEventListener('scroll', function (event) {
		var component = this.parentNode.parentNode;

		component.pre.style.left = -this.scrollLeft + 'px';

		component.pre.update();
		component.cursor.update();
	});

	component.addEventListener('change', function () {
		this.pre.update();
		this.cursor.update();
	});

	component.value = component.storage.value || '';

	component.addEventListener('render', function () {
		component.pre.update();
		component.cursor.update();
	});

	if (skeleton.on) {
		for (var type in skeleton.on) {
			input.addEventListener(type, function (event) {
				this.parentNode.parentNode.dispatchEvent(new Event(event.type));
			});
		}
	}
};
/*--------------------------------------------------------------
>>> SWITCH
--------------------------------------------------------------*/

satus.components.switch = function (component, skeleton) {
	var component_thumb = document.createElement('i');

	component.addEventListener('click', function () {
		if (this.dataset.value === 'true') {
			this.storage.value = false;
			this.dataset.value = 'false';
		} else {
			this.storage.value = true;
			this.dataset.value = 'true';
		}
	}, true);

	component.addEventListener('render', function () {
		this.dataset.value = this.storage.value;
	});

	component.appendChild(component_thumb);
};
/*--------------------------------------------------------------
>>> COLOR PICKER
--------------------------------------------------------------*/

satus.components.colorPicker = function (component, skeleton) {
    var component_label = component.createChildElement('span', 'label'),
        component_value = component.createChildElement('span', 'value');

    component.inner = component_label;
    component.valueElement = component_value;

    component.className = 'satus-button';

    component.addEventListener('click', function () {
        var rgb = this.rgb,
            hsl = satus.color.rgbToHsl(rgb),
            s = hsl[1] / 100,
            l = hsl[2] / 100;

        s *= l < .5 ? l : 1 - l;

        var v = l + s;

        s = 2 * s / (l + s);

        satus.render({
            component: 'modal',
            variant: 'color-picker',
            value: hsl,
            parentElement: this,

            palette: {
                component: 'div',
                class: 'satus-color-picker__palette',
                style: {
                    'backgroundColor': 'hsl(' + hsl[0] + 'deg, 100%, 50%)'
                },
                on: {
                    mousedown: function () {
                        var palette = this,
                            rect = this.getBoundingClientRect(),
                            cursor = this.children[0];

                        function mousemove(event) {
                            var hsl = palette.skeleton.parentSkeleton.storage.value,
                                x = event.clientX - rect.left,
                                y = event.clientY - rect.top,
                                s;

                            x = Math.min(Math.max(x, 0), rect.width) / (rect.width / 100);
                            y = Math.min(Math.max(y, 0), rect.height) / (rect.height / 100);

                            var v = 100 - y,
                                l = (2 - x / 100) * v / 2;

                            hsl[1] = x * v / (l < 50 ? l * 2 : 200 - l * 2);
                            hsl[2] = l;

                            cursor.style.left = x + '%';
                            cursor.style.top = y + '%';

                            palette.nextSibling.children[0].style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';

                            event.preventDefault();
                        }

                        function mouseup() {
                            window.removeEventListener('mousemove', mousemove);
                            window.removeEventListener('mouseup', mouseup);
                        }

                        window.addEventListener('mousemove', mousemove);
                        window.addEventListener('mouseup', mouseup);
                    }
                },

                cursor: {
                    component: 'div',
                    class: 'satus-color-picker__cursor',
                    style: {
                        'left': s * 100 + '%',
                        'top': 100 - v * 100 + '%'
                    }
                }
            },
            section: {
                component: 'section',
                variant: 'color',

                color: {
                    component: 'div',
                    class: 'satus-color-picker__color',
                    style: {
                        'backgroundColor': 'rgb(' + this.rgb.join(',') + ')'
                    }
                },
                hue: {
                    component: 'slider',
                    class: 'satus-color-picker__hue',
                    storage: false,
                    value: hsl[0],
                    max: 360,
                    on: {
                        change: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                hsl = modal.storage.value;

                            hsl[0] = this.values[0];

                            this.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';
                            this.parentSkeletonNode.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg, 100%, 50%)';
                        }
                    }
                }
            },
            actions: {
                component: 'section',
                variant: 'actions',

                reset: {
                    component: 'button',
                    text: 'reset',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentSkeleton;

                            component.rgb = component.skeleton.value;

                            component.storage.value = component.rgb;

                            component.valueElement.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';

                            modal.rendered.close();
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.skeleton.parentSkeleton.parentSkeleton.rendered.close();
                        }
                    }
                },
                ok: {
                    component: 'button',
                    text: 'OK',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentSkeleton;

                            component.rgb = satus.color.hslToRgb(modal.storage.value);

                            component.storage.value = component.rgb;

                            component.valueElement.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';

                            modal.rendered.close();
                        }
                    }
                }
            }
        }, this.baseProvider.layers[0]);
    });

    component.addEventListener('render', function () {
        component.rgb = this.storage.value || [0, 100, 50];

        component_value.style.backgroundColor = 'rgb(' + component.rgb.join(',') + ')';
    });
};

satus.components.colorPicker = function (component, skeleton) {
    component.color = (function (element) {
        var array;

        Object.defineProperty(element, 'value', {
            get: function () {
                return array;
            },
            set: function (value) {
                array = value;

                this.parentNode.storage.value = array;

                element.style.backgroundColor = 'rgb(' + value.join(',') + ')';
            }
        });

        element.value = component.storage.value || component.skeleton.value || [0, 0, 0];

        return element;
    })(component.createChildElement('span', 'value'));

    component.addEventListener('click', function () {
        var hsl = satus.color.rgbToHsl(this.color.value),
            s = hsl[1] / 100,
            l = hsl[2] / 100;

        s *= l < .5 ? l : 1 - l;

        var v = l + s;

        s = 2 * s / (l + s);

        satus.render({
            component: 'modal',
            variant: 'color-picker',
            value: hsl,
            parentElement: this,

            palette: {
                component: 'div',
                class: 'satus-color-picker__palette',
                style: {
                    'backgroundColor': 'hsl(' + hsl[0] + 'deg, 100%, 50%)'
                },
                on: {
                    mousedown: function (event) {
                        if (event.button !== 0) {
                            return false;
                        }

                        var palette = this,
                            rect = this.getBoundingClientRect(),
                            cursor = this.children[0];

                        function mousemove(event) {
                            var hsl = palette.skeleton.parentSkeleton.value,
                                x = event.clientX - rect.left,
                                y = event.clientY - rect.top,
                                s;

                            x = Math.min(Math.max(x, 0), rect.width) / (rect.width / 100);
                            y = Math.min(Math.max(y, 0), rect.height) / (rect.height / 100);

                            var v = 100 - y,
                                l = (2 - x / 100) * v / 2;

                            hsl[1] = x * v / (l < 50 ? l * 2 : 200 - l * 2);
                            hsl[2] = l;

                            cursor.style.left = x + '%';
                            cursor.style.top = y + '%';

                            palette.nextSibling.children[0].style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';

                            event.preventDefault();
                        }

                        function mouseup() {
                            window.removeEventListener('mousemove', mousemove);
                            window.removeEventListener('mouseup', mouseup);
                        }

                        window.addEventListener('mousemove', mousemove);
                        window.addEventListener('mouseup', mouseup);
                    }
                },

                cursor: {
                    component: 'div',
                    class: 'satus-color-picker__cursor',
                    style: {
                        'left': s * 100 + '%',
                        'top': 100 - v * 100 + '%'
                    }
                }
            },
            section: {
                component: 'section',
                variant: 'color',

                color: {
                    component: 'div',
                    class: 'satus-color-picker__color',
                    style: {
                        'backgroundColor': 'rgb(' + this.color.value.join(',') + ')'
                    }
                },
                hue: {
                    component: 'slider',
                    class: 'satus-color-picker__hue',
                    storage: false,
                    value: hsl[0],
                    max: 360,
                    on: {
                        input: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                hsl = modal.value;

                            hsl[0] = this.storage.value;

                            this.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';
                            this.parentNode.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg, 100%, 50%)';
                        }
                    }
                }
            },
            actions: {
                component: 'section',
                variant: 'actions',

                reset: {
                    component: 'button',
                    text: 'reset',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentElement;

                            component.color.value = component.skeleton.value || [0, 0, 0];

                            modal.rendered.close();
                        }
                    }
                },
                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.skeleton.parentSkeleton.parentSkeleton.rendered.close();
                        }
                    }
                },
                ok: {
                    component: 'button',
                    text: 'OK',
                    on: {
                        click: function () {
                            var modal = this.skeleton.parentSkeleton.parentSkeleton,
                                component = modal.parentElement;

                            component.color.value = satus.color.hslToRgb(modal.value);

                            modal.rendered.close();
                        }
                    }
                }
            }
        }, this.baseProvider.layers[0]);
    });
};
/*--------------------------------------------------------------
>>> LAYERS
--------------------------------------------------------------*/

satus.components.layers = function (component, skeleton) {
	component.path = [];
	component.renderChildren = false;
	component.baseProvider.layers.push(component);

	component.back = function () {
		if (this.path.length > 1) {
			this.path.pop();

			this.open(this.path[this.path.length - 1], false);
		}
	};

	component.open = function (skeleton, history) {
		satus.empty(this);

		var layer = this.createChildElement('div', 'layer');

		if (history !== false) {
			this.path.push(skeleton);
		}

		layer.skeleton = skeleton;
		layer.baseProvider = this.baseProvider;

		satus.render(skeleton, layer, undefined, skeleton.component === 'layers');

		this.dispatchEvent(new Event('open'));
	};

	component.update = function () {
		var layer = this.querySelector('.satus-layers__layer');

		satus.empty(layer);
		satus.render(layer.skeleton, layer);
	};

	component.open(skeleton);
};
/*--------------------------------------------------------------
>>> SLIDER
--------------------------------------------------------------*/

satus.components.slider = function (component, skeleton) {
	var label = component.createChildElement('div', 'label');

	component.min = skeleton.min || 0;
	component.max = skeleton.max || 1;
	component.step = skeleton.step || 1;
	component.percentageStep = 100 / ((component.max - component.min) / component.step);
	component.precision = String(component.step).replace(/[0-9]./, '').length;
	component.inner = label.createChildElement('div', 'inner');
	component.track = component.createChildElement('div', 'track');
	component.track.tabIndex = 0;
	component.slice = component.track.createChildElement('div', 'slice');

	component.valueElement = satus.render({
		component: 'input',
		type: 'number',
		properties: {
			min: component.min,
			max: component.max,
			step: component.step
		},
		on: {
			input: function () {
				var component = this.parentNode.parentNode;

				component.storage.value = Math.min(component.max, Math.max(this.value, component.min));

				component.update();
			}
		}
	}, label);

	if (satus.isset(skeleton.value)) {
		component.storage.value = skeleton.value;
	} else {
		component.storage.value = (component.max < component.min) ? component.min : component.min + (component.max - component.min) / 2;
	}

	component.update = function () {
		this.dataset.value = this.value;

		this.valueElement.value = this.value;

		this.slice.style.width = (this.value - this.min) / ((this.max - this.min) / 100) + '%';
	};

	component.move = function (event) {
		var track = this.track.getBoundingClientRect(),
			x = Math.min(track.width, Math.max(event.clientX - track.left, 0));

		this.value = x / track.width * 100 / this.percentageStep * this.step + this.min;
		this.value = Math.round(this.value / this.step) * this.step;
		this.value = Number(this.value.toFixed(this.precision));

		this.storage.value = this.value;

		this.update();
	};

	component.track.addEventListener('keydown', function (event) {
		if (event.keyCode === 37) {
			this.value -= this.step;
		} else if (event.keyCode === 39) {
			this.value += this.step;
		}

		this.value = Math.min(this.max, Math.max(this.value, this.min));

		this.storage.value = this.value;

		this.update();
	});

	component.track.addEventListener('mousedown', function (event) {
		if (event.button === 0) {
			var component = this.parentNode;

			component.move(event);

			function mousemove(event) {
				event.preventDefault();
				event.stopPropagation();

				component.move(event);

				return false;
			}

			function mouseup() {
				window.removeEventListener('mousemove', mousemove);
				window.removeEventListener('mouseup', mouseup);
			}

			window.addEventListener('mousemove', mousemove);
			window.addEventListener('mouseup', mouseup);
		}
	});

	component.update();
};


satus.components.slider = function (component, skeleton) {
	var track = component.createChildElement('div', 'track'),
		range = track.createChildElement('input', 'range');

	range.type = 'range';
	range.min = skeleton.min || 0;
	range.max = skeleton.max || 1;
	range.step = skeleton.step || 1;
	range.value = component.storage.value || skeleton.value;

	range.addEventListener('input', function () {
		component.storage.value = Number(this.value);
	});

	if (skeleton.on) {
		for (var type in skeleton.on) {
			range.addEventListener(type, function (event) {
				this.parentNode.dispatchEvent(new Event(event.type));
			});
		}
	}
};
