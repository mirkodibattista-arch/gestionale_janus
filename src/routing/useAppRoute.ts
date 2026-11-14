import { useEffect, useState } from "react";
import { navigate, parseRoute } from "./routes";

const locationKey = () =>
  window.location.pathname + window.location.search + window.location.hash;
export function useAppRoute() {
  const [location, setLocation] = useState(locationKey);
  useEffect(() => {
    const update = () => setLocation(locationKey());
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof window.Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Native section anchors keep the existing public-page scrolling.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash &&
        !url.hash.startsWith("#/")
      )
        return;
      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
      document.removeEventListener("click", click);
    };
  }, []);
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !hash.startsWith("#/"))
      document.getElementById(hash.slice(1))?.scrollIntoView?.();
  }, [location]);
  const hashIndex = location.indexOf("#/");
  return parseRoute(hashIndex >= 0 ? location.slice(hashIndex) : location);
}
