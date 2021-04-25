export const getScrollPosition = () => ({
  y: window.pageYOffset || document.documentElement.scrollTop,
  x: window.pageXOffset || document.documentElement.scrollLeft
});

export const setScrollToSessionStorage = () =>
  !sessionStorage
    ? "{}"
    : sessionStorage.setItem(
        "scroll",
        JSON.stringify(
          Object.assign({}, getScrollFromSessionStorage("*") || {}, {
            [window.location.pathname]: getScrollPosition()
          })
        )
      );

export const getScrollFromSessionStorage = url => {
  if (!sessionStorage) return null;
  const blob = sessionStorage.getItem("scroll");
  if (!blob) {
    return null;
  }
  const data = JSON.parse(blob);
  if (url == "*") {
    return data;
  }
  return data[url] || null;
};
