location.hash = 'home'

var searchNode = document.querySelector('#search')

var renderNavBar = function(){
	var navBarHtml = ''
	navBarHtml += '<div id="nav-bar">'
	navBarHtml += 	'<div id="menu">'
	navBarHtml +=		'<a href="#home"><span>Home</span></a>'
	navBarHtml +=		'<span>Clothing & Accesories</span>'
	navBarHtml +=		'<span>Jewelry</span>'
	navBarHtml +=		'<span>Crafts Supplies & Tools</span>'
	navBarHtml +=		'<span>Weddings</span>'
	navBarHtml +=		'<span>Entertainment</span>'
	navBarHtml +=		'<span>Home&Living</span>'
	navBarHtml +=		'<span>Kids & Baby</span>'
	navBarHtml +=		'<span>Vintage</span>'
	navBarHtml += 	'<input id="search" placeholder="Search for items"></input>'
	navBarHtml += 	'</div>'
	navBarHtml += '</div>'
	return navBarHtml
}

var ListCollection = Backbone.Collection.extend({
	url: 'https://openapi.etsy.com/v2/listings/active.js',
	_apikey: 'vjvzvfjyg9jd3mim1gomdhq5',
	parse: function(rawJSONP){
		console.log(rawJSONP)
		return rawJSONP.results
	}
})

var DetailModel = Backbone.Model.extend({
	url: 'https://openapi.etsy.com/v2/listings/',
	_apikey: 'vjvzvfjyg9jd3mim1gomdhq5',
	parse: function(rawJSONP){
		console.log(rawJSONP)
		return rawJSONP.results
	}

})

var NavigationModel = Backbone.Model.extend({
	url: 'https://openapi.etsy.com/v2/shops/',
	_apikey: 'vjvzvfjyg9jd3mim1gomdhq5',
	parse: function(rawJSONP){
		console.log(rawJSONP)
		return rawJSONP.results
	}
})


var ListView = Backbone.View.extend({
	el: document.querySelector('#container'),

	events: {
		'keydown input': '_handleSearch',
		'click .listing': '_goToListDetail'
	},

	_goToListDetail: function(eventObj){
		location.hash = 'details/' + eventObj.currentTarget.getAttribute('data-id')
	},

	_handleSearch: function(eventObj){
		if(eventObj.keyCode === 13){
			location.hash = 'search/' + eventObj.target.value
		}
	},

	initialize: function(collection){
		this.coll = collection
		var thisView = this
		boundRender = this._render.bind(thisView)
		this.coll.on('sync', boundRender)
		
	},
	_render: function(){
		console.log('here comes this.coll',this.coll)
		var collArr= this.coll.models
		var htmlString = ''
			htmlString = renderNavBar()
			htmlString += '<div id="list-wrapper">'
		for(var i = 0; i < collArr.length; i++){
			var listing = collArr[i].attributes
			htmlString += '<div data-id="' + listing.listing_id + '" class="listing">'
			htmlString += 	'<img src="' + listing.Images[0].url_170x135 +'">'
			htmlString += 	'<div class="title">' + listing.title + '</div>'
			htmlString +=	'<div class="info">'
			htmlString +=		'<div class="shop-name">' + listing.Shop.shop_name + '</div>'
			htmlString += 		'<div class="price">$' + listing.price + '</div>'
			htmlString +=	'</div>'
			htmlString += '</div>'
		}
		htmlString += '</div>'
		this.el.innerHTML = htmlString
	}
})

var DetailView = Backbone.View.extend({
	el: document.querySelector('#container'),

	events:{
		'click #previous': '_findPreviousShopListing',
		'click #next': '_findNextShopListing'
	},

	_findPreviousShopListing: function(){
		location.hash = 'previous/' + this.product.attributes['0'].Shop.shop_id
	},

	initialize: function(product){
		var viewType = this
		this.product = product
		var boundRender = this._render.bind(viewType)
		product.on('sync', boundRender)
	},
	_render: function(){
		console.log('here comes this in detail_render', this.product)
		productObject = this.product.attributes['0']
		productImg = productObject.Images[0].url_570xN 
		var htmlString = ''
		htmlString = renderNavBar()
		htmlString += '<div id="detail-view">'
		htmlString += 	'<div id="previous" class="arrow">&lt</div>'
		htmlString += 	'<div id="product-detail">'
		htmlString +=		'<div id="product-image"><img src="' + productImg + '"></div>'
		htmlString +=		'<div id="product-desc">' + productObject.description + '</div>'
		htmlString += 	'</div>'
		htmlString += 	'<div id="next" class="arrow">&gt</div>'
		htmlString += '</div>'
		this.el.innerHTML =htmlString
	}
})

var PreviousView = Backbone.Model.extend({

})

var EtsyRouter = Backbone.Router.extend({
	routes:{
		'home': 'showHomePage',
		'search/:query': 'showSearchResults',
		'details/:id': 'showDetails',
		'*catchall': 'redirectToHome'
	},

	showHomePage: function(){
		var activeCollections = new ListCollection()
		activeCollections.fetch({
			dataType: 'jsonp',
			data: {
				api_key: activeCollections._apikey,
				includes: 'Images,Shop'
			}
		})
		new ListView(activeCollections)
	},

	showSearchResults: function(keyword){
		//create a new collection
		var searchedCollection = new ListCollection()
		//fetch search result
		searchedCollection.fetch({
			dataType: 'jsonp',
			data:{
				api_key: searchedCollection._apikey,
				includes: 'Images,Shop',
				keywords: keyword
			}
		})
		//create new view for the collection
		new ListView(searchedCollection)
	},

	showDetails: function(listID){
	//create new detail model
	var listingDetailModel = new DetailModel()
	//update fetch url
	listingDetailModel.url += listID + '.js'
	//fetch the listing model via API
	listingDetailModel.fetch({
		dataType: 'jsonp',
		data:{
			api_key: listingDetailModel._apikey,
			includes: 'Images,Shop'
		}
	})
	//create new detail view
	new DetailView(listingDetailModel)
},

	initialize: function(){
		Backbone.history.start()
	}
})



new EtsyRouter()
