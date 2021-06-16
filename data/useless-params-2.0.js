/* IN DEVELOPMENT */

var USELESS_PARAMS = {
    '9gag.com': {
        'exceptions': [
            '^https?:\\/\\/comment-cdn\\.9gag\\.com\\/.*?comment-list.json\\?'
        ],
        'rules': [
            'ref'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?9gag\\.com'
    },
    'academic.oup.com': {
        'rules': [
            'redirectedFrom'
        ],
        'urlPattern': '^https?:\\/\\/academic\\.oup\\.com'
    },
    'accounts.firefox.com': {
        'rules': [
            'context',
            'entrypoint',
            'form_type'
        ],
        'urlPattern': '^https?:\\/\\/(?:accounts\\.)?firefox\\.com'
    },
    'admitad.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?admitad\\.com.*ulp=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?admitad\\.com'
    },
    'adsensecustomsearchads': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?adsensecustomsearchads(?:\\.[a-z]{2,}){1,}'
    },
    'adtech': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?adtech(?:\\.[a-z]{2,}){1,}'
    },
    'agata88.com': {
        'rules': [
            'source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?agata88\\.com'
    },
    'alabout.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?alabout\\.com.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?alabout\\.com'
    },
    'aliexpress': {
        'rules': [
            'af',
            'aff_request_id',
            'algo_expid',
            'algo_pvid',
            'btsid',
            'cv',
            'dp',
            'gps-id',
            'mall_affr',
            'scm[_a-z-]*',
            'sk',
            'terminal_id',
            'ws_ab_test'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?aliexpress(?:\\.[a-z]{2,}){1,}'
    },
    'allegro.pl': {
        'rules': [
            'reco_id',
            'sid'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?allegro\\.pl'
    },
    'allrecipes.com': {
        'rules': [
            'clickId',
            'internalSource',
            'referringContentType',
            'referringId'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?allrecipes\\.com'
    },
    'amazon': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon(?:\\.[a-z]{2,}){1,}\\/(?:hz\\/reviews-render\\/ajax\\/|message-us\\?|s\\?)',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon(?:\\.[a-z]{2,}){1,}\\/gp\\/.*?(?:redirector.html|cart\\/ajax-update.html|video\\/api\\/)'
        ],
        'rawRules': [
            '\\/ref=[^/?]*'
        ],
        'referralMarketing': [
            'tag'
        ],
        'rules': [
            '[^a-z%0-9]adId',
            '[a-z%0-9]*ie',
            '__mk_[a-z]{1,3}_[a-z]{1,3}',
            '_encoding',
            'aaxitk',
            'ascsubtag',
            'camp',
            'colii?d',
            'creative',
            'creativeASIN',
            'crid',
            'cv_ct_[a-z]+',
            'dchild',
            'field-lbr_brands_browse-bin',
            'hsa_cr_id',
            'keywords',
            'linkCode',
            'ms3_c',
            'p[fd]_rd_[a-z]*',
            'qid',
            'qualifier',
            'refRID',
            'ref_?',
            'rnid',
            's',
            'sb-ci-[a-z]+',
            'smid',
            'spIA',
            'sprefix',
            'srs?',
            'th'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon(?:\\.[a-z]{2,}){1,}'
    },
    'amazon search': {
        'rawRules': [
            '\\/ref=[^/?]*'
        ],
        'referralMarketing': [
            'tag'
        ],
        'rules': [
            '[^a-z%0-9]adId',
            '[a-z%0-9]*ie',
            '__mk_[a-z]{1,3}_[a-z]{1,3}',
            '_encoding',
            'aaxitk',
            'ascsubtag',
            'camp',
            'colii?d',
            'creative',
            'creativeASIN',
            'crid',
            'cv_ct_[a-z]+',
            'dchild',
            'field-lbr_brands_browse-bin',
            'hsa_cr_id',
            'keywords',
            'linkCode',
            'ms3_c',
            'p[fd]_rd_[a-z]*',
            'qid',
            'qualifier',
            'refRID',
            'ref_?',
            'rnid',
            'sb-ci-[a-z]+',
            'smid',
            'spIA',
            'sprefix',
            'srs?',
            'th'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon(?:\\.[a-z]{2,}){1,}\\/s\\?'
    },
    'amazon-adsystem': {
        'completeProvider': true,
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon-adsystem(?:\\.[a-z]{2,}){1,}\\/v3\\/oor\\?'
        ],
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon-adsystem(?:\\.[a-z]{2,}){1,}\\/x\\/c\\/.+?\\/([^&]+)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon-adsystem(?:\\.[a-z]{2,}){1,}'
    },
    'anonym.to': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?anonym\\.to.*\\?([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?anonym\\.to'
    },
    'apple.com': {
        'rules': [
            'app',
            'ign-itsc[a-z]+'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?apple\\.com'
    },
    'argos.co.uk': {
        'rules': [
            'clickOrigin',
            'istBid',
            'istCompanyId',
            'istFeedId',
            'istItemId'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?argos\\.co\\.uk'
    },
    'autoplus.fr': {
        'rules': [
            'dr_tracker',
            'hash',
            'idprob',
            'sending_id',
            'site_id'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?autoplus\\.fr'
    },
    'awstrack.me': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?awstrack\\.me\\/.*\\/(https?.*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?awstrack\\.me'
    },
    'backcountry.com': {
        'referralMarketing': [
            'mr:referralID'
        ],
        'rules': [
            'CMP_ID',
            'CMP_SKU',
            'INT_ID',
            'MER',
            'fl',
            'iv_',
            'k_clickid',
            'mr:adType',
            'mr:device',
            'mr:trackingCode',
            'rmatt',
            'ti'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?backcountry\\.com'
    },
    'bahn.de': {
        'rules': [
            'dbkanal_[0-9]{3}'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bahn\\.de'
    },
    'bestbuy.com': {
        'rules': [
            'acampID',
            'intl',
            'irclickid',
            'irgwc',
            'loc',
            'mpid'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bestbuy\\.com'
    },
    'bf-ad': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bf-ad(?:\\.[a-z]{2,}){1,}'
    },
    'bigfishgames.com': {
        'rawRules': [
            '\\?pc$'
        ],
        'rules': [
            'npc',
            'npi',
            'npv[0-9]+',
            'pc'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bigfishgames\\.com'
    },
    'bilibili.com': {
        'exceptions': [
            '^https?:\\/\\/api\\.bilibili\\.com'
        ],
        'rules': [
            'callback',
            'from',
            'from_source',
            'seid',
            'spm_id_from'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bilibili\\.com'
    },
    'bing': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bing(?:\\.[a-z]{2,}){1,}\\/WS\\/redirect\\/'
        ],
        'rules': [
            'cvid',
            'form',
            'qp',
            'qs',
            'sc',
            'sk',
            'sp'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bing(?:\\.[a-z]{2,}){1,}'
    },
    'bloculus.com': {
        'rules': [
            'tl_[a-z_]+'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?bloculus\\.com'
    },
    'boredpanda.com': {
        'rules': [
            'h'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?boredpanda\\.com'
    },
    'cafepedagogique.net': {
        'rules': [
            'actCampaignType',
            'actId',
            'actSource'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?cafepedagogique\\.net'
    },
    'cell.com': {
        'rules': [
            '_returnURL'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?cell\\.com'
    },
    'ClearURLsTest': {
        'redirections': [
            '^https?:\\/\\/kevinroebert\\.gitlab\\.io\\/ClearUrls\\/void\\/index\\.html\\?url=([^&]*)'
        ],
        'rules': [
            'test'
        ],
        'urlPattern': '^https?:\\/\\/kevinroebert\\.gitlab\\.io\\/ClearUrls\\/void\\/index\\.html'
    },
    'ClearURLsTest2': {
        'redirections': [
            '^https?:\\/\\/test\\.clearurls\\.xyz\\/void\\/index\\.html\\?url=([^&]*)'
        ],
        'rules': [
            'test'
        ],
        'urlPattern': '^https?:\\/\\/test\\.clearurls\\.xyz\\/void\\/index\\.html'
    },
    'ClearURLsTestBlock': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/kevinroebert\\.gitlab\\.io\\/ClearUrls\\/void\\/block\\.svg'
    },
    'ClearURLsTestBlock2': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/test\\.clearurls\\.xyz\\/void\\/block\\.svg'
    },
    'cnbc.com': {
        'rules': [
            '__source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?cnbc\\.com'
    },
    'cnet': {
        'rules': [
            'ftag'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?cnet\\.com'
    },
    'contentpass': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?contentpass\\.(?:net|de)'
    },
    'curseforge.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?curseforge\\.com\\/linkout\\?remoteUrl=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?curseforge\\.com'
    },
    'dailycodingproblem.com': {
        'rules': [
            'email'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?dailycodingproblem\\.com'
    },
    'deviantart.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?deviantart\\.com\\/.*?\\/outgoing\\?(.*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?deviantart\\.com'
    },
    'diepresse.com': {
        'rules': [
            'from',
            'xt_at',
            'xtor'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?diepresse\\.com'
    },
    'digidip.net': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?digidip\\.net.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?digidip\\.net'
    },
    'disq.us': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?disq\\.us\\/.*?url=([^&]*)%3A'
        ],
        'rules': [
            'cuid'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?disq\\.us'
    },
    'doubleclick': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?doubleclick(?:\\.[a-z]{2,}){1,}\\/.*?tag_for_child_directed_treatment=;%3F([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?doubleclick(?:\\.[a-z]{2,}){1,}'
    },
    'dpbolvw.net': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?dpbolvw\\.net.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?dpbolvw\\.net'
    },
    'ebay': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?rover\\.ebay(?:\\.[a-z]{2,}){1,}\\/rover.*mpre=([^&]*)'
        ],
        'rules': [
            '_from',
            '_trkparms',
            '_trksid',
            'hash'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?ebay(?:\\.[a-z]{2,}){1,}'
    },
    'effiliation.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?effiliation\\.com.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?effiliation\\.com'
    },
    'epicgames.com': {
        'rules': [
            'epic_affiliate',
            'epic_gameId'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?epicgames\\.com'
    },
    'europe1.fr': {
        'rules': [
            'xtor'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?europe1\\.fr'
    },
    'exactag.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?exactag\\.com.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?exactag\\.com'
    },
    'facebook': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/.*?(plugins|ajax)\\/',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/dialog\\/(?:share|send)',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/groups\\/member_bio\\/bio_dialog\\/',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/photo\\.php\\?',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/photo\\/download\\/',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/privacy\\/specific_audience_selector_dialog\\/'
        ],
        'redirections': [
            '^https?:\\/\\/l[a-z]?\\.facebook\\.com/l\\.php\\?.*?u=(https?%3A%2F%2F[^&]*)'
        ],
        'rules': [
            '[a-z]*ref[a-z]*',
            '__tn__',
            '__xts__(?:\\[|%5B)\\d(?:\\]|%5D)',
            'action_history',
            'app',
            'comment_tracking',
            'dti',
            'eid',
            'ftentidentifier',
            'hc_[a-z_%\\[\\]0-9]*',
            'ls_ref',
            'padding',
            'pageid',
            'video_source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com'
    },
    'flexlinkspro.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?flexlinkspro\\.com.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?flexlinkspro\\.com'
    },
    'fls-na.amazon': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?fls-na\\.amazon(?:\\.[a-z]{2,}){1,}'
    },
    'gate.sc': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?gate\\.sc\\/.*?url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?gate\\.sc'
    },
    'giphy.com': {
        'rules': [
            'ref'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?giphy\\.com'
    },
    'github.com': {
        'rules': [
            'email_source',
            'email_token'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?github\\.com'
    },
    'globalRules': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?(?:cloudflare\\.com|prismic\\.io|tangerine\\.ca|gitlab\\.com)',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?agenciatributaria\\.gob\\.es',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?amazon(?:\\.[a-z]{2,}){1,}\\/message-us\\?',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?battle\\.net\\/login',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/(?:login_alerts|ajax|should_add_browser)/',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?facebook\\.com\\/groups\\/member_bio\\/bio_dialog\\/',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?gcsip\\.(?:com|nl)[^?]*\\?.*?&?ref_?=.',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?gog\\.com\\/click\\.html',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?matrix\\.org\\/_matrix\\/',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?onet\\.pl\\/[^?]*\\?.*?utm_campaign=.',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?stripe\\.com\\/[^?]+.*?&?referrer=[^/?&]*',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tweakers\\.net\\/ext\\/lt\\.dsp\\?.*?(?:%3F)?&?ref_?=.',
            '^https?:\\/\\/[^/]+/[^/]+/[^/]+\\/-\\/refs\\/switch[^?]*\\?.*?&?ref_?=.',
            '^https?:\\/\\/api\\.bilibili\\.com',
            '^https?:\\/\\/api\\.taiga\\.io',
            '^https?:\\/\\/authorization\\.td\\.com',
            '^https?:\\/\\/blizzard\\.com\\/oauth2',
            '^https?:\\/\\/bugtracker\\.[^/]*\\/[^?]+\\?.*?&?ref_?=[^/?&]*',
            '^https?:\\/\\/comment-cdn\\.9gag\\.com\\/.*?comment-list.json\\?',
            '^https?:\\/\\/git\\.[^/]*\\/[^?]+\\?.*?&?ref_?=[^/?&]*',
            '^https?:\\/\\/kreditkarten-banking\\.lbb\\.de',
            '^https?:\\/\\/login\\.ingbank\\.pl',
            '^https?:\\/\\/login\\.meijer\\.com\\/.*?\\?ref=',
            '^https?:\\/\\/login\\.progressive\\.com',
            '^https?:\\/\\/myaccount.google(?:\\.[a-z]{2,}){1,}',
            '^https?:\\/\\/privacy\\.vakmedianet\\.nl\\/.*?ref=',
            '^https?:\\/\\/sso\\.serverplan\\.com\\/manage2fa\\/check\\?ref=',
            '^https?:\\/\\/support\\.steampowered\\.com',
            '^https?:\\/\\/www\\.contestgirl\\.com',
            '^https?:\\/\\/www\\.cyberport\\.de\\/adscript\\.php',
            '^https?:\\/\\/www\\.sephora\\.com\\/api\\/',
            '^https?:\\/\\/www\\.tinkoff\\.ru',
            '^wss?:\\/\\/(?:[a-z0-9-]+\\.)*?zoom\\.us'
        ],
        'rules': [
            '(?:%3F)?[a-z]?mc',
            '(?:%3F)?__twitter_impression',
            '(?:%3F)?_ga',
            '(?:%3F)?_openstat',
            '(?:%3F)?action_(?:object|type|ref)_map',
            '(?:%3F)?cmpid',
            '(?:%3F)?dclid',
            '(?:%3F)?fb_(?:source|ref)',
            '(?:%3F)?fb_action_(?:types|ids)',
            '(?:%3F)?fbclid',
            '(?:%3F)?ga_[a-z_]+',
            '(?:%3F)?gclid',
            '(?:%3F)?gs_l',
            '(?:%3F)?hmb_(?:campaign|medium|source)',
            '(?:%3F)?mkt_tok',
            '(?:%3F)?os_ehash',
            '(?:%3F)?otm_[a-z_]*',
            '(?:%3F)?ref_?',
            '(?:%3F)?referrer',
            '(?:%3F)?spm',
            '(?:%3F)?tracking_source',
            '(?:%3F)?utm(?:_[a-z_]*)?',
            '(?:%3F)?vn(?:_[a-z]*)+',
            '(?:%3F)?wt_?z?mc',
            '(?:%3F)?wtrid',
            '(?:%3F)?yclid',
            'Echobox'
        ],
        'urlPattern': '.*'
    },
    'gog.com': {
        'rules': [
            'link_id',
            'track_click'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?gog\\.com'
    },
    'google': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}(?:\\/upload)?\\/drive\\/',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}\\/(?:appsactivity|aclk\\?)',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}\\/(?:complete\\/search|setprefs|searchbyimage)',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}\\/s\\?tbm=map.*?gs_[a-z]*=.',
            '^https?:\\/\\/(?:docs|accounts)\\.google(?:\\.[a-z]{2,}){1,}',
            '^https?:\\/\\/client-channel\\.google\\.com\\/client-channel.*?zx=.',
            '^https?:\\/\\/drive\\.google\\.com\\/videoplayback',
            '^https?:\\/\\/hangouts\\.google\\.com\\/webchat.*?zx=.',
            '^https?:\\/\\/mail\\.google\\.com\\/mail\\/u\\/',
            '^https?:\\/\\/news\\.google\\.com.*\\?hl=.'
        ],
        'forceRedirection': true,
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}\\/.*?adurl=([^&]+)',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}\\/amp\\/s\\/([^&]+)',
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}\\/url\\?.*?(?:url|q)=(https?[^&]+)'
        ],
        'referralMarketing': [
            'referrer'
        ],
        'rules': [
            '_u',
            'aqs',
            'atyp',
            'bi[a-z]*',
            'btn[a-z]*',
            'cad',
            'cad',
            'cd',
            'cd',
            'dcr',
            'dpr',
            'ei',
            'esrc',
            'gfe_[a-z]*',
            'gs_[a-z]*',
            'gws_[a-z]*',
            'i-would-rather-use-firefox',
            'ie',
            'je',
            'oq',
            'rlz',
            'sa',
            'sei',
            'site',
            'source',
            'sourceid',
            'sxsrf',
            'uact',
            'uact',
            'usg',
            'ved',
            'vet',
            'zx'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}'
    },
    'googleadservices': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?googleadservices\\.com\\/.*?adurl=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?googleadservices\\.com'
    },
    'googleSearch': {
        'rules': [
            'client',
            'sclient'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?google(?:\\.[a-z]{2,}){1,}\\/search\\?'
    },
    'googlesyndication': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?googlesyndication\\.com'
    },
    'govdelivery.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?links\\.govdelivery\\.com.*\\/track\\?.*(https?:\\/\\/.*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?govdelivery\\.com'
    },
    'healio.com': {
        'rules': [
            'ecp',
            'm_bt'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?healio\\.com'
    },
    'hhdotru': {
        'rules': [
            'exp',
            'grpos',
            'plim',
            'ptl',
            'stl',
            'swnt',
            't',
            'vss'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?hh\\.ru'
    },
    'hlserve.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?hlserve\\.com.*dest=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?hlserve\\.com'
    },
    'humblebundle.com': {
        'referralMarketing': [
            'partner'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?humblebundle\\.com'
    },
    'imdb.com': {
        'rules': [
            'pf_rd_[a-z]*',
            'ref_'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?imdb\\.com'
    },
    'imgsrc.ru': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?dlp\\.imgsrc\\.ru\\/go\\/\\d+\\/\\d+\\/\\d+\\/([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?imgsrc\\.ru'
    },
    'indeed': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?indeed\\.com\\/rc\\/clk'
        ],
        'rules': [
            '[a-z]*tk',
            'alid',
            'from'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?indeed\\.com'
    },
    'instagram': {
        'redirections': [
            '.*u=([^&]*)'
        ],
        'rules': [
            'igshid'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?instagram\\.com'
    },
    'lazada.com.my': {
        'rules': [
            'ad_src',
            'cid',
            'did',
            'impsrc',
            'mp',
            'pa',
            'pos'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?lazada\\.com\\.my'
    },
    'LinkedIn': {
        'rules': [
            'li[a-z]{2}',
            'refId',
            'trk'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?linkedin\\.com'
    },
    'LinkedIn Learning': {
        'rules': [
            'u'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?linkedin\\.com\\/learning'
    },
    'linksynergy.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?linksynergy\\.com\\/.*?murl=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?linksynergy\\.com'
    },
    'mailpanion.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?mailpanion\\.com.*destination=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?mailpanion\\.com'
    },
    'mailtrack.io': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?mailtrack\\.io.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?mailtrack\\.io'
    },
    'marketscreener.com': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?marketscreener\\.com\\/search\\/\\?'
        ],
        'rules': [
            'RewriteLast',
            'aComposeInputSearch',
            'add_mots',
            'countview',
            'lien',
            'mots',
            'noredirect',
            'type_recherche',
            'type_recherche_forum'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?marketscreener\\.com'
    },
    'marketscreener.com search': {
        'rules': [
            'RewriteLast',
            'aComposeInputSearch',
            'countview',
            'lien',
            'noredirect',
            'type_recherche',
            'type_recherche_forum'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?marketscreener\\.com\\/search\\/\\?'
    },
    'medium.com': {
        'rules': [
            'source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?medium\\.com'
    },
    'meetup.com': {
        'rules': [
            '_xtd',
            'rv'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?meetup\\.com'
    },
    'messenger.com': {
        'redirections': [
            '^https?:\\/\\/l\\.messenger\\.com\\/l\\.php\\?u=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?messenger\\.com'
    },
    'moosejaw.com': {
        'rules': [
            'cm_lm',
            'cm_mmc',
            'spJobID',
            'spMailingID',
            'spReportId',
            'spUserID',
            'webUserId'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?moosejaw\\.com'
    },
    'mozaws.net': {
        'redirections': [
            'https?:\\/\\/[^/]+\\/v1\\/[0-9a-f]{64}\\/(.*)'
        ],
        'urlPattern': 'https?:\\/\\/outgoing\\.prod\\.mozaws\\.net\\/'
    },
    'mozilla.org': {
        'exceptions': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?mozilla.org\\/api'
        ],
        'rules': [
            'platform',
            'redirect_source',
            'src'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?mozilla\\.org'
    },
    'mozillazine.org': {
        'rules': [
            'sid'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?mozillazine\\.org'
    },
    'mysku.ru': {
        'redirections': [
            '^https?:\\/\\/mysku\\.ru.*r=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/mysku\\.ru'
    },
    'net-parade.it': {
        'rules': [
            'pl'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?net\\-parade\\.it'
    },
    'netflix': {
        'rules': [
            'jb[a-z]*?',
            'tctx',
            'trackId'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?netflix.com'
    },
    'newsletter.lidl.com': {
        'rules': [
            'x'
        ],
        'urlPattern': '^https?:\\/\\/newsletter\\.lidl(?:\\.[a-z]{2,}){1,}'
    },
    'newyorker.com': {
        'rules': [
            'bxid',
            'cndid',
            'esrc',
            'mbid',
            'source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?newyorker\\.com'
    },
    'norml.org': {
        'rules': [
            'can_id',
            'email_referrer',
            'email_subject',
            'link_id',
            'source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?norml\\.org'
    },
    'nypost.com': {
        'rules': [
            '__twitter_impression'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?nypost\\.com'
    },
    'nytimes.com': {
        'rules': [
            'smid'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?nytimes\\.com'
    },
    'onet.pl': {
        'rules': [
            'srcc',
            'utm_medium',
            'utm_source',
            'utm_v'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?onet\\.pl'
    },
    'ozon.ru': {
        'rules': [
            'partner'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?ozon\\.ru'
    },
    'prvnizpravy.cz': {
        'rules': [
            'xid'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?prvnizpravy\\.cz'
    },
    'readdc.com': {
        'rules': [
            'ref'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?readdc\\.com'
    },
    'realtor.com': {
        'rules': [
            'MID',
            'RID',
            'ex',
            'identityID'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?realtor\\.com'
    },
    'reddit': {
        'redirections': [
            '^https?:\\/\\/out\\.reddit\\.com\\/.*?url=([^&]*)'
        ],
        'rules': [
            '%243p',
            '%24deep_link',
            '%24original_url',
            '\\$3p',
            '\\$deep_link',
            '\\$original_url',
            '_branch_match_id',
            'correlation_id',
            'ref_campaign',
            'ref_source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?reddit.com'
    },
    'redfin.com': {
        'rules': [
            'riftinfo'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?redfin\\.com'
    },
    'roblox.com': {
        'rules': [
            'refPageId'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?roblox\\.com'
    },
    'rutracker.org': {
        'redirections': [
            '.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?rutracker\\.org'
    },
    'shutterstock.com': {
        'rules': [
            'src'
        ],
        'urlPattern': 'https?:\\/\\/([a-z0-9-.]*\\.)shutterstock\\.com'
    },
    'signtr.website': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?signtr\\.website.*redirect=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?signtr\\.website'
    },
    'site.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?site\\.com.*?\\?to=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?site\\.com'
    },
    'site2.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?site2\\.com.*?\\?.*=(.*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?site2\\.com'
    },
    'site3.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?site3\\.com.*?\\?r=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?site3\\.com'
    },
    'smartredirect.de': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?smartredirect\\.de.*?url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?smartredirect\\.de'
    },
    'snapchat.com': {
        'rules': [
            'sc_referrer',
            'sc_ua'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?snapchat\\.com'
    },
    'SPIEGEL ONLINE': {
        'rules': [
            'b'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?spiegel\\.de'
    },
    'spotify.com': {
        'rules': [
            'si'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?spotify\\.com'
    },
    'srvtrck.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?srvtrck\\.com.*url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?srvtrck\\.com'
    },
    'steamcommunity': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?steamcommunity\\.com\\/linkfilter\\/\\?url=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?steamcommunity\\.com'
    },
    'steampowered': {
        'rules': [
            'snr'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?steampowered\\.com'
    },
    'support.mozilla.org': {
        'rules': [
            'as'
        ],
        'urlPattern': '^https?:\\/\\/(?:support\\.)?mozilla\\.org'
    },
    'swp.de': {
        'rules': [
            'source'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?swp\\.de'
    },
    'taobao.com': {
        'rules': [
            'abbucket',
            'abtest',
            'acm',
            'algo_expid',
            'algo_pvid',
            'ali_refid',
            'ali_trackid',
            'app',
            'bftRwd',
            'bftTag',
            'cpp',
            'impid',
            'lygClk',
            'mytmenu',
            'ns',
            'pos',
            'price',
            'pvid',
            'scene',
            'scm[_a-z-]*',
            'share_crt_v',
            'shareurl',
            'short_name',
            'sourceType',
            'sp_tk',
            'spm',
            'suid',
            'trackInfo',
            'turing_bucket',
            'un',
            'ut_sk',
            'utkn',
            'utparam'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?taobao\\.com'
    },
    'tb.cn': {
        'rules': [
            'sm'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tb\\.cn'
    },
    'tchibo.de': {
        'rules': [
            'wbdcd'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tchibo\\.de'
    },
    'techcrunch': {
        'rules': [
            'ncid',
            'sr',
            'sr_share'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?techcrunch\\.com'
    },
    'theguardian.com': {
        'rules': [
            'CMP'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?theguardian\\.com'
    },
    'thunderbird.net': {
        'rules': [
            'src'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?thunderbird\\.net'
    },
    'tiktok.com': {
        'rules': [
            '_d',
            'preview_pb',
            'share_app_name',
            'share_iid',
            'source',
            'timestamp',
            'u_code',
            'user_id'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tiktok\\.com'
    },
    'tmall.com': {
        'rules': [
            'abbucket',
            'abtest',
            'acm',
            'activity_id',
            'algo_expid',
            'algo_pvid',
            'ali_refid',
            'ali_trackid',
            'app',
            'bftRwd',
            'bftTag',
            'cpp',
            'impid',
            'lygClk',
            'mytmenu',
            'ns',
            'pos',
            'price',
            'pvid',
            'scene',
            'scm[_a-z-]*',
            'share_crt_v',
            'shareurl',
            'short_name',
            'sourceType',
            'sp_tk',
            'suid',
            'trackInfo',
            'turing_bucket',
            'un',
            'user_number_id',
            'ut_sk',
            'utkn',
            'utparam'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tmall\\.com'
    },
    'tradedoubler.com': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tradedoubler\\.com.*(?:url|_td_deeplink)=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tradedoubler\\.com'
    },
    'tweakers': {
        'rules': [
            'nb',
            'u'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?tweakers\\.net'
    },
    'twitch': {
        'rules': [
            'tt_content',
            'tt_medium'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?twitch\\.com'
    },
    'twitter': {
        'rules': [
            '(?:ref_?)?src',
            'cn',
            'ref_url',
            's'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?twitter.com'
    },
    'vitamix.com': {
        'rules': [
            '_requestid',
            'bi',
            'cid',
            'di',
            'dl',
            'sd'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?vitamix\\.com'
    },
    'vivaldi': {
        'rules': [
            'pk_campaign',
            'pk_kwd'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?vivaldi\\.com'
    },
    'vk.com': {
        'redirections': [
            '^https?:\\/\\/vk\\.com\\/away\\.php\\?to=([^&]*)'
        ],
        'urlPattern': '^https?:\\/\\/vk\\.com'
    },
    'walmart.com': {
        'rules': [
            'ath[a-z]*',
            'u1'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?walmart\\.com'
    },
    'woot.com': {
        'rules': [
            'ref_?'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?woot\\.com'
    },
    'wps.com': {
        'rules': [
            'from'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?wps\\.com'
    },
    'yandex': {
        'rules': [
            'lr',
            'redircnt'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?(?:yandex(?:\\.[a-z]{2,}){1,}|ya\\.ru)'
    },
    'youku.com': {
        'rules': [
            'tpa'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?youku\\.com'
    },
    'youtube': {
        'redirections': [
            '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?youtube\\.com\\/redirect?.*?q=([^&]*)'
        ],
        'rules': [
            'feature',
            'gclid',
            'kw'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?youtube\\.com'
    },
    'youtube_apiads': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?youtube\\.com\\/api\\/stats\\/ads'
    },
    'youtube_pagead': {
        'completeProvider': true,
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?youtube\\.com\\/pagead'
    },
    'zillow.com': {
        'rules': [
            'rtoken'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?zillow\\.com'
    },
    'zoho.com': {
        'rules': [
            'iref'
        ],
        'urlPattern': '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?zoho\\.com'
    }
};