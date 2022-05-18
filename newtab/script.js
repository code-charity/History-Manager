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
	on: {
		click: function (event) {
			var founded = false;

			for (var i = 0, l = event.path.length; i < l; i++) {
				var element = event.path[i];

				if (typeof element.className === 'string' && element.className.indexOf('satus-search') !== -1) {
					founded = true;
				}
			}

			if (founded === false) {
				skeleton.header.search.rendered.removeAttribute('focus');
			}
		}
	},

	header: {
		component: 'header',

		section_left: {
			component: 'section',
			variant: 'align-start'
		},
		search: {
			component: 'text-field',
			class: 'satus-search',
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
			on: {
				focus: function () {
					this.setAttribute('focus', '');
				},
				input: function () {
					this.skeleton.dropDownMenu.results.rendered.update();

					if (this.value.length > 0) {
						this.setAttribute('focus', '');
						this.setAttribute('results', '');
					} else {
						this.removeAttribute('results');
					}
				},
				keydown: function (event) {
					if (event.keyCode === 13) {
						var list = this.skeleton.dropDownMenu.results.rendered;

						if (list.firstChild) {
							list.firstChild.click();
						}
					}
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
					url: 'https://youtube.com/results?search_query=',
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
					name: 'Yahoo',
					url: 'https://search.yahoo.com/',
					favicon: 'https://search.yahoo.com/favicon.ico'
				},
				ecosia: {
					name: 'Ecosia',
					url: 'https://www.ecosia.org/search?q=',
					favicon: 'https://cdn-static.ecosia.org/assets/images/ico/favicon.ico'
				}
			},
			before: {
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
				}
			},

			dropDownMenu: {
				component: 'div',
				class: 'satus-search__dropdown-menu',

				results: {
					component: 'div',
					class: 'satus-search__results-list',
					properties: {
						update: function () {
							var list = this.skeleton.rendered,
								search_element = this.skeleton.parentSkeleton.parentSkeleton.rendered,
								search_engines = this.skeleton.parentSkeleton.parentSkeleton.engines,
								default_search_engine = satus.storage.get('defaultSearchEngine') || 'google';

							if (satus.isElement(search_element.temporaryEngine)) {
								default_search_engine = search_element.temporaryEngine.name;
							}

							satus.empty(list);

							satus.render({
								component: 'button',
								class: 'satus-search-results__item',
								attr: {
									url: search_engines[default_search_engine].url
								},
								on: {
									click: function () {
										window.open(this.getAttribute('url') + encodeURIComponent(this.parentNode.skeleton.parentSkeleton.parentSkeleton.rendered.value), '_self');
									}
								},
								before: {
									icon: {
										component: 'span',
										class: 'satus-search-results__item-icon',
										style: {
											backgroundImage: 'url(' + search_engines[default_search_engine].favicon + ')'
										}
									}
								},

								query: {
									component: 'span',
									class: 'satus-search-results__item-query',
									text: this.skeleton.parentSkeleton.parentSkeleton.rendered.value
								},
								engine: {
									component: 'span',
									class: 'satus-search-results__item-engine',
									text: '- ' + search_engines[default_search_engine].name + ' ' + 'Search'
								}
							}, list);
						}
					}
				},
				engines: {
					component: 'div',
					class: 'satus-search__engines',
					on: {
						render: function () {
							var search_engines = this.skeleton.parentSkeleton.parentSkeleton.engines;

							satus.render({
								component: 'span',
								text: 'thisTimeSearchWith'
							}, this);

							for (var key in search_engines) {
								var search_engine = search_engines[key];

								satus.render({
									component: 'button',
									variant: 'icon',
									attr: {
										name: key
									},
									style: {
										backgroundImage: 'url(' + search_engine.favicon + ')'
									},
									on: {
										click: function () {
											var name = this.getAttribute('name'),
												search_element = this.parentNode.skeleton.parentSkeleton.parentSkeleton.rendered,
												search_engine = search_element.skeleton.engines[name];

											if (search_element.temporaryEngine) {
												search_element.temporaryEngine.remove();
											}

											search_element.temporaryEngine = satus.render({
												component: 'button',
												class: 'temporary-engine',
												text: search_engine.name,
												properties: {
													name: name,
													data: search_engine
												},
												on: {
													click: function () {
														var search_element = skeleton.header.search.rendered;

														this.remove();

														delete search_element.temporaryEngine;

														search_element.skeleton.dropDownMenu.results.rendered.update();
													}
												}
											});

											search_element.firstChild.after(search_element.temporaryEngine);

											search_element.skeleton.dropDownMenu.results.rendered.update();
										}
									}
								}, this);
							}
						}
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