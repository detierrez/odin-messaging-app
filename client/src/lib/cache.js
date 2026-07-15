import PubSub from "@lib/pubsub";

const cache = {
  _cache: {},
  _fetchingList: new Set(),
  _pubsub: new PubSub(),

  get(key) {
    return this._cache[key];
  },

  set(key, value) {
    if (typeof value === "function") {
      value = value(this.get(key));
    }
    this._cache[key] = value;
    this._pubsub.publish(key, value);
    return this.get(key);
  },

  isFetching(key) {
    return this._fetchingList.has(key);
  },

  isEmpty(key) {
    return !this.get(key) && !this.isFetching(key);
  },

  fetch(key, fetchFn) {
    const controller = new AbortController();
    const { signal } = controller;
    const abortError = new Error("Abort Error");

    this._fetchingList.add(key);
    awaitFetch();

    // cleanup
    return () => {
      if (this.isFetching(key)) {
        controller.abort(abortError);
        this._fetchingList.delete(key);
      }
    };

    async function awaitFetch() {
      try {
        cache.set(key, await fetchFn(signal));
        cache._fetchingList.delete(key);
      } catch (error) {
        if (error !== abortError) {
          cache.set(key, error);
          cache._fetchingList.delete(key);
        }
      }
    }
  },

  subscribe(key, handle) {
    return this._pubsub.subscribe(key, handle);
  },
};

export default cache;
