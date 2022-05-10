/*--------------------------------------------------------------
>>> SCRIPT
----------------------------------------------------------------
# Skeleton
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# SKELETON
--------------------------------------------------------------*/

var skeleton = {
	component: 'base',

	header: {
		component: 'header',

		section_left: {
			component: 'section',
			variant: 'align-start'
		},
		search: {
			component: 'text-field',
			placeholder: 'searchEngineOrTypeAUrl',
			storage: false,
			on: {
				render: function () {
					var placeholder = satus.locale.get(this.skeleton.placeholder),
						search_engine = satus.storage.get('searchEngine');

					if (this.skeleton.engines[search_engine]) {
						search_engine = this.skeleton.engines[search_engine].name;
					} else {
						search_engine = this.skeleton.engines['google'].name;
					}

					this.input.placeholder = placeholder.replace('{ENGINE}', search_engine);
				}
			},
			engines: {
				google: {
					name: 'Google',
					url: 'https://www.google.com/search?q=',
					favicon: 'https://www.google.com/favicon.ico'
				},
				youtube: {
					name: 'YouTube',
					url: 'https://youtube.com/?q=',
					favicon: 'https://youtube.com/favicon.ico'
				},
				duckduckgo: {
					name: 'DuckDuckGo',
					url: 'https://duckduckgo.com/?q=',
					favicon: 'https://duckduckgo.com/favicon.ico'
				},
				bing: {
					name: 'Bing',
					url: 'https://www.bing.com/search?q=',
					favicon: 'https://www.bing.com/favicon.ico'
				},
				yahoo: {
					name: 'Bing',
					url: 'https://search.yahoo.com/',
					favicon: 'https://search.yahoo.com/favicon.ico'
				},
				ecosia: {
					name: 'Ecosia',
					url: 'https://www.ecosia.org/search?q=',
					favicon: 'https://cdn-static.ecosia.org/assets/images/ico/favicon.ico'
				}
			},

			icon: {
				component: 'button',
				on: {
					render: function () {
						var search_engine = satus.storage.get('searchEngine'),
							favicon = '';

						if (this.parentNode.skeleton.engines[search_engine]) {
							favicon = this.parentNode.skeleton.engines[search_engine].favicon;
						} else {
							favicon = this.parentNode.skeleton.engines['google'].favicon;
						}

						this.style.backgroundImage = 'url(' + favicon + ')';
					}
				}
			}
		},
		section_right: {
			component: 'section',
			variant: 'align-end'
		}
	},
	main: {
		component: 'main',

		sidebar: {
			component: 'sidebar'
		},
		layers: {
			component: 'layers'
		}
	}
};


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.storage.import(function (items) {
	var language = items.language || window.navigator.language;

    satus.locale.import(language, function () {
        satus.render(skeleton);
    }, '_locales/');
});