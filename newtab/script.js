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
			storage: false,
			placeholder: function () {
				var placeholder = satus.locale.get('searchEngineOrTypeAUrl'),
					search_engine = satus.storage.get('searchEngine');

				if (this.skeleton.engines[search_engine]) {
					search_engine = this.skeleton.engines[search_engine].name;
				} else {
					search_engine = this.skeleton.engines['google'].name;
				}

				return placeholder.replace('{ENGINE}', search_engine);
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

			button: {
				component: 'button',

				svg: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24',
						'fill': 'currentColor'
					},

					path: {
						component: 'path',
						attr: {
							'd': 'm20.5 19-5.7-5.7a6.5 6.5 0 1 0-1.5 1.5l5.7 5.7 1.5-1.5zM5 9.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z'
						}
					}
				},
				on: {
					click: function () {
						this.skeleton.parentSkeleton.rendered.focus();
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