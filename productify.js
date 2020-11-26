
/**
 * The jQuery plugin productify.
 * @name productify
 * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
 */

var _Field;
(function ($) {
    // $ = jQuery.noConflict();



    /**
     *
     * @int
     * @constant {string} _apiSrc
     * @description test
     * @type {string}
     * @default '/_api/_eshop/'
     */
    var _apiSrc = '/_api/_eshop/',
        lang = Fn._getLang()
    ;

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
     * Show comments
     * @class productify
     * @param {object} options
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

        var productsData = [];

        var productsOptions = {};

        var productsCart = {};

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
                productsData = data;
                _displayProductsData = productsData.slice();
            }
            return productsData;
        }

        function setOption(options) {
            if (Fn._isSameType(options, []) && !$.isEmptyObject(options)) {
                productsOptions = options;
                $.each(settings.fields, function (index, field) {
                    var data = field[indexes.fieldOptions.data];
                    var fieldOption = Fn._getObjByProp(productsOptions, data, null);
                    if (fieldOption !== null) {
                        field[indexes.fieldOptions.options] = fieldOption;
                    }
                });
            }
            return productsOptions;
        }

        function updateCart(product, qty) {
            qty = parseInt(qty);
            Productify.event.onUpdateCart(that);
            var idSrc = Fn._getObjByProp(settings, indexes.idSrc, "");
            var productId = Fn._getObjByProp(product, idSrc, null);
            if (Productify.defaults.debug) {
                console.log("updateCart(product, qty)", {
                    product: product, qty: qty, idSrc: idSrc, productsCart: productsCart, productId: productId
                });
            }
            if (Fn._isStringNotEmpty(productId)) {
                if (qty > 0) {
                    //add
                    if (Fn._getObjectLength(productsCart) > 0) {
                        var element = Fn._getObjByProp(productsCart, productId, null);
                        if (Productify.defaults.debug) {
                            console.log("Fn._getObjectLength(productsCart) > 0", {
                                element: element
                            });
                        }
                        if (element) {
                            var elementQty = parseInt(Fn._getObjByProp(element, indexes.fieldOptions._qty, 0));
                            qty = elementQty + qty;
                        }
                    }
                    product[indexes.fieldOptions._qty] = qty;
                    productsCart[productId] = product;
                    fnProductify.cart._addElementToCart(that, product);

                } else {
                    //remove
                    if (Fn._getObjectLength(productsCart) > 0) {
                        var cartElement = Fn._getObjByProp(productsCart, productId, null);
                        if (cartElement) {
                            var cartElementQty = cartElement[indexes.fieldOptions._qty];
                            var qtyAbsolute = Math.abs(qty);
                            if (qtyAbsolute >= cartElementQty || qty === 0) {
                                delete productsCart[productId];
                            } else {
                                productsCart[indexes.fieldOptions._qty] = cartElementQty + qty;
                            }
                        }
                    }

                }
                updateSession();
                fnProductify.cart._updateCartTotal(that);
            }
        }

        function updateSession() {
            if (Fn._isStringNotEmpty(settings.sessionUrl)) {
                if (Productify.defaults.debug) {
                    console.log("updateSession() called", {productsCart: that.cart()});
                }


                $.post(settings.sessionUrl, {
                    _q: 'cart', _cartElements: productsCart,
                    merchantId: settings.merchantId, lang: settings.lang, _event: "update"
                }).done(function (ajaxResponse) {
                    if (Productify.defaults.debug) {
                        console.log("updateSession() called", {
                            productsCart: productsCart,
                            ajaxResponse: ajaxResponse
                        });
                    }
                });
            }
        }

        function loadSessionCart() {
            if (Productify.defaults.debug) {
                console.log("loadSessionCart() called", {});
            }
            if (Fn._isStringNotEmpty(settings.sessionUrl)) {

                $.post(settings.sessionUrl, {
                    _q: 'cart', _event: "load", merchantId: settings.merchantId, lang: settings.lang
                }).done(function (response) {
                    response = JSON.parse(response);
                    var arrayCartElement = response.data;
                    if (Fn._getObjectLength(arrayCartElement) > 0) {
                        $.each(arrayCartElement, function (index, cartElement) {
                            if (Productify.defaults.debug) {
                                console.log({cartElement: cartElement});
                            }
                            var _qty = Fn._getObjByProp(cartElement, indexes.fieldOptions._qty, null);
                            if (_qty !== null) {
                                that.addToCart(cartElement, parseInt(_qty));
                            }
                        });
                    }
                });
            }
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

                    // console.log({
                    //     dataElement : dataElement,
                    //     arraySearchField : arraySearchField
                    // });
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

                        // console.log({
                        //     field : field,
                        //     index : i,
                        //     fieldValue : fieldValue,
                        //     fieldOption : fieldOption,
                        //     render : render,
                        //     searchValue : searchValue
                        //
                        // });
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

        that.productTemplate = Productify.template.product;

        if (Fn._isStringNotEmpty(settings.templateSelector)) {
            var $template = $(settings.templateSelector);
            if ($template.length) {
                that.productTemplate = $template.html();
                $template.remove();
            }
        }


        Productify.event.init(that);

        /**
         * END Public property
         */


        /**
         * Public functions
         */

        that.data = function () {
            return productsData;
        };

        that.option = function () {
            return productsOptions;
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
            return productsCart;
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
            Productify.event.onAddProduct(that, product);
            if (Productify.defaults.debug) {
                console.log("productify.addToCart(product, qty) called", {product: product, qty: qty});
            }

            qty = Fn._isSameType(qty, 1) && qty > 0 ? qty : 1;
            updateCart(product, qty);
            return that;
        };

        that.removeFromCart = function (product, qty) {
            if (Productify.defaults.debug) {
                console.log("productify.removeFromCart(product, qty) called", {product: product, qty: qty});
            }
            Productify.event.onRemoveProduct(that, product);

            qty = Fn._isSameType(qty, 1) ? -Math.abs(qty) : 0;

            updateCart(product, qty);

            return that;
        };

        that.emptyCart = function () {
            if (Productify.defaults.debug) {
                console.log("productify.removeFromCart(product, qty) called");
            }
            Productify.event.onEmptyProduct(that);
            productsCart = {};
            updateSession();
            fnProductify.cart._updateCartTotal(that);

            return that;
        };

        that.cartTotal = function () {
            var arrayCartItems = that.cart();
            var total = 0;
            $.each(arrayCartItems, function (index, element) {
                var priceSrc = Fn._getObjByProp(that.settings, indexes.priceSrc, '');
                var productQty = Fn._getObjByProp(element, indexes.fieldOptions._qty, -1);
                var productPrice = Fn._getObjByProp(element, priceSrc, -1);
                if (productPrice && productQty) {
                    total += (productPrice * productQty);
                }
            });
            return total;
        };

        that.draw = function () {
            Productify.event.onDraw(that);

            fnProductify.product._drawProducts(that, settings, _displayProductsData);

            fnProductify.cart._updateCartTotal(that);
            Productify.listener.addProductBtn(that);

            return that;
        };

        that.init = function () {
            Productify.event.preInit(that);
            var
                url = settings.ajax,
                dataSrc = settings.dataSrc
            ;
            Productify.event.onInit(that);
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
                    Productify.event.initDraw(that);
                    Productify.event.preDraw(that);
                    fnProductify.controls._drawControl(that, settings);
                    fnProductify.fieldsGroup._loadFieldsGroup(that, settings);
                    that.draw();

                    Productify.event.postDraw(that);

                    Productify.initListener(that);
                });
            }

            Productify.event.postInit(that);
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
                productsData: productsData,
                arguments: arguments
            };


            if (arguments.length > 0) {


                var processTime = Date.now();
                var search = arguments[0];
                if (Fn._isSameType(search, "")) {
                    console.log({
                        search: search, jsonData: productsData
                    });
                    _displayProductsData = generalSearch(productsData, search);
                }
                else if (Fn._isSameType(search, {}) && !$.isEmptyObject(search)) {
                    var genSearch = Fn._getObjByProp(search, indexes.search, "");
                    _displayProductsData = generalSearch(productsData, genSearch);


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

                            for (var i_not = 0; i_not < fieldsNotContainName.length; i_not++) {
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
                            jsonData: productsData,
                            fields: searchFieldsContain
                        });
                    }
                } else {
                    _displayProductsData = productsData.slice();
                }


                processTime = Date.now() - processTime;
                debug.processTime = processTime;
                debug._displayData = _displayProductsData;
                debug.search = search;
                debug.jsonData = productsData;
                debug._lastSearchValue = _lastSearchValue;

                if (Productify.defaults.debug) {
                    console.log(debug);
                }
            }
            return that;
        };

        /**
         * END Public functions
         */
        that.init();
        return that;
    };


    Productify.defaults = {
        /**  */
        currency: '€',
        /**  */
        debug: false,
        /**  */
        options: {},
        /**  */
        field: {},
        /**  */
        fieldsGroup: {},
        /**  */
        animation: {
            bounceIn: 'bounceIn',
            bounceOut: "bounceOut"
        }
    };

    /**
     *
     * @type {{ajax: string, merchantId, lang, dataSrc: string, idSrc: string, sessionUrl: string, priceSrc: string, order: string, controlSelector: string, fieldsGroup: {idSrc: string, options: string, data: string, title: string, titleSelector: string, template: string, containerSelector: string, _valid: boolean}, search: boolean, fields: Array, image: boolean, addBtnSelector: string, qtySelector: string, removeBtnSelector: string, cartSelector: string, templateSelector: string}}
     */
    Productify.defaults.options = {
        /** url where the data should query */
        ajax: _apiSrc,
        /** merchant id is sent through ajax to retrieve the product from that merchant */
        merchantId: merchantId(),
        /** language of the query */
        lang: lang,
        /** source of the query */
        dataSrc: 'product',
        /** data's property to get the id */
        idSrc: 'idCode',
        /** url where the cart's operation should send */
        sessionUrl: _apiSrc,
        /** data's property to get the price */
        priceSrc: 'price',
        //TODO
        order: 'categoryIdCode',
        /** DOM selector to display filter's control */
        controlSelector: '',
        fieldsGroup: {
            /**  */
            idSrc: '',
            /**  */
            options: '',
            /**  */
            data: '',
            /**  */
            title: '',
            /**  */
            titleSelector: '',
            /**  */
            template: '',
            /**  */
            containerSelector: '',
            /**  */
            _valid: false
        },
        /** define if process general search or not and draw the search input */
        search: true,
        /** all fields of productify */
        fields: [],
        //TODO
        image: false,
        /**  */
        addBtnSelector: '',
        /**  */
        qtySelector: '',
        /**  */
        removeBtnSelector: '',
        /**  */
        cartSelector: '',
        /**  */
        templateSelector: ''
    };

    Productify.defaults.field.options = {
        /**  */
        data: '',
        /**  */
        title: '',
        /**  */
        type: _Productify._fieldType.text,
        /**  */
        searchable: true,
        /**  */
        filter: true,
        /**  */
        filterContain: true,
        /**  */
        render: null,
        /**  */
        options: null
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
        },
        allergen: function (fieldValue, rowData, field, options) {
            var allergenRender = "";
            if (options !== null) {
                $.each(fieldValue, function (index, allergenId) {
                    if (Fn._isStringNotEmpty(allergenId)) {
                        var allergen = options.find(function (element) {
                            var elementId = Object.keys(element)[0];
                            console.log({
                                element: element,
                                allergenId: allergenId,
                                elementId: elementId
                            });
                            return Object.keys(element)[0] === allergenId;
                        });
                        console.log({
                            allergen: allergen
                        });
                        if (Fn._isSameType(allergen, {})) {
                            allergen = allergen[Object.keys(allergen)[0]];

                            var allergenName = Fn._getObjByProp(allergen, "name", "");
                            console.log({
                                allergen: allergen
                            });
                            if (Fn._isStringNotEmpty(allergenName)) {
                                allergenRender +=
                                    '<span class="badge badge-pill badge-secondary allergen">' + allergenName + '</span>';
                            }
                        }
                    }
                });
            }
            console.log({
                name: allergenRender
            });
            return allergenRender;
        }
    };

    Productify.template = {
        product:
        '<div class="product-item elevation dp-product">' +
        // '<div class="product-image">{imageWebPath}</div>' +
        '{imageWebPath}' +
        // '<div class="product-image"><img src="/yichan.jpg" alt=""></div>' +
        '<div class="product-all-details">' +
        '<div class="visible-details">' +
        '<div class="product-details">' +
        // '<p class="product-name text-xxxs text-accent">{categoryIdCode}</p>' +
        '<p class="product-name primary text-xs">{name}</p>' +
        '<p class="product-desc text-xxs">{description}</p>' +
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
        cartElement:
        '<div class="cart-item">' +
        '<div class="cart-product-meta">' +
        '<div class="primary">{name}</div>' +
        '<span class="text-accent m-l-10">{qty}</span>' + " x " +
        '<span class="text-accent">{price}</span>' +
        '</div>' +
        '<div class="cart-item-remove">' +
        '<a href="#" class="cart-item-remove"><i class="fa fa-times  text-danger"></i></a>' +
        '</div>' +
        '</div>'
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
        }
    };

    Productify.listener = {
        addProductBtn: function (productify) {
            var $btn = $('.' + models.addBtn.attr.class);
            $btn
                .unbind('click')
                .bind('click', function (event) {
                    Productify.event.initAddProduct(productify);
                    var qtySelector = Fn._getObjByArrayProp(productify, ['settings', 'qtySelector']);
                    event.stopPropagation();
                    var $btn = $(this);
                    var $productElement = $btn.closest('.' + models.product.attr.class);
                    var inputVal = 1;
                    var $input = null;
                    if ($productElement.length && Fn._isStringNotEmpty(qtySelector)) {
                        $input = $(qtySelector, $productElement);
                        if ($input.length && Fn._isSameType(parseInt($input.val()), 1)) {
                            inputVal = parseInt($input.val());
                        }
                    }

                    if (Productify.defaults.debug) {
                        console.log({
                            productify: productify,
                            qtySelector: qtySelector,
                            inputVal: inputVal
                        })
                    }
                    var itemId = $btn.attr(models.dataIdAttr);

                    itemId = (itemId);
                    if (itemId) {
                        var product = productify.product(itemId);
                        if (Fn._isSameType(product, {})) {

                            Productify.event.preAddProduct(productify, product);
                            productify.addToCart(product, inputVal);
                            Productify.event.postAddProduct(productify, product);
                            Animation._animate($btn, Productify.defaults.animation.bounceIn);
                            if ($input.length) {
                                $input.val(1);
                            }
                        }
                    }
                })
            ;
        },
        removeProductBtn: function (productify) {
            Productify.event.initRemoveProduct(productify);
            var $btn = $('.' + models.removeBtn.attr.class);
            $btn
                .unbind('click')
                .bind('click', function (event) {

                    if (Productify.defaults.debug) {
                        console.log('removeProductBtn clicked');
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    var $btnElement = $(this);
                    var itemId = ($btnElement.attr(models.dataIdAttr));
                    if (itemId) {
                        var $element = $btnElement.closest('.' + models.cartItem.attr.class);

                        var product = productify.product(itemId);
                        if (Fn._isSameType(product, {})) {
                            Productify.event.preRemoveProduct(productify, product);
                            productify.removeFromCart(product);
                            Productify.event.postRemoveProduct(productify, product);
                            $element.detach();
                        }
                    }
                })
            ;
        },
        emptyCartBtn: function (productify) {
            Productify.event.initRemoveProduct(productify);
            var $btn = $('.' + models.emptyBtn.attr.class);
            $btn
                .unbind('click')
                .bind('click', function (event) {

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
            Productify.event.initRemoveProduct(productify);
            var $btn = $('.checkout');
            $btn
                .unbind('click')
                .bind('click', function (event) {

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
                    .unbind('keyup')
                    .bind("keyup", function () {
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
                            $this.unbind('change').bind('change', function () {

                                fnProductify.field._fieldsFilter(productify);
                            });
                        } else {

                            $this.unbind('keyup').bind("keyup", function () {
                                fnProductify.field._fieldsFilter(productify);
                            });
                        }
                    } else if (tagName === "select") {
                        $this.bind("change", function () {
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
        })
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

            }
        },
        cart: {
            _createCartRow: function (productify, data) {
                var idSrc = Fn._getObjByProp(productify.settings, indexes.idSrc, "");
                var removeBtnSelector = Fn._getObjByProp(productify.settings, indexes.removeBtnSelector, '');
                var $cartItem = null;
                var arrayFields = Fn._getObjByProp(productify.settings, indexes.fields, []);
                var template = Productify.template.cartElement;

                if (Fn._isSameType(data, {}) && Fn._isStringNotEmpty(template) && arrayFields.length) {
                    var id = Fn._getObjByProp(data, idSrc, -1);
                    if (id) {
                        $.each(arrayFields, function (index, field) {
                            var dataSrc = Fn._getObjByProp(field, indexes.fieldOptions.data, '');
                            var fieldOption = Fn._getObjByProp(field, indexes.fieldOptions.options, null);
                            if (Fn._isStringNotEmpty(dataSrc)) {
                                var fieldValue = data.hasOwnProperty(field.data) ? data[field.data] : "";
                                var render = Fn._getObjByProp(field, indexes.fieldOptions.render, null);
                                if (Fn._isFunction(render)) {
                                    fieldValue = render(fieldValue, data, field, fieldOption);
                                }
                                template = template.replace('{' + dataSrc + '}', fieldValue);
                            }

                        });
                        template = template.replace('{' + indexes.fieldOptions._qty + '}', data[indexes.fieldOptions._qty]);
                        $cartItem = $(template);

                        if (Fn._isStringNotEmpty(removeBtnSelector)) {
                            var $removeBtn = $(removeBtnSelector, $cartItem);
                            $removeBtn.attr(models.dataIdAttr, id);
                            $removeBtn.addClass(models.removeBtn.attr.class);
                        }
                        $cartItem.addClass(models.cartItem.attr.class);

                        $cartItem.attr(models.dataIdAttr, id);

                    }

                }
                return $cartItem;
            },
            _addElementToCart: function (productify, product) {
                var cartSelector = Fn._getObjByProp(productify.settings, indexes.cartSelector, '');
                var idSrc = Fn._getObjByProp(productify.settings, indexes.idSrc, "");
                var productId = Fn._isStringNotEmpty(idSrc) ? Fn._getObjByProp(product, idSrc, -1) : product[idSrc];
                if (
                    Fn._isStringNotEmpty(cartSelector) &&
                    Fn._isSameType(product, {}) && productId
                ) {
                    var $cartItems = $(cartSelector);
                    var selector = '.' + models.cartItem.attr.class + '[' + models.dataIdAttr + '=' + productId + ']';
                    var $productElement = fnProductify.cart._createCartRow(productify, product);
                    var $foundedItem = $(selector, cartSelector);
                    if ($productElement !== null) {
                        if ($foundedItem.length) {
                            $foundedItem.replaceWith($productElement);
                        } else {
                            $cartItems.append($productElement);
                        }
                        Productify.listener.removeProductBtn(productify);
                    }
                }
            },
            _updateCartTotal: function (productify) {
                var cartTotal = productify.cartTotal();
                var cartElements = productify.cart();
                var $btnCheckout = $('.checkout');
                var $btnEmpty = $('.' + models.emptyBtn.attr.class);
                if (Fn._getObjectLength(cartElements) > 0) {
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
                var
                    mergedSettings = $.extend(true, {}, Productify.defaults.options, settings),
                    arraySettingsFields = mergedSettings.fields
                ;
                var arrayFields = [];
                $.each(arraySettingsFields, function (index, element) {
                    var field = $.extend({}, Productify.defaults.field.options, element);
                    if (!Fn._isFunction(field.render)) {
                        field.render = fnProductify.field._getFieldRender(field.type, field.options);
                    }
                    arrayFields[index] = field;
                });
                mergedSettings.fields = arrayFields;
                if (fnProductify.debug) {
                    console.log("_mergeSetting", {arguments: arguments, arrayFields: arrayFields})
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
            var settings = productify.settings;

            // TODO var caseInsensitive = Fn._getObjByProp(settings, _prop.caseInsensitive, DataCardDefaults.options.caseInsensitive);
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
        _getListElement: function (productify, settings) {
            return $('<li/>');
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
        _getGeneralSearch: function (productify, settings) {
            var $listElement = fnProductify.controls._getListElement(productify, settings);
            var $search = $('<div class="input-group">' +
                '<div class="input-group-prepend"><span class="input-group-text"><i class="fa fa-search "></i></span></div>' +
                '<input id="" autocomplete="new-password" type="text" class="form-control text-xs " placeholder="produit">' +
                '</div>');
            $('input', $search).attr('id', models.controls.inputSearch.attr.id).addClass(models.controls.inputSearch.attr.class);
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
                fieldElement : fieldElement
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
                        type: 'checkbox', checked: 'checked', value: optionValue, id: "dp-check-" + optionName
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


}(jQuery));
