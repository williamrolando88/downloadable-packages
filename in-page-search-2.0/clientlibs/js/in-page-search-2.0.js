(function (ADP, jQuery) {
    'use strict';
    const RECORD_PER_PAGE = 12;
    var INDEX_COUNTER_NEWS = 0;
    var currentNewsPage = 0;
    var rightTag = '>';
    var endDivString = '</input>';
    var resultItemNewsResultNum = '.in-page__card[data-result-num="';
    var closingSquareParenthesis = '"]';
    const $sortByWrapper = $(".sort-by-wrapper");
    var lastWindowSize = "";

    ADP.Namespace(ADP, 'ADP.Components.Classes.InPageNews');
    ADP.Components.Classes.InPageNews = new ADP.Class();
    ADP.Components.Classes.InPageNews.include({
        init: function () {
            this.resultsCurrent = null;
            this.resultsFirstPage = null;
            this.resultsTotal = null;
            this.totalPages = null;
            this.currentPage = null;
            this.getPagePath();
            this.setNewsInput();
            this.queryAPI();
            this.handleDropdownOperations();
            this.setChipAndCheckCheckbox();
            this.bindEvent();
        },
        getPagePath: function () {
            let pageLocator = '',
                tags = '',
                newsString = '';
            pageLocator = window.location.pathname.split(".html")[0];
            pageLocator = pageLocator.split(".tag=")[0];
            pageLocator = pageLocator.split(".q=")[0];
            let queryString = window.location.pathname.split(".html")[0].split(pageLocator)[1];
            if (queryString !== "") {
                if (queryString.includes("q=")) {
                    if (queryString.includes("tag=")) {
                        if (queryString.split(".")[2].includes("tag=")) {
                            tags = queryString.split(".")[2].split("=")[1];
                            newsString = queryString.split(".")[1].split("=")[1];
                        }
                    } else {
                        newsString = queryString.split(".")[1].split("=")[1];
                    }
                } else {
                    if (queryString.split(".")[1].includes("tag=")) {
                        tags = queryString.split(".")[1].split("tag=")[1];
                    }
                }
            }
            this.urlParameterValues = [pageLocator, newsString, decodeURIComponent(tags.replace(/%9A/g, "/"))];
        },
        setNewsInput: function () {
            let newsStringNew = this.urlParameterValues[1]
            if (newsStringNew !== '') {
                newsStringNew = newsStringNew.replaceAll('%20', ' ');
                $('#news-text').val(newsStringNew);
                $('.news-form .clear-news-query').removeClass('hidden');
            }
        },
        urlRedirect: function (newTags) {
            const that = this;
            let tempUrl = '';
            if (newTags !== '') {
                tempUrl = that.urlParameterValues[1] !== "" ? `${that.urlParameterValues[0]}.q=${that.urlParameterValues[1]}.tag=${newTags.replace(/\//g, '%9A')}.html` : `${that.urlParameterValues[0]}.tag=${newTags.replace(/\//g, '%9A')}.html`;
            } else {
                tempUrl = that.urlParameterValues[1] !== "" ? `${that.urlParameterValues[0]}.q=${that.urlParameterValues[1]}.html` : `${that.urlParameterValues[0]}.html`;
            }
            that.urlParameterValues[2] = newTags;
            history.pushState({}, null, tempUrl);
        },
        chipOperations: function (that, value) {
            const $chipContainer = $('.in-page-news-main').find('.chip-container');
            var chipOperationName = "";
            if ($('.dropdown-list input[value="' + value + '"]').length > 0) {
                const valueArr = value.split(/[/:]/);
                const labelFor = valueArr[valueArr.length - 1];
                chipOperationName = $('.dropdown-list label[for="' + labelFor + '"]').first().text();
            } else {
                chipOperationName = $('.dropdown-list input[name="' + value + '"]').length > 0 ? $('.dropdown-list input[name="' + value + '"]').attr('name') : $('.dropdown-list input[name="' + value.toLowerCase() + '"]').attr('name');
            }
            const $chip = $('<div>').addClass('chip').attr('value', value).text(chipOperationName);
            const $chipClose = $('<div>').addClass('chipClose');
            $chip.append($chipClose);
            $chipClose.click(function () {
                $(this).parent().prop('checked', false);
                var chipNumber = $(this).parent().parent().children().length - 1;
                if (chipNumber == 0) {
                    $(".clear-all").hide();
                    $('.filter-mobile-icon').removeClass('active');
                    $('.filter-tablet-icon').removeClass('active');
                    $('.filter-tablet-icon-active').addClass('hidden');
                    $('.news-bar').removeClass('filter-on-tablet-search-bar');
                    $('.filter-mobile-icon-active').addClass('hidden');
                    $('.news-bar').removeClass('filter-on-mobile-search-bar');
                }
                else {
                    $('.filter-tablet-icon').addClass('active');
                    $('.filter-mobile-icon').addClass('active');
                    $('.filter-tablet-icon-active').removeClass('hidden');
                    $('.news-bar').addClass('filter-on-tablet-search-bar');
                    $(".filter-tag-number").text(chipNumber);
                    $(".filter-tag-number-mobile").text(chipNumber);
                    $('.filter-mobile-icon-active').removeClass('hidden');
                    $('.news-bar').addClass('filter-on-mobile-search-bar');
                }
                var valueChip = $(this).parent().attr('value');
                var mainChipContainer = $('.chip-container div[value="' + valueChip + '"]');
                mainChipContainer.remove();
                $(this).parent().remove();
                $('.dropdown-list input[value="' + that.sanitizeTag($(this).parent().attr("value")) + '"]').prop('checked', false);
                let newTags = that.urlParameterValues[2].replace($(this).parent().attr("value"), '').replace(',,', ',');
                if (newTags.slice(-1) === ',') {
                    newTags = newTags.substring(0, newTags.length - 1);
                }
                if (newTags.substring(0, 1) === ',') {
                    newTags = newTags.substring(1, newTags.length);
                }
                if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
                    let heightDropdown = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 235;
                    $(".in-page-news-filter-tags").css('height', heightDropdown);
                }
                else if (window.innerWidth <= 767) {
                    let heightDropdown = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 297;
                    $(".in-page-news-filter-tags").css('height', heightDropdown);
                }
                that.urlRedirect(newTags);
                that.queryAPI();
            });
            $('.chip-container').append($chip);
            var chipNumbers = $('.left-chip-container').children().length;
            if (chipNumbers == 0) {
                $(".clear-all").hide();
                $('.filter-mobile-icon').removeClass('active');
                $('.filter-tablet-icon').removeClass('active');
                $('.filter-tablet-icon-active').addClass('hidden');
                $('.news-bar').removeClass('filter-on-tablet-search-bar');
                $('.filter-mobile-icon-active').addClass('hidden');
                $('.news-bar').removeClass('filter-on-mobile-search-bar');
            }
            else {
                $('.filter-tablet-icon').addClass('active');
                $('.filter-mobile-icon').addClass('active');
                $('.filter-tablet-icon-active').removeClass('hidden');
                $('.news-bar').addClass('filter-on-tablet-search-bar');
                $(".filter-tag-number").text(chipNumbers);
                $(".filter-tag-number-mobile").text(chipNumbers);
                $('.filter-mobile-icon-active').removeClass('hidden');
                $('.news-bar').addClass('filter-on-mobile-search-bar');
            }
            if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
                let heightDropdown = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 235;
                $(".in-page-news-filter-tags").css('height', heightDropdown);
            }
            else if (window.innerWidth <= 767) {
                let heightDropdown = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 247;
                $(".in-page-news-filter-tags").css('height', heightDropdown);
            }
        },
        sanitizeTag: function (string) {
            string = string.toString();
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            const reg = /[&<>"']/ig;
            return string.replace(reg, (match) => (map[match]));
        },
        setChipAndCheckCheckbox: function () {
            if (this.urlParameterValues[2] !== '') {
                const tags = this.urlParameterValues[2].split(",");
                const that = this;
                $.each(tags, function (index, value) {
                    $('.dropdown-list input[value="' + value + '"]').prop('checked', true);
                    that.chipOperations(that, value);
                });
            }
        },
        handleDropdownOperations: function () {
            const that = this;
            const $dropdownButton = $('.dropdown-button');
            const $dropdownList = $('.dropdown-list');
            const $dropdownItems = $('.in-page-news-main').find('.dropdown-item');
            const $chipContainer = $('.chip-container');
            const $clearAll = $('.in-page-news-main .clear-all');
            // const $dropdownHeaderItems = $('.in-page-news-main').find('.dropdown-header-item');
            // const $seperator = $('.in-page-news-main').find('.filterSeperator');
            const $applyFilterButton = $('.dropdown-list input');
            $dropdownButton.unbind("click");
            $dropdownButton.click(function () {
                $dropdownButton.toggleClass('open');
                $dropdownList.css('display') === 'block' ? $dropdownList.css('display', 'none') : $dropdownList.css('display', 'block');
            });
            $clearAll.unbind('click');
            $clearAll.click(function () {
                $dropdownButton.toggleClass('open');
                const newUrl = that.urlParameterValues[1] !== "" ? `${that.urlParameterValues[0]}.q=${that.urlParameterValues[1]}.html` : `${that.urlParameterValues[0]}.html`;
                history.pushState({}, null, newUrl);
                that.urlParameterValues[2] = "";
                $dropdownItems.each(function () {
                    $(this).prop('checked', false);
                });
                $chipContainer.empty();
                that.queryAPI();
                $clearAll.hide();
                $('.filter-mobile-icon').removeClass('active');
                $('.filter-tablet-icon').removeClass('active');
                $('.filter-tablet-icon-active').addClass('hidden');
                $('.news-bar').removeClass('filter-on-tablet-search-bar');
                $('.filter-mobile-icon-active').addClass('hidden');
                $('.news-bar').removeClass('filter-on-mobile-search-bar');
                if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
                    let heightDropdown = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 235;
                    $(".in-page-news-filter-tags").css('height', heightDropdown);
                }
                else if (window.innerWidth <= 767) {
                    let heightDropdown = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 247;
                    $(".in-page-news-filter-tags").css('height', heightDropdown);
                }
                return false;
            });
            $dropdownItems.each(function () {
                $(this).click(function () {
                    let tempUrl = '';
                    const urlParams = that.urlParameterValues;
                    if ($(this).prop('checked')) {
                        if (urlParams[2] !== "") {
                            tempUrl = urlParams[1] !== "" ? `${urlParams[0]}.q=${urlParams[1]}.tag=${urlParams[2].replace(/\//g, '%9A')},${$(this).val().replace(/\//g, '%9A')}.html` : `${urlParams[0]}.tag=${urlParams[2].replace(/\//g, '%9A')},${$(this).val().replace(/\//g, '%9A')}.html`
                        } else {
                            tempUrl = urlParams[1] !== "" ? `${urlParams[0]}.q=${urlParams[1]}.tag=${$(this).val().replace(/\//g, '%9A')}.html` : `${urlParams[0]}.tag=${$(this).val().replace(/\//g, '%9A')}.html`;
                        }
                        that.urlParameterValues[2] = that.urlParameterValues[2] !== '' ? `${that.urlParameterValues[2]},${$(this).val()}` : $(this).val();
                        history.pushState({}, null, tempUrl);
                    } else {
                        let newTags = urlParams[2].replace($(this).val(), '').replace(',,', ',');
                        if (newTags.slice(-1) === ',') {
                            newTags = newTags.substring(0, newTags.length - 1);
                        }
                        that.urlRedirect(newTags);
                    }
                    let filterCount = 0;
                    $dropdownItems.each(function () {
                        if ($(this).prop('checked')) {
                            filterCount++;
                        }
                    });
                    if (filterCount == 0) {
                        $clearAll.click();
                        $clearAll.hide();

                    } else {

                        $clearAll.show();
                    }

                });
            });


            $applyFilterButton.on("change", function () {
                const $dropdownButton = $('.dropdown-button');
                const $dropdownList = $('.dropdown-list');
                $dropdownButton.removeClass('open');
                const tags = that.urlParameterValues[2].split(",");
                $('.in-page-news-main .chip-container').html('');
                $.each(tags, function (index, value) {
                    if (value != '') {
                        that.chipOperations(that, value);
                    }
                });
                if (tags != '') {
                    currentNewsPage = 0;
                    // TODO: Update logic here
                    $('#inpage-news-list-view').html(""); // New element
                    $('#inpage-news-list-list-view').html("");
                    $('#inpage-news-list-card-view').html("");
                    $('#news-pagination-here').html('');
                    that.queryAPI();
                }
            });
        },
        buildRequestUrl: function () {
            let siteLanguage = $('#header-container').attr('data-language').substring(0, 2);
            if (siteLanguage !== "en" && siteLanguage !== "fr" && siteLanguage !== "es") {
                siteLanguage = "standard";
            }
            let encodeNewsTerm = '';
            const urlParams = this.urlParameterValues;
            let tempUrl = '';
            tempUrl = urlParams[0];
            encodeNewsTerm = urlParams[1];
            // New pages are brought in at the 'All' tab, so this is defaulted to zero for consistency
            let startingIndexPoint = currentNewsPage * RECORD_PER_PAGE;
            const apiCallString = "/bin/adp/onprem/corporatesearch?queryString=";
            const queryPagesSpecificsString = "&contentType=NEWS,PAGE&lang=";
            const tagParameter = "&primaryTags=";
            const basicTagParameter = "&tags=";
            let filtersQueryString = urlParams[2];
            encodeNewsTerm = encodeNewsTerm.trim();
            let url = '';
            if (encodeNewsTerm !== '') {
                let newsTerm = encodeNewsTerm.replaceAll('%20', ' ');
                url = `${apiCallString}${encodeURIComponent(newsTerm)}${tagParameter}${filtersQueryString}${basicTagParameter}${filtersQueryString}${queryPagesSpecificsString}${siteLanguage}`;
            } else {
                url = `${apiCallString}*${tagParameter}${filtersQueryString}${basicTagParameter}${filtersQueryString}${queryPagesSpecificsString}${siteLanguage}`;
                url += '&sortBy=date';
            }
            if ($(".threeSearch").length > 0 && (startingIndexPoint != 0)) {
                startingIndexPoint = startingIndexPoint + 3;
            }
            else if ($(".oneSearch").length > 0 && (startingIndexPoint != 0)) {
                startingIndexPoint = startingIndexPoint + 1;
            }
            url += '&from=' + startingIndexPoint;
            // Size should be always proportional to record per page
            if ($(".threeSearch").length > 0) {
                url += '&size=63';
            }
            else if ($(".oneSearch").length > 0) {
                url += '&size=61';
            }
            else {
                url += '&size=60';
            }
            url += '&includeForTags=true';
            url += '&searchTypes=inPage';
            url += '&mimeType=ALL';
            url += '&sites=' + pagepath;
            var newsMethod = localStorage.getItem('news-news-inpage');
            if (newsMethod && newsMethod === 'score') {
                url += "&sortBy=score";
            } else {
                url += "&sortBy=date";
            }
            return url;
        },
        queryAPI: function () {
            console.log('this is a query api function')
            let _this = this,
                // TODO: delete after local dev
                // requestUrl = this.buildRequestUrl();
                requestUrl = "http://localhost:3000/search"
            let xhr = null;
            xhr = jQuery.get(requestUrl)
                .fail(function (jqXHR, textStatus, error) {
                    _this.resultsFirstPage = [];
                    _this.resultsTotal = 0;
                })
                .done(function (data) {
                    // TODO: Enable after local dev
                    const resultData = data;
                    if (!resultData.hasOwnProperty('error')) {
                        _this.resultsTotal = parseInt(resultData.numFound, 10);
                        let tileHTML = "";
                        let tileHTML2 = "";
                        let tileHTML3 = "";
                        let topicsFilter = new Set();
                        // TODO: Update this logic
                        $('#inpage-news-list-view').html(""); // New element
                        $('#inpage-news-list-list-view').html("");
                        $('#inpage-news-list-card-view').html("");
                        _this.resultsTotal == 0 ? $sortByWrapper.addClass('hidden') : $sortByWrapper.removeClass('hidden');
                        if (resultData.results.length == 0) {
                            $(".scroll-button-Mobile").css("display", "none");
                        }

                        jQuery.each(resultData.results, function (index, result) {
                            let path = "";
                            if (window.innerWidth >= 1024) {
                                path = result.thumbnail || imgPath || '/etc/clientlibs/adp/base/images/logo-spark.svg';
                            } else {
                                path = result.thumbnail || imgPath || '/etc/clientlibs/adp/base/images/logo-spark.svg';
                            }
                            const altText = _this.getImgAltText(path);
                            let resultCount;
                            if ($(".threeSearch").length > 0 && requestUrl.indexOf("from=0") == -1) {
                                resultCount = currentNewsPage * RECORD_PER_PAGE + index + 4;
                            }
                            else if ($(".oneSearch").length > 0 && requestUrl.indexOf("from=0") == -1) {
                                resultCount = currentNewsPage * RECORD_PER_PAGE + index + 2;
                            }
                            else {
                                resultCount = currentNewsPage * RECORD_PER_PAGE + index + 1;
                            }
                            let resultTags = '';
                            if (result.hasOwnProperty("primary_tag_title") && result["primary_tag_title"] != "") {
                                resultTags = result["primary_tag_title"];
                            }

                            let pressCenterPageLink = result.presskit != undefined ? result.presskit : '';
                            let pressCenterHTML = '',
                                formattedArticleDate = '';
                            if (pressCenterPageLink != '') {
                                pressCenterHTML = '<div class="pressCenter-link" href="' + result.path + '.html">' +
                                    '<div class="pressCenter-Icon"></div>' + '<span class="press-center-html"> Press Center' +
                                    ' </span> </div>\n';
                            }

                            if (result.last_Modified != undefined && result.last_Modified != '') {
                                let articleDateObj = new Date(result.last_Modified);
                                let articleDateMonth = articleDateObj.getMonth() + 1;
                                let articleDateYear = articleDateObj.getFullYear();
                                let articleDateDate = ('0' + articleDateObj.getDate()).slice(-2);
                                formattedArticleDate = [
                                    articleDateYear, ('0' + (articleDateMonth)).slice(-2), articleDateDate
                                ].join('-');
                                if (!showInternationalDate) {
                                    const months = ["Jan.", "Feb.", "March", "April", "May", "June",
                                        "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."
                                    ];
                                    formattedArticleDate = months[articleDateMonth - 1] + ' ' + articleDateDate + ', ' + articleDateYear;
                                }
                            }
                            let resultTagsClass = "in-page__topic-tag";
                            let tagPresskitPadding = "";
                            if (resultTags == '') {
                                tagPresskitPadding = "0px";
                            } else {
                                if (result.hasOwnProperty("tags") && result.tags.length > 0) {
                                    topicsFilter.add(result.tags[0]);
                                }
                                tagPresskitPadding = "0px";
                            }
                            var title_value;
                            if (result.title != undefined) {
                                title_value = result.title.standard;
                            }
                            var description_value;
                            if (result.description != undefined) {
                                description_value = result.description.standard;
                            }

                            if (($('#news-text').length == 0 || $('#news-text').val().length == 0) && $('.chip-container').children().length == 0) {
                                $('.featured-article').show();
                                $('.featureArticleTitle').show();
                                if ($('.featured-article').hasClass("threeSearch") || $('.featured-article').hasClass("threeManualArticles")) {
                                    $(".scroll-button-Mobile").css("display", "block");
                                    $(".scroll-button").css("display", "block");
                                }
                            }
                            if ($('.featured-article').hasClass("oneSearch") && result == resultData.results[0] && requestUrl.indexOf("from=0") !== -1 && resultData.results.length > 1 && ($('#news-text').length == 0 || $('#news-text').val().length == 0)) {
                                $(".enable-one-featured-article a").attr('href', result.path + ".html");
                                $(".enable-one-featured-article img").attr('alt', altText);
                                $(".enable-one-featured-article img").attr('src', path);
                                $(".enable-one-featured-article p.in-page__topic-tag-featured-article").text(resultTags);
                                $(".enable-one-featured-article p.in-page__title-featured-article").text(title_value);
                                $(".enable-one-featured-article p.in-page__date-featured-article").text(formattedArticleDate);
                                $(".enable-one-featured-article div.in-page__footer").append(pressCenterHTML);
                                $(".featured-article.oneSearch").css('height', "auto");
                                $(".scroll-button").css("display", "none");
                                $(".scroll-button-Mobile").css("display", "none");
                                if (window.innerWidth <= 767) {
                                    $(".featured-article.oneSearch").css('width', "auto");
                                    $(".featured-article.oneSearch").css('display', "flex");
                                    $(".featured-article.oneSearch").css('justify-content', "center");
                                }

                            } else if ($('.featured-article').hasClass("threeSearch") && result == resultData.results[0] && requestUrl.indexOf("from=0") !== -1 && resultData.results.length > 3 && ($('#news-text').length == 0 || $('#news-text').val().length == 0)) {
                                $(".enable-one-featured-article a").attr('href', result.path + ".html");
                                $(".enable-one-featured-article img").attr('alt', altText);
                                $(".enable-one-featured-article img").attr('src', path);
                                $(".enable-one-featured-article p.in-page__topic-tag-featured-article").text(resultTags);
                                $(".enable-one-featured-article p.in-page__title-featured-article").text(title_value);
                                $(".enable-one-featured-article p.in-page__date-featured-article").text(formattedArticleDate);
                                $(".enable-one-featured-article div.in-page__footer").append(pressCenterHTML);
                            } else if ($('.featured-article').hasClass("threeSearch") && result == resultData.results[1] && requestUrl.indexOf("from=0") !== -1 && resultData.results.length > 3 && ($('#news-text').length == 0 || $('#news-text').val().length == 0)) {
                                $(".enable-three-featured-article .one a").attr('href', result.path + ".html");
                                $(".enable-three-featured-article .one img").attr('alt', altText);
                                $(".enable-three-featured-article .one img").attr('src', path);
                                $(".enable-three-featured-article .one p.in-page__topic-tag-featured-article").text(resultTags);
                                $(".enable-three-featured-article .one p.in-page__title-featured-article").text(title_value);
                                $(".enable-three-featured-article .one p.in-page__date-featured-article").text(formattedArticleDate);
                                $(".enable-three-featured-article .one div.in-page__footer").append(pressCenterHTML);
                            } else if ($('.featured-article').hasClass("threeSearch") && result == resultData.results[2] && requestUrl.indexOf("from=0") !== -1 && resultData.results.length > 3 && ($('#news-text').length == 0 || $('#news-text').val().length == 0)) {
                                $(".enable-three-featured-article .three a").attr('href', result.path + ".html");
                                $(".enable-three-featured-article .three img").attr('alt', altText);
                                $(".enable-three-featured-article .three img").attr('src', path);
                                $(".enable-three-featured-article .three p.in-page__topic-tag-featured-article").text(resultTags);
                                $(".enable-three-featured-article .three p.in-page__title-featured-article").text(title_value);
                                $(".enable-three-featured-article .three p.in-page__date-featured-article").text(formattedArticleDate);
                                $(".enable-three-featured-article .three div.in-page__footer").append(pressCenterHTML);
                            } else {
                                tileHTML = '<li data-result-num="' + resultCount + '" class="in-page__card news-result-tag " path="' + result.path + '.html">' +
                                    '<a  class="articleLink" href="' + result.path + '.html">' +
                                    '<div class="in-page__image-wrapper">' +
                                    '   <img alt="' + altText + '" src="' + path + '"></img>' +
                                    '</div>\n' +
                                    '<div class="in-page__content-wrapper">' +
                                    '    <div class="presskit-div" style="padding-top:' + tagPresskitPadding + ';">' +
                                    '    <p class="' + resultTagsClass + '">' + resultTags + '</p>\n' +
                                    '    </div>\n' +
                                    '    <p class="in-page__title" style="-webkit-box-orient: vertical;">' + title_value + '</p>\n' +
                                    '    <div class="in-page__footer">' +
                                    '      <p class="in-page__date check">' + formattedArticleDate + '</p>\n' +
                                    pressCenterHTML +
                                    '    </div>\n' +
                                    '</div>\n' +
                                    '</a>' +
                                    '</li>';
                                tileHTML2 = '<li data-result-num="' + resultCount + '" class="in-page__card news-result-tag " path="' + result.path + '.html">' +
                                    '<a  class="articleLink" href="' + result.path + '.html">' +
                                    '<img alt="' + altText + '" src="' + path + '"></img>' +
                                    '<div class="in-page__content-wrapper">' +
                                    '    <div class="presskit-div" style="padding-top:' + tagPresskitPadding + ';">' +
                                    '    <p class="' + resultTagsClass + '">' + resultTags + '</p>\n' +
                                    '    </div>\n' +
                                    '    <p class="in-page__title" style="-webkit-box-orient: vertical;">' + title_value + '</p>\n' +
                                    '</div>\n' +
                                    '<div class="in-page__footer">' +
                                    '    <p class="in-page__date-cards">' + formattedArticleDate + '</p>\n' +
                                    pressCenterHTML +
                                    '</div>\n' +
                                    '</a>' +
                                    '</li>';
                                tileHTML3 = '<li data-result-num="' + resultCount + '" class="in-page__card news-result-tag " path="' + result.path + '.html">' +
                                    '<a  class="articleLink" href="' + result.path + '.html">' +
                                    '<div class="in-page__content-wrapper">' +
                                    '    <div class="presskit-div" style="padding-top:' + tagPresskitPadding + ';">' +
                                    '    <p class="' + resultTagsClass + '">' + resultTags + '</p>\n' +
                                    '    </div>\n' +
                                    '    <p class="in-page__title" style="-webkit-box-orient: vertical;">' + title_value + '</p>\n' +
                                    '      <p class="in-page__date check">' + formattedArticleDate + '</p>\n' +
                                    '</div>\n' +
                                    '<div class="in-page__image-wrapper">' +
                                    '   <img alt="' + altText + '" src="' + path + '"></img>' +
                                    pressCenterHTML +
                                    '</div>\n' +
                                    '</a>' +
                                    '</li>';
                                // TODO: Update the logic here
                                if (window.innerWidth <= 768) {
                                    // TODO: Check for the responsive design to see what happens on a list view
                                    $('#inpage-news-list-list-view').append(tileHTML3);
                                } else {
                                    $('#inpage-news-list-list-view').append(tileHTML);
                                }
                                // TODO: Update to prevent appending both content at the same time
                                $('#inpage-news-list-card-view').append(tileHTML2);
                                $('li').closest('.presskit-div').append(pressCenterHTML);
                            }
                        });
                        $(".numberOfArticles").text(resultData.numFound);
                        $(".showArticlesText").text(" articles found");
                        if ($(".showArticlesNumber")) {
                            // TODO: Update this logic
                            $("#inpage-news-list-card-view").css("margin-top", "32px");
                            $("#inpage-news-list-list-view").css("margin-top", "32px");
                            $("#inpage-news-list-view").css("margin-top", "32px");
                        }
                        if (resultData.results.length <= 1 || ($('#news-text').length > 0 && $('#news-text').val().length > 0) || $('.chip-container').children().length > 0) {
                            $('.featured-article').hide();
                            $('.featureArticleTitle').hide();
                            $(".scroll-button-Mobile").css("display", "none");
                            $(".scroll-button").css("display", "none");
                        } else if (resultData.results.length <= 3 || ($('#news-text').length > 0 && $('#news-text').val().length > 0) || $('.chip-container').children().length > 0) {
                            $('.featured-article').hide();
                            $('.featureArticleTitle').hide();
                            $(".scroll-button-Mobile").css("display", "none");
                            $(".scroll-button").css("display", "none");
                        }
                        $(".in-page__topic-tag-featured-article").each(function () {
                            if ($(this).text().trim() === '') {
                                $(this).hide();
                            }
                        })
                        $(".in-page__topic-tag").each(function () {
                            if ($(this).text().trim() === '') {
                                $(this).css('background', '#fff');
                            }
                        });
                        $(".in-page__topic-tag").each(function () {
                            if ($(this).text().trim() === '' && $("#inpage-news-list-list-view").hasClass("hidden")) {
                                $(this).css('display', 'none');
                                $(this).closest(".presskit-div").hide()
                                $(this).closest(".in-page__title").css('margin-top', "0px")
                            }
                        });
                        $(".in-page__topic-tag-featured-article").each(function () {
                            if ($(this).text().trim() === '') {
                                $(this).closest(".presskit-div-featured-article").css('display', 'none');
                            }
                        });
                        $('#inpage-news-list .in-page__description').each(function () {
                            var textWithSpace = $(this).text().split(' ');
                            $(this).text('');
                            var previousText = '';
                            var i = 0;
                            for (i = 0; i < textWithSpace.length; i++) {
                                $(this).text($(this).text() + ' ' + textWithSpace[i]);
                                if ($(this)[0].offsetHeight < $(this)[0].scrollHeight) {
                                    $(this).text(previousText);
                                    break;
                                } else {
                                    previousText = $(this).text();
                                }
                            }
                            if (i !== textWithSpace.length) {
                                $(this).text($(this).text() + '...');
                            }
                            if ($(this)[0].offsetHeight < $(this)[0].scrollHeight) {
                                var truncateText = $(this).text();
                                $(this).text(truncateText.substring(0, truncateText.lastIndexOf(' ')) + '...');
                            }
                        });
                        $('.in-page__card').on("click", function (e) {
                            e.preventDefault();
                            var href = $(this).find('.articleLink').attr("href");
                            if ($(this).closest('.in-page__cards-wrapper').attr('open-in-new-tab') === 'true') {
                                window.open(href, "_blank");
                            } else {
                                window.location.href = href;
                            }
                        })
                        $(".enable-one-featured-article").on("click", function (e) {
                            e.preventDefault();
                            var href = $(this).find('.article-one-link').attr("href");
                            if ($('.in-page__cards-wrapper').attr('open-in-new-tab') === 'true') {
                                window.open(href, "_blank");
                            } else {
                                window.location.href = href;
                            }
                        })
                        $(".enable-three-featured-article .one").on("click", function (e) {
                            e.preventDefault();
                            var href = $(this).find('.article-three-link-one').attr("href");
                            if ($('.in-page__cards-wrapper').attr('open-in-new-tab') === 'true') {
                                window.open(href, "_blank");
                            } else {
                                window.location.href = href;
                            }
                        })
                        $(".enable-three-featured-article .three").on("click", function (e) {
                            e.preventDefault();
                            var href = $(this).find('.article-three-link-three').attr("href");
                            if ($('.in-page__cards-wrapper').attr('open-in-new-tab') === 'true') {
                                window.open(href, "_blank");
                            } else {
                                window.location.href = href;
                            }
                        })
                        $(".pressCenter-link").on("click", function (e) {
                            e.preventDefault();
                            var href = $(this).attr("href");
                            if ($('.in-page-news-main').attr('open-in-new-tab') === 'true') {
                                window.open(href, "_blank");
                            } else {
                                window.location.href = href;
                            }
                        })

                        if ($(".twoCards").length > 0) {
                            $(".in-page-news-main .in-page__cards-wrapper ul#inpage-news-list-card-view li img").addClass("imageTwoCards");
                            $(".in-page-news-main .in-page__cards-wrapper ul#inpage-news-list-card-view li ").addClass("liTwoCards");
                        }

                        if (window.innerWidth <= 767) {
                            $(".showArticles").removeClass("hidden");
                            $(".showArticles span").addClass("showMobileArticles");
                            $(".showArticles span").text(Granite.I18n.get("Show") + " " + resultData.numFound + " " + Granite.I18n.get("Articles"));
                            $(".showArticles span").text("Show " + resultData.numFound + " Articles");
                        } else if (window.innerWidth > 767 && window.innerWidth <= 1024) {
                            $(".showArticles").removeClass("hidden");
                            $(".showArticles span").addClass("showTabletArticles");
                            $(".showArticles span").text(Granite.I18n.get("Show") + " " + resultData.numFound + " " + Granite.I18n.get("Articles"));
                        }

                        $(".pressCenter-link").each(function () {
                            $(this).click(function (event) {
                                event.stopPropagation();
                                event.preventDefault();
                                window.open($(this).attr('href'), '_blank');
                            })
                        })
                        if ($(".mainChipContainer").children().length > 0) {
                            $(".mainChipContainer").css("display", "flex");
                        }
                        else {
                            $(".mainChipContainer").css("display", "none");
                        }
                        $(document).ready(function () {
                            _this.updatePages();
                            _this.shortenUrls();
                        });
                    }
                });
            return xhr;
        },
        getFirstTag: function (tags) {
            if (typeof tags !== "string") return '';

            let resultTags = tags != undefined ? tags : '';
            if (Array.isArray(resultTags)) {
                let tagArray = resultTags[0].split("/");
                resultTags = tagArray[tagArray.length - 1];
            } else if (tags && tags !== '') {
                let tagArray = tags.split("/");
                resultTags = tagArray[tagArray.length - 1];
            }
            resultTags = resultTags.split(":").pop();
            if (resultTags != "") resultTags = resultTags[0].toUpperCase() + resultTags.slice(1);
            return resultTags;
        },
        getImgAltText: function (imagePath) {
            let imgPathArr = imagePath.split('/');
            let altText = imgPathArr[imgPathArr.length - 1];
            altText = altText.replace(/[.](.*)/, '');
            return altText;
        },
        loadFreshAfterNewsOrFilter: function () {
            currentNewsPage = 0;
            $('#inpage-news-list-list-view').html("");
            $('#inpage-news-list-card-view').html("");
            $('#news-pagination-here').html('');
            this.queryAPI();
        },
        updateNewsStringInUrl: function () {
            const newsString = $('#news-text').val().trim();
            if (newsString) {
                const tempUrl = this.urlParameterValues[2] !== "" ? `${this.urlParameterValues[0]}.q=${newsString}.tag=${this.urlParameterValues[2]}.html` : `${this.urlParameterValues[0]}.q=${newsString}.html`
                history.pushState({}, null, tempUrl);
                this.urlParameterValues[1] = newsString;
                this.loadFreshAfterNewsOrFilter();
            }
        },
        onInput: function () {
            let val = $('#news-text').val().trim();
            if (val) {
                $('.news-bar').removeClass('news-bar-hover');
                $('.news-bar').addClass('news-bar-focus');
                $('.news-form .clear-news-query').removeClass('hidden');
            } else {
                $('.news-bar').removeClass('news-bar-focus');
                $('.news-form .clear-news-query').addClass('hidden');
            }
        },
        onClose: function () {
            let that = this;
            $("#news-text").val('');
            $('.news-form .clear-news-query').addClass('hidden');
            $sortByWrapper.addClass('hidden');
            const tempUrl = this.urlParameterValues[2] !== "" ? `${this.urlParameterValues[0]}.tag=${this.urlParameterValues[2]}.html` : `${this.urlParameterValues[0]}.html`
            history.pushState({}, null, tempUrl);
            this.urlParameterValues[1] = '';
            that.loadFreshAfterNewsOrFilter();
        },
        bindEvent: function () {
            let that = this;
            $("#news-text").on('input', this.onInput.bind(this));
            $('.news-form .clear-news-query').on('click', this.onClose.bind(this));
            $("#news-text").on('keypress', function (e) {
                if (e.which == 13) {
                    that.updateNewsStringInUrl();
                }
            });
            $("#news-button").on('click', function (e) {
                that.updateNewsStringInUrl();
            });
            $(".news-bar").on('mouseenter', function () {
                $(this).addClass("news-bar-hover");
            });
            $(".news-bar").on('mouseleave', function () {
                $(this).removeClass("news-bar-hover");
                $(this).removeClass("news-bar-focus");
            });
            // Click tracker for right arrow in pagination, either unhides page's results or loads in the page's results
            // if the page hasn't been visited before
            $(document).on('click', '.js-load-more', function (e) {
                e.preventDefault();
                $(window).scrollTop(0);
                currentNewsPage++;
                let resultNumCheck;
                if ($(".threeSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 4;
                }
                else if ($(".oneSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 2;
                }
                else {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 1;
                }
                if ($(`${resultItemNewsResultNum}${resultNumCheck}${closingSquareParenthesis}`).length !== 0) {
                    that.updatePages();
                } else {
                    that.loadMore(currentNewsPage - 1);
                }
            });
            // Click tracker for left arrow in pagination, either unhides page's results or loads in the page's results
            // if the page hasn't been visited before
            $(document).on('click', '.js-load-less', function (e) {
                e.preventDefault();
                $(window).scrollTop(0);
                currentNewsPage--;
                let resultNumCheck;
                if ($(".threeSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 4;
                }
                else if ($(".oneSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 2;
                }
                else {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 1;
                }
                if ($(`${resultItemNewsResultNum}${resultNumCheck}${closingSquareParenthesis}`).length !== 0) {
                    that.updatePages();
                } else {
                    that.loadMore(currentNewsPage - 1);
                }
            });
            // Click tracker for left arrow in pagination, either unhides page's results or loads in the page's results
            // if the page hasn't been visited before
            $(document).on('change', '.result-page', function (e) {
                e.preventDefault();
                $(window).scrollTop(0);
                let $clickedItem = $(this);
                let inputValue = $(this).val();
                if (inputValue == '') {
                    inputValue = 1;
                }
                var maxInput = $(".totalPagesNews").text();
                if (maxInput - inputValue < 0) {
                    inputValue = maxInput;
                }
                $clickedItem.attr('id', inputValue);
                $clickedItem.val(inputValue);
                let clickedIndex = inputValue;
                currentNewsPage = clickedIndex - 1;
                let resultNumCheck;
                if ($(".threeSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 4;
                }
                else if ($(".oneSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 2;
                }
                else {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 1;
                }
                if ($(`${resultItemNewsResultNum}${resultNumCheck}${closingSquareParenthesis}`).length !== 0) {
                    that.updatePages();
                } else {
                    that.loadMore(currentNewsPage - 1);
                }
            });
            $(document).on('click', '.firstactive', function (e) {
                e.preventDefault();
                $(window).scrollTop(0);
                let $clickedItem = $(this);
                let inputValue = 1;
                $clickedItem.val(inputValue);
                let clickedIndex = 1;
                currentNewsPage = clickedIndex - 1;
                let resultNumCheck;
                if ($(".threeSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 4;
                }
                else if ($(".oneSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 2;
                }
                else {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 1;
                }
                if ($(`${resultItemNewsResultNum}${resultNumCheck}${closingSquareParenthesis}`).length !== 0) {
                    that.updatePages();
                } else {
                    that.loadMore(currentNewsPage - 1);
                }
            });
            $(document).on('click', '.lastactive', function (e) {
                e.preventDefault();
                $(window).scrollTop(0);
                let $clickedItem = $(this);
                let inputValue = $(".totalPagesNews").text();
                $clickedItem.val(inputValue);
                let clickedIndex = inputValue;
                currentNewsPage = clickedIndex - 1;
                let resultNumCheck;
                if ($(".threeSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 4;
                }
                else if ($(".oneSearch").length > 0) {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 2;
                }
                else {
                    resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 1;
                }
                if ($(`${resultItemNewsResultNum}${resultNumCheck}${closingSquareParenthesis}`).length !== 0) {
                    that.updatePages();
                } else {
                    that.loadMore(currentNewsPage - 1);
                }
            });
            // "Sort By" Toggle
            var newsMethod = localStorage.getItem('news-news-inpage');
            if (newsMethod && newsMethod === 'score') {
                $('.data-toggle .date-on').removeClass('active');
                $('.data-toggle .date-off').addClass('active');
            } else {
                $('.data-toggle .date-on').addClass('active');
                $('.data-toggle .date-off').removeClass('active');
            }
            $('.data-toggle .data-tog').click(function () {
                $(this).parent().find('.data-tog').removeClass('active');
                $(this).addClass('active');
                if ($(this).hasClass('date-on')) {
                    localStorage.setItem('news-news-inpage', 'date');
                } else if ($(this).hasClass('date-off')) {
                    localStorage.setItem('news-news-inpage', 'score');
                }
                window.location.reload();
            });
        },
        loadMore: function () {
            const that = this;
            let xhr = null;
            let resultNumCheck;
            if ($(".threeSearch").length > 0) {
                resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 4;
            }
            else if ($(".oneSearch").length > 0) {
                resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 2;
            }
            else {
                resultNumCheck = (currentNewsPage * RECORD_PER_PAGE) + 1;
            }
            if ($(`${resultItemNewsResultNum}${resultNumCheck}${closingSquareParenthesis}`).length === 0) {
                INDEX_COUNTER_NEWS = INDEX_COUNTER_NEWS + 1;
                xhr = this.queryAPI();
                xhr.always(function (data) {
                    that.updatePages();
                });
            }
        },
        updatePages: function () {
            $('#news-pagination-here').html('');
            let totalnews = this.resultsTotal;
            let pages = 1;
            let firstPageThree = true && $(".threeSearch").length > 0;
            let firstPageOne = true && $(".oneSearch").length > 0;
            // Calculate total number of pages for pagination
            while (totalnews - (firstPageThree ? (RECORD_PER_PAGE + 3) : firstPageOne ? (RECORD_PER_PAGE + 1) : RECORD_PER_PAGE) > 0) {
                if (firstPageThree) {
                    totalnews = totalnews - (RECORD_PER_PAGE + 3);
                    firstPageThree = false;
                }
                else if (firstPageOne) {
                    totalnews = totalnews - (RECORD_PER_PAGE + 1);
                    firstPageOne = false;
                }
                else {
                    totalnews = totalnews - RECORD_PER_PAGE;
                }
                pages++;
            }
            $(".news-result-tag:not([class*='hidden'])").addClass('hidden');
            const beginning = currentNewsPage * RECORD_PER_PAGE;
            const end = (currentNewsPage * RECORD_PER_PAGE + RECORD_PER_PAGE);
            const newsPageNumActiveString = '<input class="news-page-num result-page active" id="';
            const inputVal = '" value=';
            const newsNewsPageNumString = '<div class="news-page-num result-page" id="';
            const currentNewsPageInt = parseInt(currentNewsPage);
            //Go through pages & hide / unhide results based on current page
            if ($('.featured-article').hasClass("oneSearch") && this.resultsTotal > 1 && ($('#news-text').length == 0 || $('#news-text').val().length == 0)) {
                for (let i = 0; i <= pages; i++) {
                    if (i === currentNewsPageInt) {
                        for (let j = beginning + 2; j <= end + 1; j++) {
                            $('.news-result-tag').each(function () {
                                if ($(this).attr('data-result-num') == j) {
                                    $(this).removeClass('hidden');
                                }
                            });
                        }
                    }
                }
            } else if ($('.featured-article').hasClass("threeSearch") && this.resultsTotal > 3 && ($('#news-text').length == 0 || $('#news-text').val().length == 0)) {
                for (let i = 0; i <= pages; i++) {
                    if (i === currentNewsPageInt) {
                        for (let j = beginning + 4; j <= end + 3; j++) {
                            $('.news-result-tag').each(function () {
                                if ($(this).attr('data-result-num') == j) {
                                    $(this).removeClass('hidden');
                                }
                            });
                        }
                    }
                }
            } else {
                for (let i = 0; i <= pages; i++) {
                    if (i === currentNewsPageInt) {
                        for (let j = beginning + 1; j <= end; j++) {
                            $('.news-result-tag').each(function () {
                                if ($(this).attr('data-result-num') == j) {
                                    $(this).removeClass('hidden');
                                }
                            });
                        }
                    }
                }
            }
            // Generate HTML to be appended to DOM to build up pagination
            let newsPagingationHtmlPartOne = '';
            if (currentNewsPageInt === 0) {
                newsPagingationHtmlPartOne = '<div class="news-pagination-parent">' +
                    '<div class="first">First</div>' +
                    '<div class="news-page-arrow notactive news-page-lower">' +
                    '<i class="icon-Left-Chevron font-fix focus-icon"></i>' +
                    '</div>';
            } else {
                newsPagingationHtmlPartOne = '<div class="news-pagination-parent">' +
                    '<div class="firstactive">First</div>' +
                    '<div class="news-page-arrow news-page-lower js-load-less active">' +
                    '<i class="icon-Left-Chevron font-fix focus-icon"></i>' +
                    '</div>';
            }
            let newsPagingationHtmlPartThree = '';
            if ((currentNewsPage + 1) == pages) {
                newsPagingationHtmlPartThree = '<div class="news-page-arrow news-page-higher notactive">' +
                    '<i class="icon-Right-Chevron font-fix focus-icon"></i>' +
                    '</div>' +
                    '<div class="last">Last</div>' +
                    '</div>';
            } else {
                newsPagingationHtmlPartThree = '<div class="news-page-arrow news-page-higher js-load-more active">' +
                    '<i class="icon-Right-Chevron font-fix focus-icon"></i>' +
                    '</div>' +
                    '<div class="lastactive">Last</div>' +
                    '</div>';
            }
            let k = currentNewsPageInt + 1;
            let newsPagingationHtmlPartTwo = newsPageNumActiveString + k + inputVal + k + rightTag + "<div>of</div>" + "<div class='totalPagesNews' >" + pages + "</div>";

            const newsPagingationHtml = newsPagingationHtmlPartOne + newsPagingationHtmlPartTwo + newsPagingationHtmlPartThree;
            // Only append pagination portion if there's more than one page
            const noDataFound = '<div class="no-result-found-container">' +
                '<div class="no-results-found-text-title">' + Granite.I18n.get("Sorry! Looks like there are no results. Please try again with a new search term.") +
                '</div>' +
                '</div>'
            if (pages > 1) {
                $('#news-pagination-here').append(newsPagingationHtml);
                $('.no-result-found-container').remove();
            } else if (totalnews > 0) {
                $('.no-result-found-container').remove();
            } else if (totalnews == 0) {
                if ($('.no-result-found-container').length == 0) {
                    $('.in-page-news-right').append(noDataFound);
                }
            }
        },
        shortenUrls: function () {
            let basePathEle = document.getElementById("useShortUrls");
            let replaceBasePathEle = document.getElementById("useReplaceShortUrls");
            if (basePathEle !== null) {
                let basePath = basePathEle.attributes.content.value;
                let replaceBasePath;
                if (replaceBasePathEle && replaceBasePathEle.attributes && replaceBasePathEle.attributes.content)
                    replaceBasePath = replaceBasePathEle.attributes.content.value;

                if ($(".in-page-search-2\\.0").length > 0) {
                    linksArr = $(".in-page-search-2\\.0")[0].getElementsByTagName("a");
                    Array.from(linksArr).forEach((link) => {
                        if (link.attributes.href !== undefined && link.attributes.href.value.startsWith(basePath)) {
                            shortPath = (replaceBasePath ? replaceBasePath : '') + link.attributes.href.value.split(basePath)[1].split(".html")[0];
                            link.setAttribute('href', shortPath);
                        }
                    });
                }
            }
        }
    });
    // This code controls the click action and performs shows or hide the proper component
    // TODO: Update this logic
    $(".in-page-list-view").on('click', function () {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(".in-page-card-view").removeClass("active");
            $("#inpage-news-list-list-view").removeClass("hidden");
            $("#inpage-news-list-card-view").addClass("hidden");
        }
    });
    $(".in-page-card-view").on('click', function () {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(".in-page-list-view").removeClass("active");
            $("#inpage-news-list-card-view").removeClass("hidden");
            $("#inpage-news-list-list-view").addClass("hidden");
        }
    });

    const $carousel = $('.enable-three-featured-article');
    const $carouselMob = $('.featured-article');
    const $button = $('#scroll-button');
    const $buttonMob = $('#scroll-button-Mobile');
    const itemWidth = 598;
    const itemWidthMob = 336;
    const totalItems = 2;
    let index = 0;
    let currentDiv = 0;
    const totalDiv = 3;
    let lastMobileScroll = 0;
    let lastTabletScroll = 0;
    function updateCarouselTablet() {
        $button.toggleClass('active', index > 0);
    }
    function nextItemTablet() {
        index = (index + 1) % totalItems;
        if (index == 0) {
            $button.css('background', 'linear-gradient(to right,  #0053E2 50%,  #E5E5E5 50%)');
            $carousel.scrollLeft(0);
        } else {
            $button.css('background', 'linear-gradient(to right,   #E5E5E5 50%, #0053E2 50%)');
            $carousel.scrollLeft(598);
        }
        updateCarouselTablet();
    }
    function updateCarouselMobile(currentDiv) {
        $button.toggleClass('active', index > 0);
    }
    function nextItemMobile() {
        currentDiv = (currentDiv + 1) % totalDiv;
        if (currentDiv == 0) {
            $buttonMob.css('background', 'linear-gradient(to right,  #0053e2 33.33%,  #E5E5E5 33.33%,#E5E5E5 33.33%)');
            $carouselMob.scrollLeft(0);
        } else if (currentDiv == 1) {
            $buttonMob.css('background', 'linear-gradient(to right, #E5E5E5 0%, #E5E5E5 33.33%, #0053E2 33.33%, #0053e2 66.66%, #E5E5E5 66.66%)');
            $carouselMob.scrollLeft(337);
        } else if (currentDiv == 2) {
            $buttonMob.css('background', 'linear-gradient(to right, #E5E5E5 0%, #E5E5E5 33.33%, #E5E5E5 33.33%, #E5E5E5 66.66%, #0053e2 66.66%)');
            $carouselMob.scrollLeft(674);
        }
        updateCarouselMobile(currentDiv);
    }
    $('.enable-three-featured-article').on('scroll', function (event) {
        if (lastTabletScroll < 230 && $('.enable-three-featured-article')[0].scrollLeft >= 230) {
            $button.css('background', 'linear-gradient(to right,   #E5E5E5 50%, #0053E2 50%)');
        } else if (lastTabletScroll >= 230 && $('.enable-three-featured-article')[0].scrollLeft < 230) {
            $button.css('background', 'linear-gradient(to right,  #0053E2 50%,  #E5E5E5 50%)');
        }
        lastTabletScroll = $('.enable-three-featured-article')[0].scrollLeft;
    });
    $('.featured-article').on('scroll', function (event) {
        if (lastMobileScroll >= 337 && $('.featured-article')[0].scrollLeft < 337) {
            $buttonMob.css('background', 'linear-gradient(to right,  #0053e2 33.33%,  #E5E5E5 33.33%,#E5E5E5 33.33%)');
        } else if ((lastMobileScroll >= 630 || lastMobileScroll < 337) && $('.featured-article')[0].scrollLeft >= 337 && $('.featured-article')[0].scrollLeft < 630) {
            $buttonMob.css('background', 'linear-gradient(to right, #E5E5E5 0%, #E5E5E5 33.33%, #0053e2 33.33%, #0053e2 66.66%, #E5E5E5 66.66%)');
        } else if (lastMobileScroll < 630 && $('.featured-article')[0].scrollLeft >= 630) {
            $buttonMob.css('background', 'linear-gradient(to right, #E5E5E5 0%, #E5E5E5 33.33%, #E5E5E5 33.33%, #E5E5E5 66.66%, #0053e2 66.66%)');
        }
        lastMobileScroll = $('.featured-article')[0].scrollLeft;
    });
    $button.on('click', function () {
        if (window.innerWidth >= 768 && window.innerWidth <= 1024)
            nextItemTablet();
    });
    $buttonMob.on('click', function () {
        if (window.innerWidth <= 767) {
            nextItemMobile();
        }
    });
    $(document).ready(function () {

        if (typeof showInternationalDate !== 'undefined' && showInternationalDate) {
            $(".in-page__date-featured-article").each(function () {
                var orgindate = $(this).text();
                var dateobjj = new Date(orgindate);
                var year = dateobjj.getFullYear();
                var month = (dateobjj.getMonth() + 1).toString().padStart(2, '0');
                var day = (dateobjj.getDate().toString().padStart(2, '0'));
                var formattedArticleDate = `${year}-${month}-${day}`;
                $(this).text(formattedArticleDate);
            })
        }

        let heightHeaderAll = $("#header-container").height();
        $(".scroll-button-Mobile").css("display", "none");

        if ($(".oneManualArticle").length > 0) {
            $(".featured-article.oneManualArticle").css('height', "auto");
            $(".scroll-button").css("display", "none");
            $(".scroll-button-Mobile").css("display", "none");
            if (window.innerWidth <= 767) {
                $(".featured-article.oneManualArticle").css('width', "auto");
                $(".featured-article.oneManualArticle").css('display', "flex");
                $(".featured-article.oneManualArticle").css('justify-content', "center");
            }
        }

        if ($(".news-bar").length == 0 && window.innerWidth <= 1024) {
            $(".filter-tablet-icon").addClass("noBarIcon");
            $(".filter-tablet-icon.active").addClass("noBarIcon");
            $(".filter-mobile-icon.active").addClass("noBarIcon");
            $(".filter-mobile-icon").addClass("noBarIcon");
        }
        setTimeout(function () {
            let filterCount = 0;
            var $dropdownItemsClear = $('.in-page-news-main').find('.dropdown-item');
            var $clearAllLeft = $('.in-page-news-main .clear-all');
            $dropdownItemsClear.each(function () {
                if ($(this).prop("checked") == true) {
                    filterCount++;
                }
            });
            if (filterCount == 0) {
                $clearAllLeft.hide();

            } else {
                $clearAllLeft.show();
            }
        }, 300);

        if ($(".in-page-search-bar-container").length > 0) {
            if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
                $(".filter-mobile-icon").hide();
                $(".filter-tablet-icon-active").addClass("hidden");
                $(document).scroll(function () {
                    let $inPageSearchBar = $(".in-page-search-bar-container");

                    if ($('.featured-article').hasClass("oneSearch")) {
                        $inPageSearchBar.css('top', heightHeaderAll + 15);

                        if ($inPageSearchBar.position().top - $(window).scrollTop() <= 15) {
                            $inPageSearchBar.css('position', 'fixed')
                        }
                        if ($('.start-of-inpage-component').position().top - $(window).scrollTop() > 35) {
                            $inPageSearchBar.css('position', 'sticky')
                        }
                    }

                    if ($('.featured-article').hasClass("threeSearch")) {
                        $inPageSearchBar.css('top', heightHeaderAll + 15);
                        if ($inPageSearchBar.position().top - $(window).scrollTop() <= 15) {
                            $inPageSearchBar.css('position', 'fixed')
                        }
                        if ($('.start-of-inpage-component').position().top - $(window).scrollTop() > 60) {
                            $inPageSearchBar.css('position', 'static')
                        }
                    }

                    if ($('.featured-article').not("threeSearch") && $('.featured-article').not("oneSearch")) {
                        if ($('.in-page-search-bar-container').position().top - $(window).scrollTop() <= 15) {
                            $inPageSearchBar.css('top', heightHeaderAll + 15);
                            $inPageSearchBar.css('position', 'fixed')
                        }
                        if ($('.start-of-inpage-component').position().top - $(window).scrollTop() >= 10) {
                            $inPageSearchBar.css('position', 'static')
                            $inPageSearchBar.css('top', "");
                        }
                    }

                    if ($('.end-of-inpage-component').position().top - $(window).scrollTop() < 15) {
                        $inPageSearchBar.css('position', 'static')
                    }

                });

            } else if (window.innerWidth <= 767) {
                $(".filter-tablet-icon").hide();
                $(".filter-mobile-icon-active").addClass("hidden");
                $(document).scroll(function () {
                    let $inPageSearchBar = $(".in-page-search-bar-container");

                    if ($('.featured-article').hasClass("oneSearch")) {
                        $inPageSearchBar.css('top', heightHeaderAll + 15);
                        if ($inPageSearchBar.position().top - $(window).scrollTop() <= 15) {
                            $inPageSearchBar.css('position', 'fixed')
                        }
                        if ($('.start-of-inpage-component').position().top - $(window).scrollTop() > 35) {
                            $inPageSearchBar.css('position', 'sticky')
                        }
                    }

                    if ($('.featured-article').hasClass("threeSearch")) {
                        $inPageSearchBar.css('top', heightHeaderAll + 15);
                        if ($inPageSearchBar.position().top - $(window).scrollTop() <= 15) {
                            $inPageSearchBar.css('position', 'fixed')
                        }
                        if ($('.start-of-inpage-component').position().top - $(window).scrollTop() > 65) {
                            $inPageSearchBar.css('position', 'sticky')
                        }
                    }

                    if ($('.featured-article').not("threeSearch") && $('.featured-article').not("oneSearch")) {
                        $inPageSearchBar.css('top', 0);

                        if ($('.in-page-search-bar-container').position().top - $(window).scrollTop() <= 15) {
                            $inPageSearchBar.css('top', heightHeaderAll + 15);
                            $('.in-page-search-bar-container').css('position', 'fixed')
                        }
                        if ($('.start-of-inpage-component').position().top - $(window).scrollTop() > 10) {
                            $('.in-page-search-bar-container').css('position', 'sticky')
                            $inPageSearchBar.css('top', 0);
                        }
                        if ($('.end-of-inpage-component').position().top - $(window).scrollTop() < 15) {
                            $inPageSearchBar.css('position', 'sticky')
                        }
                    }
                });
            } else {
                $(".filter-mobile-icon").hide();
                $(".filter-tablet-icon").hide();
            }
        }
        var $overlayPanel = $(".in-page-news-left");
        var $overlayButton = $('.filter-tablet-icon');
        var $overlayMobileButton = $('.filter-mobile-icon');
        var $overlay = $("#overlay-in-page-search");

        if (window.innerWidth > 1025) {
            $overlayPanel.css('max-height', $(window).innerHeight() - $("#header-container").height() - 20);
        }

        $overlayButton.on('click', function () {
            $overlay.fadeIn();
            $overlayPanel.addClass('openOverlay overlay-tablet-left');
            $('body').addClass('no-scroll');
            $('.content-container').addClass('no-scroll');
            if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
                let heightHeader = $("#header-container").height();
                let heightLeftPanel = $(window).height() - heightHeader;
                $(".in-page-news-left").css('top', heightHeader);
                $(".in-page-news-left").css('height', heightLeftPanel);
                let heightDropdownReady = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 235;
                $(".in-page-news-filter-tags").css('height', heightDropdownReady);
            }

        });
        $overlayMobileButton.on('click', function () {
            $overlay.fadeIn();
            $overlayPanel.addClass('openOverlay overlay-tablet-left');
            $('body').addClass('no-scroll');
            $('.content-container').addClass('no-scroll');
            if (window.innerWidth <= 767) {
                let heightHeader = $("#header-container").height();
                let heightLeftPanel = $(window).height() - heightHeader;
                $(".in-page-news-left").css('top', heightHeader);
                $(".in-page-news-left").css('height', heightLeftPanel);
                let heightDropdownReady = $(window).height() - $("#header-container").height() - $(".left-chip-container").height() - 247;
                $(".in-page-news-filter-tags").css('height', heightDropdownReady);
            }
        });
        $overlay.on('click', function (event) {
            if (!$(event.target).closest('.in-page-news-left').length) {
                $overlay.fadeOut();
                $overlayPanel.removeClass('openOverlay overlay-tablet-left');
                $('body').removeClass('no-scroll');
                $('.content-container').removeClass('no-scroll');
            }
        })
        $overlayPanel.on("click", function (event) {
            event.stopPropagation();
        })
        $(".showArticles").on("click", function (event) {
            $(".content-container").css('position', 'relative');
            $overlay.fadeOut();
            $overlayPanel.removeClass('openOverlay overlay-tablet-left');
            $('body').removeClass('no-scroll');
            $('.content-container').removeClass('no-scroll');
        });

        if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
            var $chipContainerMain = $(".chip-container").clone();
            $chipContainerMain.insertAfter($(".in-page-search-bar"));
            $chipContainerMain.removeClass("left-chip-container");
            $chipContainerMain.addClass("mainChipContainer");

        }
    });

    $(window).resize(function () {
        if ($('div').hasClass('in-page-news-main')) {
            if (lastWindowSize === "") {
                if ($(window).width() < 768) {
                    lastWindowSize = 'mobile'
                } else if ($(window).width() < 1024) {
                    lastWindowSize = 'tablet'
                } else {
                    lastWindowSize = 'desktop'
                }
            }
            if ($(window).width() < 768 && lastWindowSize !== 'mobile') {
                lastWindowSize = 'mobile'
                location.reload()
            } else if ($(window).width() < 1024 && $(window).width() > 768 && lastWindowSize !== 'tablet') {
                lastWindowSize = 'tablet'
                location.reload()
            } else if ($(window).width() > 1024 && lastWindowSize !== 'desktop') {
                lastWindowSize = 'desktop'
                location.reload()
            }
        }
    });



    jQuery(function () {
        var inPageNews = jQuery('.in-page-news-main');
        jQuery.each(inPageNews, function () {
            var inPageNews = new ADP.Components.Classes.InPageNews(jQuery(this));
        });
    });
}(ADP, jQuery));