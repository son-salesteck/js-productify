/**
 * The jQuery plugin productify.
 * @name jQuery.fn.productify()
 * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
 */


(function ($) {
    // $ = jQuery.noConflict();

    /**
     *
     * @typedef {Object} productifyOptions
     * $.fn.productify.defaults.options
     * @property {string} [addBtnSelector]
     * @property {string} [ajax = '/_api/_eshop/'] the url where to query products
     * @property {string} [cartSelector] this define the cart's container to add element in
     * @property {string} [controlSelector] DOM selector to display filter's control
     * @property {string} [dataSrc = 'product'] source of the query
     * @property {Array<fields>} fields all fields of productify
     * @property {fieldsGroupOptions} [fieldsGroup = fieldsGroupOptions] defaults fields  group options
     * @property {string} [idSrc = 'idCode'] data's property to get the id
     * @property {boolean} [image = false]
     * @property {string} [lang = Fn._getLang()] language is sent with ajax data to retrieve elements with the appropriate language
     * @property {string} [merchantId = merchantId()] Merchant's id is sent with ajax data to retrieve the product from that merchant
     * @property {string} [priceSrc = 'price'] data's property to get the price
     * @property {string} [qtySelector]
     * @property {string} [removeBtnSelector]
     * @property {boolean} [search = true] define if process general search or not and draw the search input
     * @property {string} [sessionUrl = '/_api/_eshop/'] url where the cart's operation should send
     * @property {jquerySelector|html} [template] the product's template, can be html string or a jquerySelector
     *
     */

    /**
     * @typedef {Object} fieldsGroupOptions
     * @property {boolean} [_valid = false]
     * @property {string} containerSelector
     * @property {string} data
     * @property {string} idSrc
     * @property {string} options
     * @property {string} template
     * @property {string} [title = '']
     * @property {string} [titleSelector = '']
     */


    /**
     *
     * @constant {string} _apiSrc
     * @description test
     * @type {string}
     * @default '/_api/_eshop/'
     */
    var _apiSrc = '/_api/_eshop/';

    /**
     * Represents a book.
     * @static
     * @function merchantId
     */
    var merchantId = function () {
        return $('[data-merchant-id]').attr('data-merchant-id');
    };


    /**
     * _Productify
     * @type {{_fieldType: {text: string, select: string, checkbox: string, allergen: string, integer: string, radio: string}}}
     * @static
     */
    var _Productify = {
        _fieldType: {
            text: "text",
            select: "select",
            checkbox: "checkbox",
            allergen: "allergen",
            integer: "integer",
            radio: "radio"
        }
    };

    function inArray(arrayCheck, value) {
        if (Fn._isSameType(arrayCheck, [])) {
            if (Fn._isSameType(value, "")) {
                return Fn._isStringNotEmpty(value) && arrayCheck.includes(value);
            } else if (Fn._isSameType(value, [])) {
                return value.some(function (element) {
                    return Fn._isStringNotEmpty(element) && arrayCheck.includes(element);
                });
            }
        }
        return false;
    }

    /**
     *
     * @type {object}
     * @private
     */
    var _Field = {
        _searchableType: [
            _Productify._fieldType.text,
            _Productify._fieldType.integer
        ]
        , render: {
            price: function (data, rowData, field, options) {
                return Fn._intToPrice(data);
            },
            image: function (data, rowData, field, options) {
                return '<img src="' + data + '" class="img-fluid">';
            }

        }
    };

    /**
     * Productify $.fn.productify
     * @module Productify
     * @param {productifyOptions} options
     * @example
     *
     * var productifyOptions  = {
     *      cartSelector: '#cart-items',
     *      idSrc: "idCode",
     *      fieldsGroup: {
     *          idSrc : 'idCode',
     *          title : "name",
     *          data: "categoryIdCode",
     *          template :
     *          "<div>" +
     *          "<h4 class='category-title text-accent text-sm'></h4>" +
     *          "<div class='category-container'></div>" +
     *          "<div class='separator'></div>" +
     *          "</div>",
     *          titleSelector : ".category-title",
     *          containerSelector : ".category-container"
     *      },
     *      fields: [
     *          {
     *              data: "categoryIdCode",
     *              title: "Catégorie",
     *              type: "checkbox",
     *              filterContain : true,
     *              searchable : false,
     *              render : function (data, rowData, field, options) {
     *                  var categoryName = "";
     *                  if (Fn._isStringNotEmpty(data)) {
     *                      // var category = Fn._getObjByProp(allCategory, data, null);
     *                      var category = options.find(function (element) {
     *                          return Object.keys(element)[0] === data;
     *                      });
     *                      if(category !== null && category.hasOwnProperty(data)){
     *                          category = category[data];
     *                      }
     *                      categoryName = Fn._getObjByProp(category, "name", null);
     *                  }
     *                  return categoryName;
     *              }
     *          },
     *          {
     *              data: "price",
     *              title: "Prix",
     *              type: "integer",
     *              render : $.fn.productify.render.price
     *          },
     *          {
     *              data: "idCode",
     *              searchable : false
     *          }, {
     *              data: "imageWebPath",
     *              type: "image",
     *              searchable : false,
     *              render : $.fn.productify.render.image
     *          },
     *          {
     *              data: "name"
     *          },
     *          {
     *              data: "description"
     *          },
     *          {
     *              title: "Allergènes",
     *              data: "allergen",
     *              type: "allergen",
     *              filterContain : false,
     *              searchable : false,
     *              render : $.fn.productify.render.allergen
     *          },
     *          {
     *              title: "Options",
     *              data: "productOptions",
     *              filter : false,
     *              searchable : false
     *          }
     *      ],
     *      qtySelector : '.qty-input',
     *      controlSelector : '.search-controls',
     *      addBtnSelector: '.product-add',
     *      removeBtnSelector: '.cart-item-remove'
     * };
     * $('#product-list').productify(productifyOptions);
     */
    var Productify = $.fn.productify = function productify(options) {

        /**
         * Private property
         */


        /**
         * @private
         * @type {object}
         */
        var settings = fnProductify.static._mergeSetting(options);

        var _productsData = [];

        var _options = {};

        var _productsCart = [];

        var that = this;

        that.settings = settings;

        that.jQuerySelector = this[0];


        var _displayProductsData = [];

        var _lastSearchValue = '';

        /**
         * END Private property
         */


        /**
         * Private functions
         */

        function setData(data) {
            if (Fn._isSameType(data, {}) && !$.isEmptyObject(data)) {
                _productsData = data;
                _displayProductsData = _productsData.slice();
            }
            return _productsData;
        }

        function setOption(options) {
            if (Fn._isSameType(options, []) && !$.isEmptyObject(options)) {
                _options = options;
                $.each(settings.fields, function (index, field) {
                    var data = field[indexes.fieldOptions.data];
                    field[indexes.fieldOptions.options] = Fn._getObjByProp(_options, data, []);
                });
            }
            return _options;
        }

        function addToCart(product, qty) {
            qty = Fn._isNumeric(qty) && parseInt(qty) > 0 ? parseInt(qty) : 1;
            var priceSrc = Fn._getObjByProp(settings, indexes.priceSrc, '');
            if(Fn._isStringNotEmpty(priceSrc)){
                var price = Fn._getObjByProp(product, priceSrc, 0);
                price = parseInt(price);

                var productExtraTotal = Fn._getObjByProp(product, _oIndexes._extraOptionsTotal, 0);
                productExtraTotal = parseInt(productExtraTotal);

                var extraOptions = Fn._getObjByProp(product, _oIndexes._extraOptions, []);

                product[indexes.fieldOptions._qty] = qty;
                product[priceSrc] = price;
                product[_oIndexes._extraOptionsTotal] = productExtraTotal;
                product[_oIndexes._extraOptions] = extraOptions;
                product[indexes._cartElementTotal] = (price + productExtraTotal ) * qty;
            }

            var found = false;
            if(_productsCart.length > 0){
                var foundedIndex = indexOfProductInCart(product);
                if(foundedIndex > -1 && foundedIndex < _productsCart.length){
                    var cartProduct = _productsCart[foundedIndex];
                    if( !$.isEmptyObject(cartProduct) ){
                        cartProduct[indexes.fieldOptions._qty] += qty;

                        var cartPrice = Fn._getObjByProp(cartProduct, priceSrc, 0);
                        cartPrice = parseInt(cartPrice);

                        var cartExtraTotal = Fn._getObjByProp(cartProduct, _oIndexes._extraOptionsTotal, 0);
                        cartExtraTotal = parseInt(cartExtraTotal);

                        var cartExtraOptions = Fn._getObjByProp(cartProduct, _oIndexes._extraOptions, []);

                        cartProduct[priceSrc] = price;
                        cartProduct[_oIndexes._extraOptionsTotal] = cartExtraTotal;
                        cartProduct[_oIndexes._extraOptions] = cartExtraOptions;
                        cartProduct[indexes._cartElementTotal] = (cartPrice + cartExtraTotal ) * qty;
                        found = true;
                    }
                }
            }
            if(found === false){
                product[indexes.fieldOptions._qty] = qty;
                _productsCart.push(product);
            }
            updateSession();

        }

        function indexOfProductInCart(product) {
            var clonedProduct = $.extend({}, product);

            console.log("indexOfProductInCart", {
                clonedProduct: clonedProduct
            });
            delete clonedProduct[indexes.fieldOptions._qty];
            delete clonedProduct[indexes._cartElementTotal];
            return  _productsCart.findIndex(function (elem, index) {
                var cloned = $.extend({}, elem);
                console.log("cloned:"+index, {
                    cloned: cloned
                });
                delete cloned[indexes.fieldOptions._qty];
                delete cloned[indexes._cartElementTotal];
                if( !clonedProduct.hasOwnProperty(_oIndexes._extraOptions)){
                    delete cloned[_oIndexes._extraOptions];
                }
                if( !clonedProduct.hasOwnProperty(_oIndexes._extraOptionsTotal)){
                    delete cloned[_oIndexes._extraOptionsTotal];
                }
                if( !clonedProduct.hasOwnProperty(indexes._cartElementTotal)){
                    delete cloned[indexes._cartElementTotal];
                }
                var strProd = JSON.stringify(clonedProduct);
                var strClone = JSON.stringify(cloned);
                var isSame = strProd === strClone;

                console.log({
                    product: product, clonedProduct : clonedProduct, cloned : cloned, isSame : isSame, strProd : strProd, strClone : strClone
                });
                return isSame;
            });
            // return returnIndex;

        }


        function updateSession() {
            console.log({
                _productsCart : _productsCart
            });
            if (Fn._isStringNotEmpty(settings.sessionUrl)) {
                $.post(settings.sessionUrl, {
                    _q: 'cart', _cartElements: JSON.stringify(_productsCart),
                    // _q: 'cart', _cartElements: _productsCart,
                    merchantId: settings.merchantId, lang: settings.lang, _event: "update"
                }, function () {}, "json").done(function (response) {
                    if (Productify.defaults.debug ) {
                        console.log("_updateSession() called", {
                            productsCart: _productsCart,
                            response: response
                        });
                    }
                    if(response.status === true){
                        var arrayCartElement = response.data;
                        drawCartElement(arrayCartElement);
                    }
                });
            }
        }

        function loadSessionCart() {
            if (Productify.defaults.debug ) {
                console.log("loadSessionCart() called", {});
            }
            if (Fn._isStringNotEmpty(settings.sessionUrl)) {

                $.post(settings.sessionUrl, {
                    _q: 'cart', _event: "load", merchantId: settings.merchantId, lang: settings.lang
                }).done(function (response) {
                    if( Fn._isJsonString(response) ){
                        response = JSON.parse(response);
                        if(response.status === true){
                            var arrayCartElement = response.data;
                            drawCartElement(arrayCartElement);
                        }
                    }
                });
            }
        }

        function drawCartElement(arrayCartElement) {fnProductify.cart._emptyCart(that);
            $.each(arrayCartElement, function (index, cartElement) {
                if (Productify.defaults.debug ) {
                    console.log({cartElement: cartElement});
                }
                var priceSrc = Fn._getObjByProp(settings, indexes.priceSrc, '');
                if(Fn._isStringNotEmpty(priceSrc)){
                    var qty = Fn._getObjByProp(cartElement, indexes.fieldOptions._qty, null);
                    var price = Fn._getObjByProp(cartElement, priceSrc, null);
                    var productExtraTotal = Fn._getObjByProp(cartElement, _oIndexes._extraOptionsTotal, 0);
                    var extraOptions = Fn._getObjByProp(cartElement, _oIndexes._extraOptions, []);
                    if(Fn._isNumeric(qty) && Fn._isNumeric(price) && Fn._isNumeric(productExtraTotal)){
                        cartElement[indexes.fieldOptions._qty] = parseInt(qty);
                        cartElement[priceSrc] = parseInt(price);
                        cartElement[_oIndexes._extraOptionsTotal] = parseInt(productExtraTotal);
                        cartElement[_oIndexes._extraOptions] = extraOptions;
                        cartElement[indexes._cartElementTotal] =
                            (cartElement[priceSrc] + cartElement[_oIndexes._extraOptionsTotal] ) * cartElement[indexes.fieldOptions._qty];
                        fnProductify.cart._addElementToCart(that, cartElement);
                    }
                }
            });
            _productsCart = arrayCartElement;
            fnProductify.cart._updateCartTotal(that);
            Productify.initListener(that);
        }

        function generalSearch(data, searchValue) {
            if (Productify.defaults.debug) {
                console.log('$.fn.productify.generalSearch()', {
                    arguments: arguments
                });
            }
            var caseInsensitive = true;
            if (caseInsensitive) {
                searchValue = searchValue.toLowerCase();
            }
            var returnData = data.slice();
            if (Fn._isStringNotEmpty(searchValue)) {

                var arraySearchField = settings.fields.filter(function (element) {
                    return Fn._getObjByProp(element, indexes.fieldOptions.searchable, false);
                });

                returnData = returnData.filter(function (element) {
                    var elementId = Object.keys(element)[0];
                    var dataElement = element[elementId];

                    for (var i = 0; i < arraySearchField.length; i++) {
                        var field = arraySearchField[i];
                        var fieldValue = Fn._getObjByArrayProp(dataElement, field.data, "");
                        var fieldOption = Fn._getObjByArrayProp(field, indexes.fieldOptions.options, null);
                        var render = field.render;
                        if (Fn._isFunction(render)) {
                            fieldValue = render(fieldValue, dataElement, field, fieldOption);
                        }
                        if (caseInsensitive) {
                            fieldValue = fieldValue.toLowerCase();
                        }
                        if (fieldValue.includes(searchValue)) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            _lastSearchValue = searchValue;
            if (Productify.defaults.debug) {
                console.log({
                    _event: "generalSearch() called",
                    _lastSearchValue: _lastSearchValue,
                    caseInsensitive: caseInsensitive,
                    arraySearchField: arraySearchField,
                    data: data,
                    searchValue: searchValue,
                    settings: settings,
                    returnData: returnData
                });
            }
            return returnData;
        }

        /**
         * END Private functions
         */

        /**
         * Public property
         */

        that.productTemplate = Productify.defaults.template.product;

        if (Fn._isStringNotEmpty(settings.template)) {
            var $template = $(settings.template);
            if ($template.length) {
                that.productTemplate = $template[0].outerHTML;
                $template.remove();
            }
        }



        /**
         * END Public property
         */


        /**
         * Public functions
         */

        that.data = function () {
            return _productsData;
        };

        that.option = function () {
            return _options;
        };

        that.fields = function () {

        };

        that.field = function () {
            var returnField = null;
            if (arguments.length > 0) {
                var arrayFields = settings.fields;
                var selector = arguments[0];
                if (Fn._isSameType(selector, 1) && arrayFields.length > selector) {
                    return arrayFields[selector];
                } else if (Fn._isSameType(selector, 'string') && Fn._isStringNotEmpty(selector)) {
                    return arrayFields.find(function (element) {
                        return element[indexes.fieldOptions.data] === selector;
                    })
                }
            }

            return returnField;
        };

        that.cart = function () {
            return _productsCart;
        };

        that.product = function (productId) {
            if (Productify.defaults.debug) {
                console.log("productify.product(productId) called", productId);
            }
            // var product = Fn._getObjByProp(that.data(), productId, null);
            var product = that.data().find(function (element) {
                return Object.keys(element)[0] === productId;
            });
            if (product !== null && product.hasOwnProperty(productId)) {
                product = product[productId];
            }

            if (Productify.defaults.debug) {
                console.log({
                    productId: productId,
                    product: product
                });
            }
            return product;
        };

        that.addToCart = function (product, qty) {
            settings.event.onAddProduct(that, product);
            if (Productify.defaults.debug ) {console.log("productify.addToCart(product, qty) called", {
                product: product, qty: qty
            })}

            qty = Fn._isSameType(qty, 1) && qty > 0 ? qty : 1;
            addToCart(product, qty);
            return that;
        };

        that.removeFromCart = function (index) {
            if (Productify.defaults.debug ) {
                console.log("productify.removeFromCart(product, qty) called", {index: index});
            }
            if (index >= 0 && index < _productsCart.length) {
                _productsCart.splice(index, 1);
                updateSession();
            }
            return that;
        };

        that.emptyCart = function () {
            if (Productify.defaults.debug) {
                console.log("productify.emptyCart(product, qty) called");
            }
            settings.event.onEmptyProduct(that);
            _productsCart = [];
            updateSession();

            return that;
        };

        that.cartTotal = function () {
            var arrayCartItems = _productsCart;
            var total = 0;
            $.each(arrayCartItems, function (index, cartItem) {
                var priceSrc = Fn._getObjByProp(that.settings, indexes.priceSrc, '');
                var productQty = Fn._getObjByProp(cartItem, indexes.fieldOptions._qty, -1);
                var productPrice = Fn._getObjByProp(cartItem, priceSrc, 0);
                var productExtraTotal = Fn._getObjByProp(cartItem, _oIndexes._extraOptionsTotal, 0);
                productExtraTotal = Fn._isNumeric(productExtraTotal) ? parseInt(productExtraTotal) : 0;
                var  totalPrice = productPrice + productExtraTotal;

                if (totalPrice && productQty) {
                    total += cartItem[indexes._cartElementTotal];
                }
            });
            return total;
        };

        that.draw = function () {
            settings.event.onDraw(that);

            fnProductify.product._drawProducts(that, settings, _displayProductsData);

            Productify.listener.addProductBtn(that);

            return that;
        };

        that.init = function () {
            settings.event.preInit(that);
            var
                url = settings.ajax,
                dataSrc = settings.dataSrc
            ;
            settings.event.onInit(that);
            if (
                Fn._isStringNotEmpty(url) && Fn._isStringNotEmpty(dataSrc)
            ) {
                $.post(url, {
                    _q: dataSrc,
                    merchantId: settings.merchantId,
                    lang: settings.lang
                }).done(function (ajaxResponse) {
                    var response = JSON.parse(ajaxResponse);
                    if (Productify.defaults.debug) {
                        console.log(response)
                    }
                    setData(response.data);
                    setOption(response.options);
                    loadSessionCart();
                    that.sort();
                    settings.event.initDraw(that);
                    settings.event.preDraw(that);
                    fnProductify.controls._drawControl(that, settings);
                    fnProductify.fieldsGroup._loadFieldsGroup(that, settings);
                    that.draw();

                    settings.event.postDraw(that);

                    Productify.initListener(that);
                });
            }

            settings.event.postInit(that);
            return that;
        };

        that.sort = function () {
            var arrayReturnedData = that.data().sort(function (a, b) {

            });
            if (Productify.defaults.debug) {
                console.log("sort", {
                    arrayReturnedData: arrayReturnedData
                })
            }

            return arrayReturnedData;
        };

        that.filter = function () {
            var debug = {
                _event: "DataCard API filter() called",
                productsData: _productsData,
                arguments: arguments
            };


            if (arguments.length > 0) {


                var processTime = Date.now();
                var search = arguments[0];
                if (Fn._isSameType(search, "")) {
                    console.log({
                        search: search, jsonData: _productsData
                    });
                    _displayProductsData = generalSearch(_productsData, search);
                }
                else if (Fn._isSameType(search, {}) && !$.isEmptyObject(search)) {
                    var genSearch = Fn._getObjByProp(search, indexes.search, "");
                    _displayProductsData = generalSearch(_productsData, genSearch);


                    /**
                     * filter fieldsContain
                     * @type {Array.<*>}
                     * @private
                     */
                    var searchFieldsContain = Fn._getObjByProp(search, indexes.fieldsContain, {});
                    var fieldsContainName = Object.keys(searchFieldsContain);
                    if (fieldsContainName.length > 0) {
                        _displayProductsData = _displayProductsData.filter(function (productData) {
                            var isDataFounded = false;
                            productData = productData[Object.keys(productData)[0]];
                            for (var i = 0; i < fieldsContainName.length; i++) {
                                var fieldName = fieldsContainName[i];
                                var fieldSearchValues = searchFieldsContain[fieldName];
                                var field = that.field(fieldName);
                                var dataValue = Fn._getObjByProp(productData, fieldName, null);
                                if (Productify.defaults.debug) {
                                    console.log({
                                        _event: "DataCard API filter() called" + i + fieldName,
                                        field: field,
                                        dataValue: dataValue,
                                        fieldName: fieldName,
                                        productData: productData,
                                        fieldSearchValues: fieldSearchValues
                                    });
                                }
                                isDataFounded = inArray(fieldSearchValues, dataValue);
                                if (isDataFounded) {
                                    return isDataFounded;
                                }
                            }
                            return isDataFounded;

                        });
                    }


                    /**
                     * filter fieldsNotContain
                     * @type {Array.<*>}
                     * @private
                     */

                    var searchFieldsNotContain = Fn._getObjByProp(search, indexes.fieldsNotContain, {});
                    var fieldsNotContainName = Object.keys(searchFieldsNotContain);
                    if (fieldsNotContainName.length > 0) {
                        _displayProductsData = _displayProductsData.filter(function (productData) {
                            var isDataFounded = false;
                            productData = productData[Object.keys(productData)[0]];

                            for (var i_not = 0; i_not < fieldsNotContainName.length; i_not ++) {
                                var fieldNameNot = fieldsNotContainName[i_not];
                                var fieldSearchValuesNot = searchFieldsNotContain[fieldNameNot];
                                var fieldNot = that.field(fieldNameNot);
                                var dataValueNot = Fn._getObjByProp(productData, fieldNameNot, null);
                                var isInArray = inArray(fieldSearchValuesNot, dataValueNot);
                                isDataFounded = !isInArray;
                                if (Productify.defaults.debug) {
                                    console.log({
                                        _event: "DataCard API filter() called" + i_not + fieldNameNot,
                                        fieldNot: fieldNot,
                                        dataValueNot: dataValueNot,
                                        fieldNameNot: fieldNameNot,
                                        productData: productData,
                                        fieldSearchValuesNot: fieldSearchValuesNot,
                                        isInArray: isInArray,
                                        isDataFounded: isDataFounded
                                    });
                                }

                                return isDataFounded;

                            }


                        });
                    }

                    if (Productify.defaults.debug) {
                        console.log({
                            _event: "DataCard API filter() called",
                            search: search,
                            _displayData: _displayProductsData,
                            jsonData: _productsData,
                            fields: searchFieldsContain
                        });
                    }
                } else {
                    _displayProductsData = _productsData.slice();
                }


                processTime = Date.now() - processTime;
                debug.processTime = processTime;
                debug._displayData = _displayProductsData;
                debug.search = search;
                debug.jsonData = _productsData;
                debug._lastSearchValue = _lastSearchValue;

                if (Productify.defaults.debug) {
                    console.log(debug);
                }
            }
            return that;
        };

        that.optionizer = function (product, qty) {
            $.fn.productify.optionizer(that, product, qty);
        };


        that.node = function (productId) {
            return fnProductify.product._getNode(that, productId);
        };

        /**
         * END Public functions
         */
        settings.event.init(that);
        that.init();
        return that;
    };


    /**
     * $.fn.productify.defaults
     * @var {Object} defaults defaults options
     * @augments Productify
     * @property {string} currency
     * @property {boolean} debug
     * @property {Object} options
     * @property {Object} field
     * @property {Object} fieldsGroup
     * @property {Object} animation
     */
    Productify.defaults = {
        currency: '€',
        debug: false,
        options: {},
        event : {},
        field: {},
        fieldsGroup: {},
        animation: {
            bounceIn: 'bounceIn',
            bounceOut: "bounceOut"
        },
        template : {}
    };

    Productify.defaults.template = {
        /**
         * $.fn.productify.defaults.template.product
         * @var {string} productTemplate defaults template for product
         * @augments template
         * @example
         * <div class="product-item elevation dp-product">
         *     {imageWebPath}
         *     <div class="product-all-details">
         *         <div class="visible-details">
         *             <div class="product-details">
         *                 <p class="product-name primary text-xs">{name}</p>
         *                 <p class="product-desc text-xxs">{description}</p>
         *                 <div class="product-allergen">
         *                     <p class="text-accent text-xxs m-b-5">allergènes</p>
         *                     <div>{allergen}</div>
         *                     <div>{productOptions}</div>
         *                 </div>
         *             </div>
         *             <div class="product-extra">
         *                 <div class="price">
         *                     <div class="cart">
         *                         <div class="product-price text-accent">{price}</div>
         *                         <input type="number" placeholder="1" value="1" min="1" class="qty-input form-control">
         *                         <button class="product-add btn dp-add-btn" data-dp-id={idCode}><i class="fas fa-cart-plus"></i></button>
         *                     </div>
         *                 </div>
         *             </div>
         *         </div>
         *     </div>
         * </div>
         */
        product:
        '<div class="product-item elevation dp-product">' +
        // '<div class="product-image">{imageWebPath}</div>' +
        '{imageWebPath}' +
        // '<div class="product-image"><img src="/yichan.jpg" alt=""></div>' +
        '<div class="product-all-details">' +
        '<div class="visible-details">' +
        '<div class="product-details">' +
        // '<p class="product-name text-xxxs text-accent">{categoryIdCode}</p>' +
        '<p class="product-name primary text-sm">{name}</p>' +
        '<p class="product-desc text-xs">{description}</p>' +
        '<div class="product-allergen">' +
        '<p class="text-accent text-xxs m-b-5">allergènes</p>' +
        '<div>' +
        '{allergen}' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="product-extra">' +
        '<div class="price">' +
        // '<div class="price-option">' +
        //     '<div class="product-price">{price}</div>' +
        //     '<a href="/_api/_lightbox/product.php?id={idCode}" data-lightbox="ajax" class="btn btn-default product-detail">' +
        //         'détail' +
        //     '</a>' +
        //     '</div>' +
        // '</div>' +
        '<div class="cart">' +
        // '<div class="qty-cart">' +
        '<div class="product-price text-accent">{price}</div>' +
        '<input type="number" placeholder="1" value="1" min="1" class="qty-input form-control">' +
        '<button class="product-add btn dp-add-btn" data-dp-id={idCode}>' +
        '<i class="fas fa-cart-plus"></i>' +
        '</button>' +
        // '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'/*+



        '<div class="item-list right-checkout block-product shadow">' +
        '<div class="list-image">{imageWebPath}</div>' +
        '<div class="all-details">' +
        '<div class="visible-option">' +
        '<div class="details">' +
        '<p class=" product-name">{name}</p>' +
        '<p class="product-desc">{description}</p>' +
        '<a tabindex="0" class="allergen-popover" data-dp-id="{idCode}" role="button" data-trigger="" title="allergen" data-content=""> allergene</a>'+
        '</div>' +
        '<div class="extra">' +
        '<div class="price-info">' +
        '<div class="price-option">' +
        '<div class="product-price">{price}</div>' +
        '<a href="/_api/_lightbox/product.php?id={idCode}" data-lightbox="ajax" class="btn btn-default product-detail" ">détail</a>' +
        '</div>' +
        '</div>'+
        '<div class="cart-info">' +
        '<div class="qty-cart text-center">' +
        '<input data-sales-productid="2" type="number" placeholder="1" value="1" min="1" class="qty-input">' +
        '<button class="product-add btn" data-sales-productid="2"><i class="fas fa-cart-plus"></i></button>' +
        '</div>'+

        '</div>'+
        '</div>'+
        '</div>' +
        '</div>' +
        '</div>'*/,

        /**
         * $.fn.productify.defaults.template.cartElement
         * @var {string} cartElementTemplate defaults template for product
         * @augments template
         * @example
         * <div class="cart-item">
         *     <div class="cart-product-meta">
         *         <div class="primary">{name}</div>
         *         <span class="text-accent m-l-10">{qty}</span> x
         *         <span class="text-accent">{price}</span>
         *     </div>
         *     <div class="cart-item-remove">
         *         <a href="#" class="cart-item-remove"><i class="fa fa-times  text-danger"></i></a>
         *     </div>
         * </div>'
         */
        cartElement:
        '<div class="cart-item">' +
            '<div class="cart-product-meta">' +
                '<div class="primary">{name}<span class="text-accent m-l-10 text-xxs">x {qty}</span></div>' +
                '<div class="text-accent text-xxs">{price}</div>' +
                '<div id="dp-optionizer" class="text-xxxs"></div>'+
                '<div class="text-accent text-xs">{total}</div>' +
            '</div>' +
            '<div class="cart-item-remove">' +
                '<a href="#" class="btn-item-remove"><i class="fa fa-times  text-danger"></i></a>' +
            '</div>' +
            '<div class="separator m-0"></div>' +
        '</div>'
    };

    Productify.event = {
        debug: false,
        init: function (productify) {
            if (Productify.event.debug) {
                console.log('init(productify) called', {productify: productify});
            }

        },
        preInit: function (productify) {
            if (Productify.event.debug) {
                console.log('preInit(productify) called', {productify: productify});
            }
            return true;
        },
        onInit: function (productify) {
            if (Productify.event.debug) {
                console.log('onInit(productify) called', {productify: productify});
            }

        },
        postInit: function (productify) {
            if (Productify.event.debug) {
                console.log('postInit(productify) called', {productify: productify});
            }
        },
        initDraw: function (productify) {
            if (Productify.event.debug) {
                console.log('initDraw(productify) called', {productify: productify});
            }

        },
        preDraw: function (productify) {
            if (Productify.event.debug) {
                console.log('preDraw(productify) called', {productify: productify});
            }
            return true;

        },
        onDraw: function (productify) {
            if (Productify.event.debug) {
                console.log('onDraw(productify) called', {productify: productify});
            }

        },
        postDraw: function (productify) {
            if (Productify.event.debug) {
                console.log('postDraw(productify) called', {productify: productify});
            }

            INSPIRO.header.mainMenu();
            INSPIRO.elements.magnificPopup();

        },
        initAddProduct: function (productify) {
            if (Productify.event.debug) {
                console.log('initAddProduct(productify) called', {productify: productify});
            }

        },
        preAddProduct: function (productify, product) {
            if (Productify.event.debug) {
                console.log('preAddProduct(productify, product) called', {productify: productify, product: product});
            }
            return true;

        },
        onAddProduct: function (productify, product) {
            if (Productify.event.debug) {
                console.log('onAddProduct(productify, product) called', {productify: productify, product: product});
            }


        },
        postAddProduct: function (productify, product) {
            if (Productify.event.debug) {
                console.log('postAddProduct(productify, product) called', {productify: productify, product: product});
            }

        },
        initRemoveProduct: function (productify) {
            if (Productify.event.debug) {
                console.log('initRemoveProduct(productify) called', {productify: productify});
            }

        },
        preRemoveProduct: function (productify, product) {
            if (Productify.event.debug) {
                console.log('preRemoveProduct(productify, product) called', {productify: productify, product: product});
            }
            return true;

        },
        onRemoveProduct: function (productify, product) {
            if (Productify.event.debug) {
                console.log('onRemoveProduct(productify, product) called', {productify: productify, product: product});
            }

        },
        postRemoveProduct: function (productify, product) {
            if (Productify.event.debug) {
                console.log('postRemoveProduct(productify, product) called', {
                    productify: productify,
                    product: product
                });
            }

        },
        initEmptyProduct: function (productify) {
            if (Productify.event.debug) {
                console.log('initEmptyProduct(productify) called', {productify: productify});
            }

        },
        preEmptyProduct: function (productify) {
            if (Productify.event.debug) {
                console.log('preEmptyProduct(productify, product) called', {productify: productify});
            }
            return true;

        },
        onEmptyProduct: function (productify) {
            if (Productify.event.debug) {
                console.log('onEmptyProduct(productify, product) called', {productify: productify});
            }

        },
        postEmptyProduct: function (productify) {
            if (Productify.event.debug) {
                console.log('postEmptyProduct(productify, product) called', {productify: productify});
            }

        },
        onUpdateCart: function (productify) {
            if (Productify.event.debug) {
                console.log('onUpdateCart(productify) called', {productify: productify});
            }

        },
        postUpdateCart: function (productify) {
            if (Productify.event.debug) {
                console.log('postUpdateCart(productify) called', {productify: productify});
            }
            var $cartQty = $("#badge-qty");
            var length = Fn._getObjectLength(productify.cart());
            $cartQty.text(length);
        }

    };


    /**
     * $.fn.productify.defaults.fieldsGroup
     * @var {Object} fieldsGroupOptions defaults options
     * @augments defaults
     *
     * @property {boolean} [_valid = false]
     * @property {string} containerSelector
     * @property {string} data
     * @property {string} idSrc
     * @property {string} options
     * @property {string} template
     * @property {string} [title = '']
     * @property {string} [titleSelector = '']
     */
    Productify.defaults.fieldsGroup = {
        _valid: false,
        containerSelector: '',
        data: '',
        idSrc: '',
        options: '',
        template: '',
        title: '',
        titleSelector: ''
    };

    /**
     * $.fn.productify.defaults.options
     * @augments defaults
     * @var {Object} productifyOptions
     * @property {string} [addBtnSelector]
     * @property {string} [ajax = '/_api/_eshop/'] the url where to query products
     * @property {string} [cartSelector] this define the cart's container to add element in
     * @property {string} [controlSelector] DOM selector to display filter's control
     * @property {string} [dataSrc = 'product'] source of the query
     * @property {Array<fields>} fields all fields of productify
     * @property {fieldsGroupOptions} [fieldsGroup = fieldsGroupOptions] defaults fields  group options
     * @property {string} [idSrc = 'idCode'] data's property to get the id
     * @property {boolean} [image = false]
     * @property {string} [lang = Fn._getLang()] language is sent with ajax data to retrieve elements with the appropriate language
     * @property {string} [merchantId = merchantId()] Merchant's id is sent with ajax data to retrieve the product from that merchant
     * @property {string} [priceSrc = 'price'] data's property to get the price
     * @property {string} [qtySelector] DOM selector for input type number to define the quantity when add button is clicked
     * @property {string} [removeBtnSelector]
     * @property {boolean} [search = true] define if process general search or not and draw the search input
     * @property {string} [sessionUrl = '/_api/_eshop/'] url where the cart's operation should send
     * @property {jquerySelector|html} [template] the product's template, can be html string or a jquerySelector
     * @property {null|productOptions} [productOptions = null] the product's template, can be html string or a jquerySelector
     *
     */
    Productify.defaults.options = {
        addBtnSelector: '',
        ajax: _apiSrc,
        cartSelector: '',
        controlSelector: '',
        dataSrc: 'product',
        event : Productify.event,
        fields: [],
        fieldsGroup: Productify.defaults.fieldsGroup,
        idSrc: 'idCode',
        image: false,
        lang: Fn._getLang(),
        merchantId: merchantId(),
        priceSrc: 'price',
        qtySelector: '',
        removeBtnSelector: '',
        search: true,
        sessionUrl: _apiSrc,
        template: Productify.defaults.template.product,
        optionizer : {}
    };

    /**
     * $.fn.productify.defaults.field
     * @augments defaults
     * @var {Object} field default field object
     * @property {string} [data]
     * @property {boolean} [filter = true] define if the field should be filter or not with select, radio or checkbox
     * @property {boolean} [filterContain = true] defile if field filter with logic of contain, if set to false, it will filter with the logic of not contain
     * @property {null|Array<Object>} [options = null] options for render the field value
     * @property {boolean} [searchable = true] defile if the field can be search through the input search
     * @property {string} [title]
     * @property {string} [type = 'text']
     *
     */
    Productify.defaults.field = {
        data: '',
        filter: true,
        filterContain: true,
        options: null,
        render: null,
        searchable: true,
        title: '',
        type: _Productify._fieldType.text
    };



    Productify.render = {
        price: _Field.render.price,
        image: function (fieldValue, rowData, field, options) {
            if (Fn._isStringNotEmpty(fieldValue)) {
                // fieldValue = "/yichan.jpg";
                return '<div class="product-image"><img src="' + fieldValue + '" class="img-fluid"></div>';
            }
            else {
                // return '<div class="product-image"><img src="/yichan.jpg" class="img-fluid"></div>';
            }
            return null;
        },
        allergen: function (fieldValue, rowData, field, options) {
            var allergenRender = "";
            if (options !== null) {
                $.each(fieldValue, function (index, allergenId) {
                    if (Fn._isStringNotEmpty(allergenId)) {
                        var allergen = options.find(function (element) {
                            var elementId = Object.keys(element)[0];
                            return elementId === allergenId;
                        });
                        if (Fn._isSameType(allergen, {})) {
                            allergen = allergen[Object.keys(allergen)[0]];

                            var allergenName = Fn._getObjByProp(allergen, "name", "");
                            if (Fn._isStringNotEmpty(allergenName)) {
                                allergenRender +=
                                    '<span class="badge badge-pill badge-secondary allergen text-xxxs">' + allergenName + '</span>';
                            }
                        }
                    }
                });
            }
            return allergenRender;
        }
    };


    var models = Productify.models = {
        selectedAttr: "selected",
        dataAttr: "data-",
        dataIdAttr: "data-dp-id",
        product: {
            attr: {
                "class": "dp-product"
            }
        },
        cartItem: {
            attr: {
                "class": "dp-cart-item"
            }
        },
        addBtn: {
            attr: {
                'class': 'dp-add-btn'
            }
        },
        removeBtn: {
            attr: {
                'class': 'dp-remove-btn'
            }
        },
        emptyBtn: {
            attr: {
                'class': 'dp-empty-btn'
            }
        },
        fieldsGroup: {
            attr: {
                'class': "fields-group"
            },
            container: {
                attr: {
                    'class': 'fields-group-container'
                }
            },
            title: {
                attr: {
                    'class': 'fields-group-title'
                }
            }
        },
        controls: {
            inputNameAttr: 'dp_input_name',
            fieldNameDataAttr: "data-search-field-name",
            dataFilterContainAttr: "data-filter-contain",
            inputSearch: {
                attr: {
                    class: "dp-general-search",
                    id: "dp-general-search"
                }
            }

        }
    };


    var indexes = Productify.indexes = {
        ajax: 'ajax',
        dataSrc: 'dataSrc',
        idSrc: 'idSrc',
        priceSrc: 'priceSrc',
        fieldsGroup: 'fieldsGroup',
        search: 'search',
        controlSelector: 'controlSelector',
        fields: 'fields',
        fieldsContain: 'fieldsContain',
        fieldsNotContain: 'fieldsNotContain',
        imageSrc: 'imageSrc',
        addBtnSelector: 'addBtnSelector',
        removeBtnSelector: 'removeBtnSelector',
        cartSelector: 'cartSelector',
        fieldOptions: {
            _id: '_id',
            _qty: 'qty',
            data: 'data',
            type: 'type',
            searchable: 'searchable',
            filter: 'filter',
            options: 'options',
            render: 'render',
            filterContain: 'filterContain'
        },
        fieldGroupOptions: {
            idSrc: 'idSrc',
            titleSelector: 'titleSelector',
            template: 'template',
            data: 'data',
            title: 'title',
            containerSelector: 'containerSelector',
            _valid: "_valid"
        },
        optionizer : "optionizer",
        render : "render",
        _cartElementTotal : "_cartElementTotal"
    };

    Productify.listener = {
        addProductBtn: function (productify) {
            var $btn = $('.' + models.addBtn.attr.class);
            $btn
                .off('click')
                .on('click', function (event) {
                    var debug = false;
                    productify.settings.event.initAddProduct(productify);
                    var qtySelector = Fn._getObjByArrayProp(productify, ['settings', 'qtySelector']);
                    event.stopPropagation();
                    var $btn = $(this);
                    var $productElement = $btn.closest('.' + models.product.attr.class);
                    var qty = 1;
                    var $input = null;
                    if ($productElement.length && Fn._isStringNotEmpty(qtySelector)) {
                        $input = $(qtySelector, $productElement);
                        if ($input.length && Fn._isSameType(parseInt($input.val()), 1)) {
                            qty = parseInt($input.val());
                        }
                    }

                    if (Productify.defaults.debug || debug) {
                        console.log({
                            productify: productify,
                            qtySelector: qtySelector,
                            inputVal: qty
                        })
                    }
                    var itemId = $btn.attr(models.dataIdAttr);

                    itemId = (itemId);
                    if (itemId) {
                        var product = productify.product(itemId);
                        if (Fn._isObject(product)) {

                            var preAdd = productify.settings.event.preAddProduct(productify, product, qty);
                            if (Productify.defaults.debug || debug) {
                                console.log({
                                    preAdd : preAdd, product : product
                                })
                            }
                            if(preAdd !== false){
                                productify.addToCart(product, qty);
                                Productify.event.postAddProduct(productify, product);
                                Animation._animate($btn, Productify.defaults.animation.bounceIn);
                                if ($input.length) {
                                    $input.val(1);
                                }
                            }
                        }
                    }
                })
            ;
        },
        removeProductBtn: function (productify) {
            productify.settings.event.initRemoveProduct(productify);
            var $btn = $('.' + models.removeBtn.attr.class);
            $btn
                .off('click')
                .on('click', function (event) {

                    if (Productify.defaults.debug) {
                        console.log('removeProductBtn clicked');
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    var $btnElement = $(this);

                    productify.settings.event.preRemoveProduct(productify);
                    productify.removeFromCart($btn.index($btnElement));
                    productify.settings.event.postRemoveProduct(productify);
                })
            ;
        },
        emptyCartBtn: function (productify) {
            productify.settings.event.initRemoveProduct(productify);
            var $btn = $('.' + models.emptyBtn.attr.class);
            $btn
                .off('click')
                .on('click', function (event) {

                    if (Productify.defaults.debug) {
                        console.log('removeProductBtn clicked');
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    productify.emptyCart();
                    $("#cart-items").empty();
                })
            ;
        },
        checkOut: function (productify) {
            productify.settings.event.initRemoveProduct(productify);
            var $btn = $('.checkout');
            $btn
                .off('click')
                .on('click', function (event) {

                    if (Productify.defaults.debug) {
                        console.log('checkOut clicked');
                    }
                    if (productify.cart().length < 1) {
                        event.preventDefault();
                    }
                })
            ;
        },
        searchButton: function () {

        },
        generalSearch: function (productify) {

            if (Productify.defaults.debug) {
                console.log({
                    _event: "Productify.listener.generalSearch"
                });
            }
            var controlSelector = Fn._getObjByProp(productify.settings, indexes.controlSelector, "");
            if (Fn._isStringNotEmpty(controlSelector)) {
                $('#' + models.controls.inputSearch.attr.id)
                    .off('keyup')
                    .on("keyup", function () {
                        fnProductify.field._fieldsFilter(productify);
                    })
                ;
            }
        },
        fieldFilter: function (productify) {
            var controlSelector = Fn._getObjByProp(productify.settings, indexes.controlSelector, "");
            if (Fn._isStringNotEmpty(controlSelector)) {
                var $fieldsFilter = $('[' + models.controls.fieldNameDataAttr + ']', controlSelector);

                if (Productify.defaults.debug) {
                    console.log({
                        $fieldsFilter: $fieldsFilter
                    });
                }
                $fieldsFilter.each(function () {
                    var $this = $(this);
                    var tagName = $this.prop("tagName");
                    tagName = tagName.toLowerCase();
                    if (tagName === "input") {
                        var inputType = $this.attr('type');
                        if (Productify.defaults.debug) {
                            console.log({
                                inputType: inputType
                            });
                        }
                        if (inputType === "checkbox" || inputType === 'radio') {
                            $this.off('change').on('change', function () {

                                fnProductify.field._fieldsFilter(productify);
                            });
                        } else {

                            $this.off('keyup').on("keyup", function () {
                                fnProductify.field._fieldsFilter(productify);
                            });
                        }
                    } else if (tagName === "select") {
                        $this.on("change", function () {
                            var selectedVal = $this.val();
                            $('option', $this).removeAttr(models.selectedAttr);
                            $('option[value="' + selectedVal + '"]', $this).attr(models.selectedAttr, models.selectedAttr);
                            fnProductify.field._fieldsFilter(productify);
                        });
                    }
                });
            }
        }
    };

    Productify.initListener = function (productify) {
        var allListener = Productify.listener;
        $.each(allListener, function (index, listener) {
            if (Fn._isFunction(listener)) {
                listener(productify);
            }
        });
    };

    var fnProductify = Productify.fn = {
        debug: false,
        product: {
            _drawProducts: function (productify, settings, arrayData) {
                $('.' + models.product.attr.class).remove();

                var addBtnSelector = Fn._getObjByProp(settings, indexes.addBtnSelector, '');
                var fieldsGroup = Fn._getObjByProp(settings, indexes.fieldsGroup, null);
                var fieldsGroupValid = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions._valid, false);
                var fieldsGroupContainer = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.containerSelector, false);
                var fieldsGroupDataSrc = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.data, '');
                fieldsGroupValid = Fn._isStringNotEmpty(fieldsGroupContainer) && Fn._isStringNotEmpty(fieldsGroupDataSrc) && fieldsGroupValid;
                var idSrc = Fn._getObjByProp(settings, indexes.idSrc, "");
                // var arrayData = productify.data();
                if (fnProductify.debug) {
                    console.log('Productify.loadProduct() called', {productify: productify, arrayData: arrayData});
                }
                var $productPanels = $(productify.jQuerySelector);

                $.each(arrayData, function (index, product) {
                    // var $fieldsGroup =


                    var productId = Object.keys(product)[0];
                    product = product[productId];
                    var $productItem = fnProductify.product._getElement(productify, product, productId);
                    if ($productItem !== null) {
                        $productItem.addClass(models.product.attr.class);

                        if (Fn._isStringNotEmpty(addBtnSelector)) {

                            var $addBtn = $(addBtnSelector, $productItem);
                            if (Fn._isStringNotEmpty(idSrc)) {
                                // var productId = Fn._getObjByProp(product, idSrc, -1);
                                if (fnProductify.debug) {
                                    console.log(productId);
                                }
                                if (productId) {
                                    $addBtn.attr(models.dataIdAttr, productId);
                                }
                            }
                            $addBtn.addClass(models.addBtn.attr.class);
                        }
                        var fieldsGroupData = null;
                        var $groupContainer = null;
                        if (fieldsGroupValid && Fn._isStringNotEmpty(fieldsGroupDataSrc)) {
                            fieldsGroupData = Fn._getObjByProp(product, fieldsGroupDataSrc, null);
                            if (Fn._isStringNotEmpty(fieldsGroupData)) {
                                $groupContainer = $(
                                    "." + models.fieldsGroup.container.attr.class,
                                    '[' + models.dataAttr + fieldsGroupDataSrc + '="' + fieldsGroupData + '"]'
                                );
                            }
                        }
                        if (
                            fieldsGroupValid && $groupContainer.length
                        ) {
                            $groupContainer.append($productItem);

                        } else {
                            $productPanels.append($productItem);
                        }
                    }
                });
            },
            _getElement: function (productify, rowData, productId) {
                var
                    settings = productify.settings,
                    arrayFields = settings.fields,
                    template = productify.productTemplate,
                    $productItem = null
                ;

                if (Fn._isStringNotEmpty(template)) {
                    $.each(arrayFields, function (index, field) {
                        var dataSrc = Fn._getObjByProp(field, indexes.fieldOptions.data, '');
                        if (Fn._isStringNotEmpty(dataSrc)) {
                            var fieldValue = Fn._getObjByProp(rowData, dataSrc, '');
                            var fieldOption = Fn._getObjByProp(field, indexes.fieldOptions.options, null);
                            var render = Fn._getObjByProp(field, indexes.fieldOptions.render, null);
                            if (fnProductify.debug) {
                                console.log({
                                    field: field, fieldValue: fieldValue, fieldOption: fieldOption
                                })
                            }

                            if (Fn._isFunction(render)) {
                                var fieldRender = render(fieldValue, rowData, field, fieldOption);
                                fieldValue = Fn._isNotUndefined(fieldRender) ? fieldRender : fieldValue;
                            }
                            if (!Fn._isStringNotEmpty(fieldValue)) {
                                fieldValue = "";
                            }
                            var searchRegExp = new RegExp('{' + dataSrc + '}', 'g');
                            template = template.replace(searchRegExp, fieldValue);
                        }

                    });
                    $productItem = $(template);
                    if (productId) {
                        $productItem.attr(models.dataIdAttr, productId).addClass(models.product.attr.class);
                    }
                }
                return $productItem;

            },
            _getNode : function (productify, productId) {
                if(Fn._isNotUndefined(productify) && Fn._isStringNotEmpty(productId)){
                    var $node = $('.'+models.product.attr.class+"["+models.dataIdAttr+"='"+productId+"']");
                    if($node.length){
                        return $node;
                    }
                }
                return null;
            }
        },
        cart: {
            _emptyCart : function (productify) {
                var cartSelector = Fn._getObjByProp(productify.settings, indexes.cartSelector, '');
                if (Fn._isStringNotEmpty(cartSelector)){
                    var $cartItems = $(cartSelector);
                    if($cartItems.length){
                        $cartItems.empty();
                    }
                }

            },
            _createCartRow: function (productify, product) {
                var idSrc = Fn._getObjByProp(productify.settings, indexes.idSrc, "");
                var removeBtnSelector = Fn._getObjByProp(productify.settings, indexes.removeBtnSelector, '');
                var $cartItem = null;
                var arrayFields = Fn._getObjByProp(productify.settings, indexes.fields, []);
                var template = Productify.defaults.template.cartElement;

                if (Fn._isSameType(product, {}) && Fn._isStringNotEmpty(template) && arrayFields.length) {
                    var id = Fn._getObjByProp(product, idSrc, -1);
                    if (id) {
                        $.each(arrayFields, function (index, field) {
                            var dataSrc = Fn._getObjByProp(field, indexes.fieldOptions.data, '');
                            var fieldOption = Fn._getObjByProp(field, indexes.fieldOptions.options, null);
                            if (Fn._isStringNotEmpty(dataSrc)) {
                                var fieldValue = product.hasOwnProperty(field.data) ? product[field.data] : "";
                                var render = Fn._getObjByProp(field, indexes.fieldOptions.render, null);
                                if (Fn._isFunction(render)) {
                                    fieldValue = render(fieldValue, product, field, fieldOption);
                                }
                                template = template.replace('{' + dataSrc + '}', fieldValue);
                            }

                        });
                        template = template.replace('{' + indexes.fieldOptions._qty + '}', product[indexes.fieldOptions._qty]);
                        template = template.replace('{total}', Fn._intToPrice( product[indexes._cartElementTotal]));
                        $cartItem = $(template);

                        if (Fn._isStringNotEmpty(removeBtnSelector)) {
                            var $removeBtn = $(removeBtnSelector, $cartItem);
                            $removeBtn.attr(models.dataIdAttr, id);
                            $removeBtn.addClass(models.removeBtn.attr.class);
                        }
                        $cartItem.addClass(models.cartItem.attr.class);
                        var $optionizerRender = fnProductify.cart._createCartOptionizer(productify, product);
                        $("#dp-optionizer", $cartItem).html($optionizerRender);

                        $cartItem.attr(models.dataIdAttr, id);

                    }

                }
                return $cartItem;
            },
            _createCartOptionizer : function (productify, product) {
                var optionizer = Fn._getObjByProp(productify.settings, indexes.optionizer, {});
                var optionizerRender = Fn._getObjByProp(optionizer, indexes.render, null );
                console.log({
                    optionizer: optionizer
                });
                if(Fn._isFunction(optionizerRender)){
                    var arrayOptions = Fn._getObjByProp(product, _oIndexes._extraOptions, []);
                    return optionizerRender(product, arrayOptions);
                }
                return null;

            },
            _addElementToCart: function (productify, cartElement) {
                var cartSelector = Fn._getObjByProp(productify.settings, indexes.cartSelector, '');
                var idSrc = Fn._getObjByProp(productify.settings, indexes.idSrc, "");
                var productId = Fn._isStringNotEmpty(idSrc) ? Fn._getObjByProp(cartElement, idSrc, null) : cartElement[idSrc];
                if (
                    Fn._isStringNotEmpty(cartSelector) && productId && ! $.isEmptyObject(cartElement)
                ) {
                    var $cartItems = $(cartSelector);
                    var $productElement = fnProductify.cart._createCartRow(productify, cartElement);
                    if ($productElement !== null) {
                        $cartItems.append($productElement);
                        Productify.listener.removeProductBtn(productify);
                    }
                }
            },
            _updateCartTotal: function (productify) {
                var cartTotal = productify.cartTotal();
                var cartElements = productify.cart();
                console.log({
                    cartElements : cartElements
                });
                var $btnCheckout = $('.checkout');
                var $btnEmpty = $('.' + models.emptyBtn.attr.class);
                if (cartElements.length > 0) {
                    $btnCheckout.removeClass("disabled");
                    FnJquery._disableElem($btnEmpty, false);
                } else {

                    $btnCheckout.addClass("disabled");
                    FnJquery._disableElem($btnEmpty, true);
                }
                $("[data-cart-total='true']").text(Fn._intToPrice(cartTotal));
                Productify.event.postUpdateCart(productify);
            }
        },
        fieldsGroup: {
            _loadFieldsGroup: function (productify, settings) {
                var isValid = true;
                var fieldsGroup = Fn._getObjByProp(settings, indexes.fieldsGroup, null);
                fieldsGroup._valid = false;
                var options = productify.option();
                if (fieldsGroup !== null && !$.isEmptyObject(options)) {
                    var template = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.template, null);
                    var titleSelector = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.titleSelector, null);
                    var containerSelector = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.containerSelector, null);
                    var data = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.data, null);
                    var titleSrc = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.title, null);
                    var idSrc = Fn._getObjByProp(fieldsGroup, indexes.fieldGroupOptions.idSrc, null);
                    if (Fn._isStringNotEmpty(data)) {
                        var arrayOption = Fn._getObjByProp(options, data, null);
                        if (fnProductify.debug) {
                            console.log({
                                template: template,
                                titleSelector: titleSelector,
                                containerSelector: containerSelector,
                                arrayOption: arrayOption,
                                data: data,
                                idSrc: idSrc,
                                titleSrc: titleSrc
                            });
                        }
                        var $productPanels = $(productify.jQuerySelector);
                        if (
                            $productPanels.length && arrayOption.length && Fn._isStringNotEmpty(template) &&
                            Fn._isStringNotEmpty(idSrc) && Fn._isStringNotEmpty(titleSrc) &&
                            Fn._isStringNotEmpty(titleSelector) && Fn._isStringNotEmpty(containerSelector)
                        ) {
                            $.each(arrayOption, function (index, option) {
                                option = option[Object.keys(option)[0]];
                                var optionId = Fn._getObjByProp(option, idSrc, null);
                                var title = Fn._getObjByProp(option, titleSrc, null);
                                var $template = $(template);
                                var $title = $(titleSelector, $template);
                                var $container = $(containerSelector, $template);
                                if ($template instanceof jQuery && $title instanceof jQuery && $container instanceof jQuery) {
                                    if (fnProductify.debug) {
                                        console.log('is jQuery', {
                                            $template: $template,
                                            $title: $title,
                                            $container: $container,
                                            option: option,
                                            optionId: optionId
                                        });
                                    }
                                    $template.addClass(models.fieldsGroup.attr.class).attr(models.dataAttr + data, optionId);
                                    $title.addClass(models.fieldsGroup.title.attr.class).text(title);
                                    $container.addClass(models.fieldsGroup.container.attr.class);
                                    $template.appendTo($productPanels);
                                } else {
                                    isValid = false;
                                }
                            });
                        }
                    }
                }
                if (isValid) {
                    fieldsGroup._valid = isValid;
                }
            }
        },
        static: {
            /**
             *
             * @param settings
             * @private
             */
            _mergeSetting: function (settings) {
                var defaultOptions = Productify.defaults.options;
                    defaultOptions[indexes.optionizer] = optionizerDefault.options;
                var
                    mergedSettings = $.extend(true, {}, defaultOptions, settings),
                    arraySettingsFields = mergedSettings.fields
                ;
                var arrayFields = [];
                $.each(arraySettingsFields, function (index, element) {
                    var field = $.extend({}, Productify.defaults.field, element);
                    if (!Fn._isFunction(field.render)) {
                        field.render = fnProductify.field._getFieldRender(field.type, field.options);
                    }
                    arrayFields[index] = field;
                });
                mergedSettings.fields = arrayFields;
                if (fnProductify.debug) {
                    console.log("_mergeSetting", {arguments: arguments, arrayFields: arrayFields, options : Productify.defaults.options})
                }
                return mergedSettings;
            },
            _stickyFilterMenu: function () {
                var pageMenu = document.getElementById("pageMenu");
                if (typeof pageMenu !== "undefined" && pageMenu !== null) {
                    var sticky = pageMenu.offsetTop - 80;
                    window.onscroll = function () {
                        if (window.pageYOffset >= sticky) {
                            pageMenu.classList.add("sticky")
                        } else {
                            pageMenu.classList.remove("sticky");
                        }
                    };
                }
            }
        }
    };

    fnProductify.field = {
        _getFieldRender: function (type) {
            var allRender = _Field.render;
            if (allRender.hasOwnProperty(type) && typeof allRender[type] === typeof function () {
                }) {
                return allRender[type]();
            } else {
                return null;
            }
        },
        _fieldsFilter: function (productify) {
            var processTime = Date.now();
            var debug = {
                _event: 'fnProductify.field._fieldsFilter',
                productify: productify
            };

            var arraySearch = {};
            arraySearch[indexes.search] = "";

            var $generalSearch = $('#' + models.controls.inputSearch.attr.id);
            if ($generalSearch.length) {
                var inputVal = $generalSearch.val();
                if (Fn._isStringNotEmpty(inputVal)) {
                    arraySearch[indexes.search] = inputVal;
                }
            }
            var
                arrayFieldsContain = arraySearch[indexes.fieldsContain] = {},
                arrayDataContain = []
            ;
            var arrayFieldsNotContain = arraySearch[indexes.fieldsNotContain] = {},
                arrayDataNotContain = []
            ;
            var $fieldFilter = $('[' + models.controls.fieldNameDataAttr + ']');

            $fieldFilter.each(function (index, element) {
                var $elem = $(element);
                var tagName = $elem.prop("tagName");
                tagName = tagName.toLowerCase();
                var val = $elem.val();
                // val = val.toLowerCase();
                var fieldData = $elem.attr(models.controls.fieldNameDataAttr);
                var filterContain = $elem.attr(models.controls.dataFilterContainAttr);
                filterContain = (filterContain === 'true');
                if (fnProductify.debug) {
                    console.log({
                        $elem: $elem,
                        tagName: tagName,
                        val: val,
                        fieldData: fieldData,
                        filterContain: filterContain
                    });
                }
                if (Fn._isStringNotEmpty(fieldData) && Fn._isStringNotEmpty(val)) {

                    arrayDataContain = Fn._getObjByProp(arrayFieldsContain, fieldData, []);
                    arrayDataNotContain = Fn._getObjByProp(arrayFieldsNotContain, fieldData, []);
                    if (tagName === "input") {
                        var inputType = $elem.attr('type');
                        if (fnProductify.debug) {
                        }
                        if (inputType === "checkbox" || inputType === 'radio') {
                            if (filterContain) {
                                if ($elem.is(":checked")) {
                                    arrayDataContain.push(val);
                                    arrayFieldsContain[fieldData] = arrayDataContain;
                                }
                            } else {
                                if (!$elem.is(":checked")) {
                                    arrayDataNotContain.push(val);
                                    arrayFieldsNotContain[fieldData] = arrayDataNotContain;
                                }
                            }
                        } else {

                            arrayDataContain.push(val);
                            arrayFieldsContain[fieldData] = arrayDataContain;
                        }
                    } else if (tagName === "select") {

                    }

                }
            });

            debug.arraySearch = arraySearch;

            debug.processTime = Date.now() - processTime;
            if (fnProductify.debug) {
                console.log(debug);
            }

            productify.filter(arraySearch).draw();


        }
    };

    fnProductify.controls = {
        _drawControl: function (productify, settings) {
            var controlSelector = Fn._getObjByProp(settings, indexes.controlSelector, "");
            if (Fn._isStringNotEmpty(controlSelector)) {
                var $searchControl = $(controlSelector);
                if ($searchControl.length) {
                    $searchControl.addClass('productify-controls');
                    var isValidGeneralSearch = fnProductify.controls._isValidGeneralSearch(productify, settings, false);

                    if (isValidGeneralSearch) {
                        var $generalSearch = fnProductify.controls._getGeneralSearch(productify, settings);
                        $searchControl.append($generalSearch);
                    }
                    var arrayFields = Fn._getObjByProp(settings, indexes.fields, []);
                    $.each(arrayFields, function (index, fieldElement) {
                        var type = Fn._getObjByProp(fieldElement, indexes.fieldOptions.type, "");
                        var isFilter = Fn._getObjByProp(fieldElement, indexes.fieldOptions.filter, false);
                        var $fieldFilter = null;
                        if (Fn._isStringNotEmpty(type) && isFilter) {
                            switch (type) {
                                case _Productify._fieldType.select :
                                    $fieldFilter = fnProductify.controls._getSelectFilter(productify, settings, fieldElement);

                                    break;
                                case _Productify._fieldType.radio :
                                    $fieldFilter = fnProductify.controls._getRadioFilter(productify, settings, fieldElement);

                                    break;
                                case _Productify._fieldType.checkbox :
                                    $fieldFilter = fnProductify.controls._getCheckBoxFilter(productify, settings, fieldElement);
                                    break;
                                case _Productify._fieldType.allergen :
                                    $fieldFilter = fnProductify.controls._getCheckBoxAllergenFilter(productify, settings, fieldElement);
                                    break;
                            }
                        }
                        $searchControl.append($fieldFilter);
                        if (fnProductify.debug) {
                            console.log("$.each(arrayFields)", {
                                fieldElement: fieldElement,
                                type: type
                            });
                        }
                    });

                    if (fnProductify.debug) {
                        console.log("_drawControl()", {
                            isValidSearch: isValidGeneralSearch,
                            controlSelector: controlSelector,
                            $searchControl: $searchControl,
                            arrayFields: arrayFields
                        });
                    }
                }
            }
        },
        _getListElementDropDown: function (productify, settings, fieldElement) {
            var $listElement = $('<li/>').addClass('dropdown');
            $listElement.append($('<a/>').attr({
                href: 'javascript:void(0)'
            }).text(fieldElement.title));
            $listElement.append($('<div/>').attr({
                class: 'dropdown-menu'
            }));
            return $listElement;
        },
        _isValidGeneralSearch: function (productify, settings) {
            var isSearch = Fn._getObjByProp(settings, indexes.search, false);
            var arrayFields = Fn._getObjByProp(settings, indexes.fields, []);

            if (isSearch === false) {
                return false;
            }

            var searchFields = arrayFields.filter(function (field) {
                var searchable = Fn._getObjByProp(field, indexes.fieldOptions.searchable, false);
                var type = Fn._getObjByProp(field, indexes.fieldOptions.type, "");
                if (fnProductify.debug) {
                    console.log('arrayFields.filter()', {
                        field: field,
                        searchable: searchable,
                        type: type
                    });
                }
                if (Fn._isStringNotEmpty(type)) {
                    return searchable && _Field._searchableType.includes(type);
                }
                return false;
            });
            if (fnProductify.debug) {
                console.log('_isValidGeneralSearch()', {
                    arguments: arguments,
                    isSearch: isSearch,
                    arrayFields: arrayFields,
                    searchFields: searchFields
                });
            }
            return searchFields.length > 0;
        },
        _getGeneralSearch: function () {
            var $listElement = $('<li/>');
            var $search = $('<div class="input-group">' +
                '<div class="input-group-prepend"><span class="input-group-text"><i class="fa fa-search "></i></span></div>' +
                '<input id="" autocomplete="new-password" type="text" class="form-control text-xs " placeholder="produit">' +
                '</div>');
            $('input', $search)
                .attr('id', models.controls.inputSearch.attr.id)
                .addClass(models.controls.inputSearch.attr.class)
            ;
            return $listElement.append($search);
        },
        _getSelectOption: function (productify, settings, fieldElement, option) {
            if (fnProductify.debug) {
                console.log('_getSelectOption', {arguments: arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);
            var optionName = Fn._getObjByProp(option, "_name", null);
            if (Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)) {
                return $('<option/>').attr('value', optionValue).text(optionName);
            }
            return null;
        },
        _getSelectFilter: function (productify, settings, fieldElement) {
            console.log({
                fieldElement: fieldElement
            });
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            var $listElement = fnProductify.controls._getListElementDropDown(productify, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if (arrayOptions.length && $listElement.length && $dropDownContainer.length) {
                var hasOption = false;
                var $select = $('<select/>').addClass('form-control').attr(models.controls.fieldNameDataAttr, fieldData);
                var $listOptionAll = fnProductify.controls._getSelectOption(productify, settings, fieldElement, {
                    _value: "-1",
                    _name: "Tout"
                });
                $select.append($listOptionAll);
                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnProductify.controls._getSelectOption(productify, settings, fieldElement, option);
                    if ($listOption && $listOption.length) {
                        hasOption = true;
                        $select.append($listOption);
                    }
                });
                if (hasOption) {
                    $dropDownContainer.append($select);
                    return $listElement;
                }
            }
            return null;

        },
        _getCheckBoxOption: function (productify, settings, fieldElement, option) {
            if (fnProductify.debug) {
                console.log('_getCheckBoxOption', {arguments: arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);

            var optionName = Fn._getObjByProp(option, "_name", null);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            if (Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)) {
                var $checkboxContainer = $('<div/>').addClass('form-check');
                var $input = $('<input/>').addClass('form-check-input bg-primary')
                    .attr({
                        type: 'checkbox', checked: 'checked', value: optionValue, id: "dp-form-check-" + optionName
                    })
                    .attr(models.controls.fieldNameDataAttr, fieldData)
                    .attr(models.controls.dataFilterContainAttr, fieldElement[indexes.fieldOptions.filterContain])
                ;
                var $label = $('<label/>').addClass('form-check-label').text(optionName).attr('for', "dp-form-check-" + optionName);
                return $checkboxContainer.append($input).append($label);
            }
            return null;
        },
        _getCheckBoxFilter: function (productify, settings, fieldElement) {
            console.log({
                arguments: arguments
            });
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var $listElement = fnProductify.controls._getListElementDropDown(productify, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if (arrayOptions.length && $listElement.length && $dropDownContainer.length) {
                var hasOption = false;
                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnProductify.controls._getCheckBoxOption(productify, settings, fieldElement, option);
                    if ($listOption && $listOption.length) {
                        hasOption = true;
                        $dropDownContainer.append($listOption);
                    }
                });
                if (hasOption) {
                    return $listElement;
                }
            }
            return null;

        },
        _getCheckBoxAllergenOption: function (productify, settings, fieldElement, option) {
            if (fnProductify.debug) {
                console.log('_getCheckBoxOption', {arguments: arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);

            var optionName = Fn._getObjByProp(option, "_name", null);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            if (Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)) {
                var $checkboxContainer = $('<div/>').addClass('form-check allergen');
                var $input = $('<input/>').addClass('form-check-input bg-primary')
                    .attr({
                        type: 'checkbox', checked: 'checked', value: optionValue, id: "dp-check-allergen" + optionName
                    })
                    .attr(models.controls.fieldNameDataAttr, fieldData)
                    .attr(models.controls.dataFilterContainAttr, fieldElement[indexes.fieldOptions.filterContain])
                ;
                var $label = $('<label/>').addClass('form-check-label').text(optionName).attr("for", "dp-check-allergen" + optionName);
                return $checkboxContainer.append($input).append($label);
            }
            return null;
        },
        _getCheckBoxAllergenFilter: function (productify, settings, fieldElement) {
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var $listElement = fnProductify.controls._getListElementDropDown(productify, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if (arrayOptions.length && $listElement.length && $dropDownContainer.length) {
                var hasOption = false;
                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnProductify.controls._getCheckBoxAllergenOption(productify, settings, fieldElement, option);
                    if ($listOption && $listOption.length) {
                        hasOption = true;
                        $dropDownContainer.append($listOption);
                    }
                });
                if (hasOption) {
                    return $listElement;
                }
            }
            return null;

        },
        _getRadioOption: function (productify, settings, fieldElement, option) {
            if (fnProductify.debug) {
                console.log('_getRadioOption', {arguments: arguments});
            }
            var optionValue = Fn._getObjByProp(option, "_value", null);
            var optionName = Fn._getObjByProp(option, "_name", null);
            var fieldData = Fn._getObjByProp(fieldElement, indexes.fieldOptions.data, []);
            if (Fn._isStringNotEmpty(optionValue) && Fn._isStringNotEmpty(optionName)) {
                var $checkboxContainer = $('<div/>').addClass('form-check');
                var $label = $('<label/>').addClass('form-check-label').text(optionName);
                var $input = $('<input/>').addClass('form-check-input bg-primary').attr({
                    type: 'radio', value: optionValue
                }).attr(models.controls.fieldNameDataAttr, fieldData);
                return $checkboxContainer.append($input).append($label);
            }
            return null;
        },
        _getRadioFilter: function (productify, settings, fieldElement) {
            var arrayOptions = Fn._getObjByProp(fieldElement, indexes.fieldOptions.options, []);
            var $listElement = fnProductify.controls._getListElementDropDown(productify, settings, fieldElement);
            var $dropDownContainer = $('.dropdown-menu', $listElement);
            if (arrayOptions.length > 1 && $listElement.length && $dropDownContainer.length) {
                var hasOption = false;

                $.each(arrayOptions, function (index, option) {
                    option = option[Object.keys(option)[0]];
                    var $listOption = fnProductify.controls._getRadioOption(productify, settings, fieldElement, option);
                    if ($listOption && $listOption.length) {
                        hasOption = true;
                        $dropDownContainer.append($listOption);
                    }
                });
                if (hasOption) {
                    return $listElement;
                }
            }
            return null;
        }
    };














    /** ********** Optionizer ************/

    var _oIndexes = {
        _maxQty : "_maxQty",
        _isMulti : "_isMulti",
        _price : "_price",
        _groupId : "_groupId",
        options : "options",
        _extraOptions : "_extraOptions",
        _extraOptionsTotal : "_extraOptionsTotal",
        productTemplate : "productTemplate",
        src : "src",
        priceSrc : "priceSrc",
        idSrc : "idSrc",
        groupIdSrc : "groupIdSrc",
        isMultiSrc : "isMultiSrc",
        maxQtySrc : "maxQtySrc",
        arrayOptionSrc : "arrayOptionSrc"
    };


    /**
     * @module optionizer
     * @type {optionizer}
     * @param {Object} settingOption
     * @param {productify} productify
     * @param {Object} product
     * @param {integer} qty
     */
    var Optionizer = $.fn.productify.optionizer = function $_fn_productify_optionizer(productify, product, qty) {
        var that = this;
        var optionizerOption = Fn._getObjByProp(productify.settings, indexes.optionizer, {});
        that.settings = optionizerOption;
        console.log(that.settings);
        function isValid() {
            var
                priceSrc = Fn._getObjByProp(that.settings, _oIndexes.priceSrc, null),
                idSrc = Fn._getObjByProp(that.settings, _oIndexes.idSrc, null),
                groupIdSrc = Fn._getObjByProp(that.settings, _oIndexes.groupIdSrc, null),
                isMultiSrc = Fn._getObjByProp(that.settings, _oIndexes.isMultiSrc, null),
                maxQtySrc = Fn._getObjByProp(that.settings, _oIndexes.maxQtySrc, null),
                arrayOption = Fn._getObjByProp(that.settings, _oIndexes.arrayOptionSrc, null)
            ;
            return Fn._isStringNotEmpty(priceSrc) && Fn._isStringNotEmpty(idSrc) && Fn._isStringNotEmpty(groupIdSrc) &&
                Fn._isStringNotEmpty(isMultiSrc) && Fn._isStringNotEmpty(maxQtySrc) && Fn._isStringNotEmpty(arrayOption) &&
                productify && ! $.isEmptyObject(product) && Fn._isInteger(qty) && qty > 0
            ;

        }

        if(isValid() === false){
            BootstrapNotify.danger("", "Configuration non correct");
            return null;
        }

        qty = Math.abs(parseInt(qty));



        that.productTemplate = that.settings.productTemplate;

        that.qty = qty;


        var _optionsGroup = Fn._getObjByProp(productify.option(), "productOptions", []);
        if( !Fn._isSameType(_optionsGroup, [])){
            _optionsGroup = [];
        }

        var _optionArray = [];
        $.each(_optionsGroup, function (groupIndex, group) {
            var groupId = Object.keys(group)[0];
            if(Fn._isStringNotEmpty(groupId)){
                group = Fn._getObjByProp(group, groupId, {});
                var groupOptions = Fn._getObjByProp(group, 'options', []);
                var maxQty = Fn._getObjByProp(group, that.settings[_oIndexes.maxQtySrc], 0);
                maxQty = Fn._isNumeric(maxQty) ? Math.abs(parseInt(maxQty)) : 0;
                var isMultiple = Fn._getObjByProp(group, 'isMultiple', true);


                console.log({
                    group : group
                });
                group[_oIndexes._isMulti] = isMultiple;
                group[_oIndexes._groupId] = groupId;
                group[_oIndexes._maxQty] = maxQty;
                if(Fn._isSameType(groupOptions, [])){
                    $.each(groupOptions, function (eIndex, element) {
                        var optionId = Object.keys(element)[0];
                        var option = Fn._getObjByProp(element, optionId, {});
                        var price = Fn._getObjByProp(option, that.settings[_oIndexes.priceSrc], 0);
                        price = Fn._isNumeric(price) ? Math.abs(parseInt(price)) : 0;
                        option[_oIndexes._isMulti] = isMultiple;
                        option[_oIndexes._groupId] = groupId;
                        option[_oIndexes._maxQty] = maxQty;
                        option[_oIndexes._price] = price;

                    });
                    _optionArray = _optionArray.concat(groupOptions);
                }


            }
        });

        console.log({
            _optionArray : _optionArray
        });
        product[_oIndexes._extraOptions] = [];
        that.product = product;

        that.option = function (optionId) {
            var returnOpt = null;
            if(_optionArray.length > 0){
                returnOpt =  _optionArray.find(function (element) {
                    var id = Object.keys(element)[0];
                    return optionId === id;
                });
            }
            return returnOpt;
        };

        that.optionGroup = function () {
            return _optionsGroup;
        };

        that.addOption = function (optionId) {
            var opt = that.option(optionId);
            console.log("that.addOption", {
                opt : opt
            });
            if(!$.isEmptyObject(opt)){
                var optId = Object.keys(opt)[0];
                var optElem = Fn._getObjByProp(opt, optId, null);
                if(!$.isEmptyObject(optElem)){
                    if(optElem[_oIndexes._isMulti] === false){
                        removeOptionByGroupId(optElem[_oIndexes._groupId]);
                    }
                }
                that.product[_oIndexes._extraOptions].push(opt);
            }
            return that.update();
        };

        function removeOptionByGroupId(_groupId) {
            if(Fn._isStringNotEmpty(_groupId)){
                that.product[_oIndexes._extraOptions] = that.product[_oIndexes._extraOptions].filter(function (element) {
                    var elementId = Object.keys(element)[0];
                    var elementOption = element[elementId];
                    return elementOption[_oIndexes._groupId] !== _groupId;
                });
            }

        }

        that.removeOption = function (optionId) {
            that.product[_oIndexes._extraOptions] = that.product[_oIndexes._extraOptions].filter(function (element) {
                console.log({
                    element : element
                });
                var elementId = Object.keys(element)[0];
                return elementId !== optionId;
            });
            return that.update();
        };


        that.update = function () {
            fnOptionizer.product._updatePrice(that, productify);
            return that;
        };

        that.total = function () {
            var productTotal = getSingleProductTotal();
            return (productTotal * that.qty);
        };

        function getSingleProductTotal() {
            console.log("getSingleProductTotal", {
                _extraOptions : that.product[_oIndexes._extraOptions]
            });
            var optionTotal = 0;
            $.each(that.product[_oIndexes._extraOptions], function (index, element) {

                var optionId = Object.keys(element)[0];
                var option = Fn._getObjByProp(element, optionId, {});
                optionTotal += option[_oIndexes._price];
            });
            that.product[_oIndexes._extraOptionsTotal] = optionTotal;

            return that.product.price + optionTotal;
        }






        console.log({optionizerOption : optionizerOption, productify : productify, product : that.product, qty : qty, productifyOptions : _optionsGroup});


        var isDrown = fnOptionizer._draw(that, productify);
        if(isDrown){
            fnOptionizer.initListener(that, productify);
        }else {
            productify.addToCart(that.product, qty);
        }
    };

    var optionizerDefault = $.fn.productify.optionizer.defaults = {
        template :{},
        options : {}
    };


    optionizerDefault.template.productTemplate =
        '<div class="product-item dp-product border m-b-5 m-t-5">' +
            '{imageWebPath}' +
            '<div class="product-all-details">' +
                '<div class="visible-details">' +
                    '<div class="product-details">' +
                        '<p class="product-name primary text-sm">{name}</p>' +
                        '<p class="product-desc text-xs font-weight-normal">{description}</p>' +
                        '<div class="product-allergen">' +
                        '<p class="text-accent text-xxs m-b-5 font-weight-normal">allergènes</p>' +
                            '<div>' +
                            '{allergen}' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="product-extra">' +
                        '<div class="price">' +
                            '<div class="cart">' +
                            '<div class="product-price text-accent">{price}</div>' +
                            '<input type="number" placeholder="1" value="1" min="1" class="qty-input form-control" disabled>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    ;


    optionizerDefault.options = {
        productTemplate : optionizerDefault.template.productTemplate,
        src : "src",
        priceSrc : "",
        idSrc : "",
        groupIdSrc : "",
        isMultiSrc : "",
        maxQtySrc : "",
        arrayOptionSrc : "",
        render : function (product, arrayOptions) {
            if(arrayOptions.length){
                var optionsText = [];
                $.each(arrayOptions, function (index, element) {
                    //<span class="badge badge-pill badge-secondary allergen">Alcool</span>
                    var elementId = Object.keys(element)[0];
                    element = element[elementId];
                    var name = Fn._getObjByProp(element, "name", "");
                    if(Fn._isStringNotEmpty(name)){
                        optionsText.push(name);
                    }
                });
                var $optionizerElements = $("<div/>").addClass("text-xxxxs ");
                $optionizerElements.text(optionsText.join(", "));
                var $optionizerPrice = $("<div/>").addClass("").text("Options ("+arrayOptions.length+") : +"+Fn._intToPrice(product._extraOptionsTotal));
                var $container = $("<div/>").addClass("");
                console.log({
                    arrayOptions : arrayOptions
                });
                return $container
                    .append($optionizerPrice)
                    .append($optionizerElements)
                ;
            }
            return null;
        }
    };

    var fnOptionizer = $.fn.productify.optionizer.fn = {
        debug: false,
        $modal : $("#optionizer"),
        _getObjectIdKeys : function (obj) {
            return Object.keys(obj)[0];
        },
        _draw : function (optionizer, productify) {
            var $product = fnOptionizer.product._getProduct(optionizer, productify);
            var $options = fnOptionizer.option._getAllOption(optionizer, productify);
            console.log($product);
            if($product !== null && $options !== null){
                var $modal = fnOptionizer.$modal;
                var $form = $("<form/>");
                $('.optionizer-title', $modal).text(optionizer.product.name);
                var $modalBody = $(".modal-body", $modal);

                fnOptionizer.product._updatePrice(optionizer, productify);

                $form
                    .append($product)
                    .append($options)
                ;
                $modalBody
                    .html("")
                    .append($form)
                ;
                $modal
                    .modal({
                        // backdrop: 'static'
                    })
                ;
                return true;
            }else {
                return false;
            }

        },
        product: {
            _getProduct: function (optionizer, productify) {
                var
                    productifySettings = productify.settings,
                    arrayFields = productifySettings.fields,
                    template = optionizer.productTemplate,
                    $productItem = null
                ;

                if (Fn._isStringNotEmpty(template)) {
                    $.each(arrayFields, function (index, field) {
                        var dataSrc = Fn._getObjByProp(field, indexes.fieldOptions.data, '');
                        if (Fn._isStringNotEmpty(dataSrc)) {
                            var fieldValue = Fn._getObjByProp(optionizer.product, dataSrc, '');
                            var fieldOption = Fn._getObjByProp(field, indexes.fieldOptions.options, null);
                            var render = Fn._getObjByProp(field, indexes.fieldOptions.render, null);
                            if (fnOptionizer.debug) {
                                console.log({
                                    field: field, fieldValue: fieldValue, fieldOption: fieldOption
                                })
                            }

                            if (Fn._isFunction(render)) {
                                var fieldRender = render(fieldValue, optionizer.product, field, fieldOption);
                                fieldValue = Fn._isNotUndefined(fieldRender) ? fieldRender : fieldValue;
                            }
                            if (!Fn._isStringNotEmpty(fieldValue)) {
                                fieldValue = "";
                            }
                            var searchRegExp = new RegExp('{' + dataSrc + '}', 'g');
                            template = template.replace(searchRegExp, fieldValue);
                        }

                    });
                    $productItem = $(template);
                    $("input.qty-input", $productItem).val(optionizer.qty);
                    if (Fn._isStringNotEmpty(optionizer.product.idCode)) {
                        $productItem.attr(models.dataIdAttr, optionizer.product.idCode).addClass(models.product.attr.class);
                        return $productItem;
                    }
                }
                return null;
            },
            _animateBtn : function () {
                var $btn = $("#optionizer-confirm", fnOptionizer.$modal);
                Animation._animate($btn, Productify.defaults.animation.bounceIn);
            },
            _updatePrice : function (optionizer, productify) {
                fnOptionizer.product._animateBtn();
                $("#optionizer-total", fnOptionizer.$modal).text(Fn._intToPrice(optionizer.total()));
            }
        },
        option : {
            _getAllOption : function (optionizer, productify) {
                var optionsGroup = optionizer.optionGroup() ;
                var $allOption = null;
                if(Fn._isSameType(optionsGroup, []) && optionsGroup.length > 0){
                    $allOption = $("<div/>").addClass("dp-optionizer-container");
                    var hasOption = false;
                    $.each(optionsGroup, function (index, optionCategory) {
                        var $category = fnOptionizer.option._getCategoryOption(optionizer, productify, optionCategory);
                        if($category !== null){
                            hasOption = true;
                            $allOption.append($category.addClass(" border rounded m-b-5 text-uppercase"));
                        }
                    });
                    if(hasOption){
                        return $allOption;
                    }
                }
                return null;

            },
            _getCategoryOption : function (optionizer, productify, optionCategory) {
                var $category = null;
                var categoryId = Object.keys(optionCategory)[0];
                var productOptions = Fn._getObjByProp(optionizer.product, "productOptions");
                if( Fn._isStringNotEmpty(categoryId) && Fn._isStringNotEmpty(productOptions) && productOptions.includes(categoryId) ){
                    optionCategory = Fn._getObjByProp(optionCategory, categoryId);
                    var isMultiple = Fn._getObjByProp(optionCategory, _oIndexes._isMulti, null);
                    console.log({
                        optionCategory : optionCategory
                    });
                    if( Fn._isSameType(isMultiple, true) && !$.isEmptyObject(optionCategory) ){
                        if(isMultiple){
                            $category = fnOptionizer.option._getCategoryOptionCheckBox(
                                optionizer, productify, optionCategory, categoryId
                            );
                        }else {
                            $category = fnOptionizer.option._getCategoryOptionRadio(
                                optionizer, productify, optionCategory, categoryId
                            );
                        }
                    }
                }
                return $category;
            },
            _getCategoryOptionCheckBox : function (optionizer, productify, optionCategory, categoryId) {
                console.log({
                    optionCategory : optionCategory
                });
                var arrayOption = Fn._getObjByProp(optionCategory, "options", []);
                var categoryName = Fn._getObjByProp(optionCategory, "name", "");
                var categoryDescription = Fn._getObjByProp(optionCategory, "description", "");
                if(Fn._isSameType(arrayOption, []) && arrayOption.length > 0 && Fn._isStringNotEmpty(categoryId)){
                    var $categoryCheckBox = $("<div/>").addClass("optionizer-checkbox-container").attr("data-optionizer-id", categoryId);
                    $categoryCheckBox
                        .append( $("<div/>").addClass("text-sm primary m-b-10").text(categoryName) )
                        .append( $("<div/>").addClass("text-xs m-b-10").text(categoryDescription) )
                    ;
                    var hasCheckBox = false;
                    $.each(arrayOption, function (index, option) {

                        console.log({
                            $optionCheckbox : option
                        });
                        var optionId = Object.keys(option)[0];
                        if(Fn._isStringNotEmpty(optionId) ){
                            option = Fn._getObjByProp(option, optionId);
                            if( !$.isEmptyObject(option)){
                                var $optionCheckbox = fnOptionizer.option._getCheckBox(optionizer, productify, option, optionId);
                                console.log({
                                    $optionCheckbox : $optionCheckbox
                                });
                                if($optionCheckbox !== null){
                                    hasCheckBox = true;
                                    $categoryCheckBox.append($optionCheckbox);
                                }
                            }

                        }
                    });
                    if(hasCheckBox){
                        return $categoryCheckBox;
                    }
                }
                return null;
            },
            _getCategoryOptionRadio : function (optionizer, productify, optionCategory, categoryId) {
                var arrayOption = Fn._getObjByProp(optionCategory, "options", []);
                var categoryName = Fn._getObjByProp(optionCategory, "name", "");
                var categoryDescription = Fn._getObjByProp(optionCategory, "description", "");
                if(Fn._isSameType(arrayOption, []) && arrayOption.length > 0 && Fn._isStringNotEmpty(categoryId)){
                    var $categoryCheckBox = $("<div/>").addClass("optionizer-radio-container").attr("data-optionizer-id", categoryId);
                    $categoryCheckBox
                        .append( $("<div/>").addClass("text-sm primary m-b-10").text(categoryName) )
                        .append( $("<div/>").addClass("text-xs m-b-10").text(categoryDescription) )
                    ;
                    var hasCheckBox = false;
                    $.each(arrayOption, function (index, option) {
                        var optionId = Object.keys(option)[0];
                        if(Fn._isStringNotEmpty(optionId) ){
                            option = Fn._getObjByProp(option, optionId);
                            if( !$.isEmptyObject(option)){
                                var $optionCheckbox = fnOptionizer.option._getRadio(optionizer, productify, option, optionId);
                                if($optionCheckbox !== null){
                                    hasCheckBox = true;
                                    $categoryCheckBox.append($optionCheckbox);
                                }
                            }

                        }
                    });
                    if(hasCheckBox){
                        return $categoryCheckBox;
                    }
                }
                return null;
            },
            _getRadio : function (optionizer, productify, option, optionId) {
                var categoryId = Fn._getObjByProp(option, "category");
                if(Fn._isStringNotEmpty(optionId) && Fn._isStringNotEmpty(categoryId) && !$.isEmptyObject(option)){
                    var checkboxName = "optionizer-"+categoryId;
                    var checkboxId = "optionizer-"+optionId;
                    var $checkBoxContainer = $('<div/>').addClass('form-check m-l-10 m-r-10');
                    var price = Fn._getObjByProp(option, "price", 0);
                    var $inputCheckBox = $("<input/>")
                        .attr({
                            type : "radio", name : checkboxName, id : checkboxId, value : optionId,
                            required : true, "data-optionizer" : true
                        })
                        .addClass("form-check-input")
                    ;
                    var $label = $("<label/>")
                        .attr({
                            for : checkboxId
                        })
                        .addClass("form-check-label")
                    ;
                    $label.text(option.name);

                    $checkBoxContainer.append($inputCheckBox).append($label);
                    if(Fn._isSameType(price, 0) && price >0){
                        var $price = $("<span/>").addClass('float-right').text("+ "+Fn._intToPrice(price));
                        $checkBoxContainer.append($price);
                    }
                    return $checkBoxContainer;
                }
                return null;
            },
            _getCheckBox : function (optionizer, productify, option, optionId) {
                var categoryId = Fn._getObjByProp(option, "category");
                if(Fn._isStringNotEmpty(optionId) && Fn._isStringNotEmpty(categoryId) && !$.isEmptyObject(option)){
                    var checkboxName = "optionizer-"+categoryId;
                    var checkboxId = "optionizer-"+optionId;
                    var $checkBoxContainer = $('<div/>').addClass('form-check m-l-10 m-r-10');
                    var price = Fn._getObjByProp(option, "price", 0);
                    var $inputCheckBox = $("<input/>")
                        .attr({
                            type : "checkbox", name : checkboxName, id : checkboxId,
                            value : optionId, "data-optionizer" : true
                        })
                        .addClass("form-check-input")
                    ;
                    var $label = $("<label/>")
                        .attr({ for : checkboxId })
                        .addClass("form-check-label")
                    ;
                    $label.text(option.name);

                    $checkBoxContainer.append($inputCheckBox).append($label);
                    if(Fn._isSameType(price, 0) && price >0){
                        var $price = $("<span/>").addClass('float-right').text("+ "+Fn._intToPrice(price));
                        $checkBoxContainer.append($price);
                    }
                    return $checkBoxContainer;
                }
                return null;
            },
            _enableDisableCheckbox : function (optionizer, productify, optionId) {
                if(Fn._isStringNotEmpty(optionId)){
                    var option = optionizer.option(optionId);
                    if(!$.isEmptyObject(option)){
                        option = option[optionId];
                        var groupId = Fn._getObjByProp(option, _oIndexes._groupId, null);
                        var maxQty = Fn._getObjByProp(option, _oIndexes._maxQty, 0);
                        if(Fn._isStringNotEmpty(groupId) && Fn._isInteger(maxQty) && maxQty > 0){
                            var $checked = $("[name='optionizer-"+groupId+"']:checked");
                            var $notChecked = $("[name='optionizer-"+groupId+"']:not(:checked)");
                            if($checked.length < maxQty){
                                $notChecked.prop("disabled", false);
                            }else {
                                $notChecked.prop("disabled", true);
                            }
                            console.log({
                                $checked : $checked,
                                $notChecked : $notChecked,
                                groupId : groupId,
                                maxQty : maxQty
                            })
                        }
                    }
                    console.log({
                        option : option
                    });
                }
            }
        }
    };

    fnOptionizer.render = function (product, arrayOptions) {
        console.log({
            arrayOptions : arrayOptions
        });
    };


    var optionizerListener = {
        _modalHide : function () {
            fnOptionizer.$modal.on('hidden.bs.modal', function (e) {
                $(".modal-body", this).empty();
                $('.optionizer-title', this).text("");
            })
        },
        _formValidate : function (optionizer, productify) {
            $("form", fnOptionizer.$modal).validate({
                errorClass: 'is-invalid',
                validClass: 'is-valid',
                errorElement: "div",
                errorPlacement: function (error, element) {
                    element.parent().append(error);
                },
                submitHandler: function(form) {
                    productify.addToCart(optionizer.product, optionizer.qty);
                    fnOptionizer.$modal.modal('hide');
                }
            });
        },
        _confirmProduct : function (optionizer, productify) {
            var $btn = $("#optionizer-confirm", fnOptionizer.$modal);
            if($btn.length){
                $btn.off('click').on('click', function () {
                    $("form", fnOptionizer.$modal).submit();
                });
            }
        },
        _chooseRadio : function (optionizer, productify) {
            var $radio = $("input[type='radio'][data-optionizer='true']", fnOptionizer.$modal);
            console.log({
                $radio : $radio
            });
            if($radio.length){
                $radio.off('change').on('change', function () {
                    var $this = $(this);
                    var optionId = $this.val();
                    if(Fn._isStringNotEmpty(optionId)){
                        optionizer.addOption(optionId);
                    }
                    console.log("$radio changed", {
                        $this : $this, optionId : optionId
                    });

                });
            }
        },
        _checkboxClick : function (optionizer, productify) {
            var $checkbox = $("input[type='checkbox'][data-optionizer='true']", fnOptionizer.$modal);
            console.log({
                $checkbox : $checkbox
            });
            if($checkbox.length){
                $checkbox.off('change').on('change', function () {
                    var $this = $(this);
                    var optionId = $this.val();
                    if(Fn._isStringNotEmpty(optionId)){
                        var isChecked = $this.is(':checked');
                        if(isChecked){
                            optionizer.addOption(optionId);
                        }else {
                            optionizer.removeOption(optionId);
                        }
                        fnOptionizer.option._enableDisableCheckbox(optionizer, productify, optionId);
                        console.log({
                            isChecked : isChecked
                        });
                    }
                    console.log("$checkbox changed", {
                        $this : $this, optionId : optionId
                    });
                });
            }
        }
    };

    fnOptionizer.initListener = function (optionizer, productify) {
        $.each(optionizerListener, function (index, listener) {
            if (Fn._isFunction(listener)) {
                listener(optionizer, productify);
            }
        });
    }



}(jQuery));
