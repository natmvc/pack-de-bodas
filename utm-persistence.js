(function () {
  'use strict';

  var STORAGE_KEY = 'packBodasTrackingParams';
  var CHECKOUT_HOST = 'pay.kiwify.com.br';

  function readStoredParams() {
    try {
      var rawParams = window.localStorage.getItem(STORAGE_KEY);
      var parsedParams = rawParams ? JSON.parse(rawParams) : [];

      return Array.isArray(parsedParams) ? parsedParams : [];
    } catch (error) {
      return [];
    }
  }

  function saveCurrentUrlParams() {
    var currentParams = new URLSearchParams(window.location.search);
    var paramsToStore = Array.from(currentParams.entries());

    if (!paramsToStore.length) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(paramsToStore));
    } catch (error) {
      // If localStorage is unavailable, links still keep their original URLs.
    }
  }

  function isKiwifyCheckoutLink(linkUrl) {
    return linkUrl.hostname === CHECKOUT_HOST;
  }

  function applyStoredParamsToLink(link) {
    var storedParams = readStoredParams();

    if (!storedParams.length || !link || !link.href) {
      return;
    }

    try {
      var linkUrl = new URL(link.href, window.location.href);

      if (!isKiwifyCheckoutLink(linkUrl)) {
        return;
      }

      storedParams.forEach(function (param) {
        var key = param[0];
        var value = param[1];

        if (key && !linkUrl.searchParams.has(key)) {
          linkUrl.searchParams.append(key, value);
        }
      });

      link.href = linkUrl.toString();
    } catch (error) {
      // Invalid or unsupported URLs are ignored without changing the page.
    }
  }

  function applyStoredParamsToAllLinks() {
    document.querySelectorAll('a[href]').forEach(applyStoredParamsToLink);
  }

  function applyStoredParamsBeforeNavigation(event) {
    var link = event.target.closest && event.target.closest('a[href]');

    applyStoredParamsToLink(link);
  }

  function watchFutureCheckoutLinks() {
    var observer = new MutationObserver(applyStoredParamsToAllLinks);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  saveCurrentUrlParams();

  document.addEventListener('DOMContentLoaded', function () {
    applyStoredParamsToAllLinks();
    watchFutureCheckoutLinks();
  });

  document.addEventListener('click', applyStoredParamsBeforeNavigation, true);
  document.addEventListener('auxclick', applyStoredParamsBeforeNavigation, true);
  document.addEventListener('pointerdown', applyStoredParamsBeforeNavigation, true);
})();
