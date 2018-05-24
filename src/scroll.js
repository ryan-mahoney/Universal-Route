export const getScrollPosition = () => ({
  y: window.pageYOffset || document.documentElement.scrollTop,
  x: window.pageXOffset || document.documentElement.scrollLeft
});

export const setScrollToSessionStorage = () => {
  const path = window.location.pathname;
  const data = JSON.stringify(
    Object.assign({}, getScrollFromSessionStorage("*") || {}, {
      path: getScrollPosition()
    })
  );
  sessionStorage.setItem("scroll", data);
};

export const getScrollFromSessionStorage = url => {
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